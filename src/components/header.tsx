"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CookingPot, BookOpen, ShoppingCart, Home, LogIn, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/recipes", label: "レシピ", icon: BookOpen },
  { href: "/shopping", label: "買い物リスト", icon: ShoppingCart },
] as const;

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, signInWithGoogle, signOut } =
    useAuth();

  // モバイルではレシピ詳細・編集画面でヘッダーを非表示
  const isDetailPage =
    /^\/recipes\/[^/]+/.test(pathname) && pathname !== "/recipes";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-app-border bg-white/80 backdrop-blur-md",
        isDetailPage && "sm:block hidden"
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <CookingPot className="h-7 w-7 text-app-primary" />
          <span className="text-xl font-bold text-app-text">Recipi Book</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-app-primary-light text-app-primary"
                    : "text-app-text-secondary hover:bg-app-surface hover:text-app-text"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-app-surface" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          user.user_metadata?.avatar_url ||
                          user.user_metadata?.picture
                        }
                        alt={user.email ?? ""}
                      />
                      <AvatarFallback className="bg-app-primary text-white text-xs">
                        {(user.email ?? "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <Link href="/pricing">
                  <DropdownMenuItem className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    料金プラン
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={signOut} className="text-app-danger cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={signInWithGoogle}
              className="gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">ログイン</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
