import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/lib/supabase";
import { SocialButtonBase } from "./social-button-base";
import { GoogleLogo } from "@/components/icons/google-logo";

WebBrowser.maybeCompleteAuthSession();

type GoogleSignInButtonProps = {
  mode?: "signin" | "signup";
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function GoogleSignInButton({
  mode = "signin",
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    console.log("[GoogleSignIn] Starting sign in process...");
    setIsLoading(true);

    try {
      const redirectUrl = makeRedirectUri({
        scheme: "recipi-book",
        path: "auth/callback",
      });
      console.log("[GoogleSignIn] Redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        console.log("[GoogleSignIn] Opening auth session...");
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        console.log("[GoogleSignIn] Auth session result type:", result.type);

        if (result.type === "success" && result.url) {
          console.log("[GoogleSignIn] Auth callback URL:", result.url);

          // URLからセッション情報を抽出
          // Supabaseはハッシュフラグメント（#）の後にトークンを含める場合がある
          const url = new URL(result.url);

          // クエリパラメータからトークンを取得
          let accessToken = url.searchParams.get("access_token");
          let refreshToken = url.searchParams.get("refresh_token");

          // ハッシュフラグメントからも試す
          if (!accessToken && url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1));
            accessToken = hashParams.get("access_token");
            refreshToken = hashParams.get("refresh_token");
          }

          console.log("[GoogleSignIn] Access token found:", !!accessToken);
          console.log("[GoogleSignIn] Refresh token found:", !!refreshToken);

          if (accessToken && refreshToken) {
            console.log("[GoogleSignIn] Setting session...");
            // Supabaseにセッションをセット
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              throw sessionError;
            }

            console.log("[GoogleSignIn] Session set, waiting for state sync...");
            // 認証状態の変更が確実に反映されるまで少し待つ
            await new Promise((resolve) => setTimeout(resolve, 300));

            console.log("[GoogleSignIn] Calling onSuccess...");
            onSuccess?.();
            console.log("[GoogleSignIn] Sign in complete!");
          } else {
            throw new Error("認証情報が取得できませんでした");
          }
        } else if (result.type === "cancel") {
          console.log("[GoogleSignIn] User cancelled");
          onError?.("ログインがキャンセルされました");
        }
      }
    } catch (error) {
      console.error("[GoogleSignIn] Error:", error);
      onError?.(
        error instanceof Error ? error.message : "Googleログインに失敗しました"
      );
    } finally {
      console.log("[GoogleSignIn] Cleaning up, setting isLoading to false");
      setIsLoading(false);
    }
  };

  return (
    <SocialButtonBase
      onPress={handleGoogleSignIn}
      isLoading={isLoading}
      icon={<GoogleLogo size={24} />}
      label={mode === "signin" ? "Googleでログイン" : "Googleで登録"}
      backgroundColor="#FFFFFF"
      textColor="#1F1F1F"
      borderColor="#DADCE0"
    />
  );
}
