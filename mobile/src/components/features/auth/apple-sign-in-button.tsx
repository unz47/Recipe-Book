import { useState } from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";
import { SocialButtonBase } from "./social-button-base";
import { AppleLogo } from "@/components/icons/apple-logo";

type AppleSignInButtonProps = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function AppleSignInButton({
  onSuccess,
  onError,
}: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // iOSでのみ表示
  if (Platform.OS !== "ios") {
    return null;
  }

  const handleAppleSignIn = async () => {
    setIsLoading(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });

        if (error) {
          throw error;
        }

        // 認証状態の変更が確実に反映されるまで少し待つ
        await new Promise((resolve) => setTimeout(resolve, 300));

        onSuccess?.();
      } else {
        throw new Error("No identity token returned");
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ERR_REQUEST_CANCELED"
      ) {
        // ユーザーがキャンセルした場合は何もしない
        onError?.("ログインがキャンセルされました");
      } else {
        console.error("Apple sign in error:", error);
        onError?.(
          error instanceof Error ? error.message : "Appleログインに失敗しました"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SocialButtonBase
      onPress={handleAppleSignIn}
      isLoading={isLoading}
      disabled={true}
      icon={<AppleLogo size={24} color="#FFFFFF" />}
      label="Appleでログイン"
      backgroundColor="#000000"
      textColor="#FFFFFF"
    />
  );
}
