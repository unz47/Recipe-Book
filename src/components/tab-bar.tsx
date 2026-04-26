"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_ITEMS = [
  { href: "/", label: "HOME", icon: Home },
  { href: "/recipes", label: "RECIPES", icon: BookOpen },
  { href: "/shopping", label: "LIST", icon: ShoppingCart },
] as const;

export function TabBar() {
  const pathname = usePathname();

  // レシピ詳細・編集画面ではタブバーを非表示
  const isDetailPage =
    /^\/recipes\/[^/]+/.test(pathname) && pathname !== "/recipes";
  if (isDetailPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-app-bg px-5 pb-5 pt-3 sm:hidden">
      <div className="flex items-center rounded-[36px] border border-app-border bg-white p-1 shadow-sm">
        {TAB_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-[26px] py-2.5 text-[10px] font-semibold tracking-wider transition-colors",
                isActive
                  ? "bg-app-primary text-white"
                  : "text-app-text-placeholder"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
