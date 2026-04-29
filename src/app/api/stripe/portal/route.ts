import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe カスタマーポータルセッションを作成する。
 * ユーザーはここから解約・プラン変更・支払い方法変更ができる。
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 }
      );
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Portal] Error:", error);
    return NextResponse.json(
      { error: "ポータルセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
