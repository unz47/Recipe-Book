"use client";

import { Bug, EllipsisVertical, Lightbulb } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GITHUB_REPO_URL = "https://github.com/unz47/Recipe-Book";

const MENU_ITEMS = [
  {
    label: "不具合を報告",
    icon: Bug,
    href: `${GITHUB_REPO_URL}/issues/new?template=bug_report.yml`,
  },
  {
    label: "新機能を提案",
    icon: Lightbulb,
    href: `${GITHUB_REPO_URL}/issues/new?template=feature_request.yml`,
  },
] as const;

export function FeedbackMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <EllipsisVertical className="size-5" />
        <span className="sr-only">メニュー</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {MENU_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.label}
            render={
              <a href={item.href} target="_blank" rel="noopener noreferrer" />
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
