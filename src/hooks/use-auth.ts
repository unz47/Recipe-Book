import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { Recipe } from "@/domain/entities/recipe";
import { supabase } from "@/lib/supabase";
import { syncLocalToSupabase } from "@/lib/supabase-storage";
import { getStoredRecipes } from "@/lib/storage";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    // 初回セッション取得
    console.log("[useAuth] Initializing...");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[useAuth] Initial session:", !!session?.user);
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    // 認証状態変更の監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state changed:", event, !!session?.user);

      // ログイン成功時にローカルデータを同期
      if (event === "SIGNED_IN" && session) {
        console.log("[useAuth] User signed in, setting auth state");

        // 認証状態を即座に更新（UIをブロックしない）
        setAuthState({
          user: session.user,
          session,
          isLoading: false,
        });

        // データ同期をバックグラウンドで実行（非同期、待機しない）
        console.log("[useAuth] Starting background data sync...");
        (async () => {
          try {
            const localRecipes = await getStoredRecipes<Recipe>();
            console.log(`[useAuth] Found ${localRecipes.length} local recipes`);
            if (localRecipes.length > 0) {
              await syncLocalToSupabase(localRecipes, session.user.id);
              console.log("[useAuth] Background sync completed successfully");
            } else {
              console.log("[useAuth] No local recipes to sync");
            }
          } catch (error) {
            console.error("[useAuth] Background sync failed:", error);
          }
        })();
      } else {
        // その他の状態変更
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user,
  };
}
