import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe Webhook ハンドラ
 *
 * 処理するイベント:
 * - checkout.session.completed: 新規サブスクリプション開始
 * - customer.subscription.updated: プラン変更・更新
 * - customer.subscription.deleted: 解約
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.subscription
          ? (
              (await stripe.subscriptions.retrieve(
                session.subscription as string
              )) as Stripe.Subscription
            ).metadata.supabase_user_id
          : session.metadata?.supabase_user_id;

        if (userId) {
          await updateUserPlan(adminSupabase, userId, "premium");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabase_user_id;
        if (!userId) break;

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await updateUserPlan(
          adminSupabase,
          userId,
          isActive ? "premium" : "free"
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabase_user_id;
        if (userId) {
          await updateUserPlan(adminSupabase, userId, "free");
        }
        break;
      }

      default:
        // 他のイベントは無視
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * user_usage テーブルの plan カラムを更新する。
 * 当月のレコードが無い場合は upsert で作成する。
 */
async function updateUserPlan(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  plan: "free" | "premium"
) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { error } = await supabase.from("user_usage").upsert(
    {
      user_id: userId,
      month,
      plan,
    },
    { onConflict: "user_id,month" }
  );

  if (error) {
    console.error("[Stripe Webhook] Failed to update user plan:", error);
    throw error;
  }

  // user_profiles にもサブスクリプション状態を保存
  await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      plan,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  console.log(
    `[Stripe Webhook] Updated user ${userId} to plan: ${plan} (month: ${month})`
  );
}
