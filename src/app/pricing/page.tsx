"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X, Sparkles, Loader2, Crown } from "lucide-react";

import { PLANS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";

type BillingInterval = "monthly" | "yearly";

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-app-text-muted">読み込み中...</div>}>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, signInWithGoogle } = useAuth();
  const { usage } = useUsage();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  const isPremium = usage?.plan === "premium";

  const price =
    interval === "monthly"
      ? PLANS.premium.price.monthly
      : PLANS.premium.price.yearly;

  const priceLabel =
    interval === "monthly"
      ? `¥${PLANS.premium.price.monthly}/月`
      : `¥${PLANS.premium.price.yearly}/年`;

  const monthlySaving =
    interval === "yearly"
      ? PLANS.premium.price.monthly * 12 - PLANS.premium.price.yearly
      : 0;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      await signInWithGoogle();
      return;
    }

    setIsLoading(true);
    try {
      const priceId =
        interval === "monthly"
          ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

      // priceId が未設定の場合は env の STRIPE_MONTHLY_PRICE_ID を使う
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:
            priceId ??
            (interval === "monthly"
              ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
              : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID),
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:py-16">
      {/* Success / Cancel Messages */}
      {success && (
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
          Premium プランへのアップグレードが完了しました！
        </div>
      )}
      {canceled && (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-amber-800">
          購入がキャンセルされました。いつでも再開できます。
        </div>
      )}

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-2xl font-bold text-app-text sm:text-3xl">
          料金プラン
        </h1>
        <p className="text-app-text-secondary">
          あなたに合ったプランを選んで、レシピ管理を始めましょう
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setInterval("monthly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            interval === "monthly"
              ? "bg-app-primary text-white"
              : "bg-app-surface text-app-text-secondary hover:bg-app-border"
          }`}
        >
          月額
        </button>
        <button
          onClick={() => setInterval("yearly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            interval === "yearly"
              ? "bg-app-primary text-white"
              : "bg-app-surface text-app-text-secondary hover:bg-app-border"
          }`}
        >
          年額
          <span className="ml-1 text-xs">
            (¥{monthlySaving.toLocaleString()}おトク)
          </span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
        {/* Free Plan */}
        <div className="rounded-2xl border border-app-border bg-white p-6">
          <h2 className="mb-1 text-lg font-bold text-app-text">Free</h2>
          <p className="mb-4 text-sm text-app-text-muted">
            まずは無料で試してみる
          </p>
          <div className="mb-6">
            <span className="text-3xl font-bold text-app-text">¥0</span>
            <span className="text-sm text-app-text-muted">/月</span>
          </div>
          <ul className="mb-6 space-y-3">
            <FeatureItem included>
              月 {PLANS.free.monthlyExtractionLimit} 回のレシピ抽出
            </FeatureItem>
            <FeatureItem included>
              レシピ保存 {PLANS.free.recipeStorageLimit} 件まで
            </FeatureItem>
            <FeatureItem included>買い物リスト</FeatureItem>
            <FeatureItem>クラウド同期</FeatureItem>
            <FeatureItem>月 {PLANS.premium.monthlyExtractionLimit} 回のレシピ抽出</FeatureItem>
          </ul>
          <button
            disabled
            className="w-full rounded-xl border border-app-border py-3 text-sm font-semibold text-app-text-muted"
          >
            現在のプラン
          </button>
        </div>

        {/* Premium Plan */}
        <div className="relative rounded-2xl border-2 border-app-primary bg-white p-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 rounded-full bg-app-primary px-3 py-1 text-xs font-bold text-white">
              <Sparkles className="h-3 w-3" />
              おすすめ
            </span>
          </div>

          <h2 className="mb-1 text-lg font-bold text-app-text">Premium</h2>
          <p className="mb-4 text-sm text-app-text-muted">
            すべての機能を無制限に
          </p>
          <div className="mb-6">
            <span className="text-3xl font-bold text-app-text">
              ¥{price.toLocaleString()}
            </span>
            <span className="text-sm text-app-text-muted">
              /{interval === "monthly" ? "月" : "年"}
            </span>
            {interval === "yearly" && (
              <span className="ml-2 text-xs text-app-primary">
                月あたり ¥{Math.round(PLANS.premium.price.yearly / 12).toLocaleString()}
              </span>
            )}
          </div>
          <ul className="mb-6 space-y-3">
            <FeatureItem included>月 {PLANS.premium.monthlyExtractionLimit} 回のレシピ抽出</FeatureItem>
            <FeatureItem included>レシピ保存 無制限</FeatureItem>
            <FeatureItem included>買い物リスト</FeatureItem>
            <FeatureItem included>クラウド同期</FeatureItem>
            <FeatureItem included>優先サポート</FeatureItem>
          </ul>

          {isPremium ? (
            <button
              onClick={handlePortal}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-app-primary py-3 text-sm font-semibold text-app-primary transition-colors hover:bg-app-primary/5"
            >
              <Crown className="h-4 w-4" />
              サブスクリプションを管理
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-app-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-app-primary-hover disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {priceLabel} で始める
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-app-text-muted">
        サブスクリプションは自動更新されます。いつでもキャンセルできます。
        <br />
        決済は Stripe で安全に処理されます。
      </p>
    </div>
  );
}

// --- Feature Item ---

type FeatureItemProps = {
  included?: boolean;
  children: React.ReactNode;
};

function FeatureItem({ included = false, children }: FeatureItemProps) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {included ? (
        <Check className="h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-app-text-placeholder" />
      )}
      <span className={included ? "text-app-text" : "text-app-text-muted"}>
        {children}
      </span>
    </li>
  );
}
