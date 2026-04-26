"use client";

import { useEffect } from "react";
import { ShoppingCart, Utensils, Check } from "lucide-react";

import { useShoppingList } from "@/hooks/use-shopping-list";

const GROUP_ICON_COLORS = ["#E86A30", "#5C8A5C", "#E5A820", "#C85420", "#7DA37D"];

export default function ShoppingPage() {
  const { groups, refresh, toggle, clearCompleted } =
    useShoppingList();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasCheckedItems = groups.some((g) =>
    g.items.some((i) => i.checked)
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-5 sm:px-6 sm:py-8">
      {/* Title Row */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-app-text">買い物リスト</h1>
        {hasCheckedItems && (
          <button
            onClick={clearCompleted}
            className="text-[13px] font-medium text-app-danger"
          >
            完了を消去
          </button>
        )}
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-app-text-placeholder" />
          <p className="mb-1 text-base text-app-text-muted">
            買い物リストは空です
          </p>
          <p className="text-sm text-app-text-placeholder">
            レシピ詳細画面から材料を買い物リストに追加できます
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, gi) => {
            const iconColor = GROUP_ICON_COLORS[gi % GROUP_ICON_COLORS.length];

            return (
              <div key={group.recipeId}>
                {/* Group Header */}
                <div className="mb-3 flex items-center gap-2">
                  <Utensils
                    className="h-4 w-4"
                    style={{ color: iconColor }}
                  />
                  <span className="text-[15px] font-semibold text-app-text">
                    {group.recipeTitle}
                  </span>
                </div>

                {/* Items List */}
                <div className="overflow-hidden rounded-xl border border-app-border bg-white">
                  {group.items.map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${
                        i < group.items.length - 1
                          ? "border-b border-app-border"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => void toggle(item.id)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          item.checked
                            ? "border-app-primary bg-app-primary"
                            : "border-app-text-placeholder bg-white"
                        }`}
                      >
                        {item.checked && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>

                      {/* Item Info */}
                      <span
                        className={`flex-1 text-sm ${
                          item.checked
                            ? "text-app-text-placeholder line-through"
                            : "text-app-text"
                        }`}
                      >
                        {item.ingredientName}
                        {item.amount && (
                          <span className="ml-2 text-app-text-muted">
                            {item.amount}
                          </span>
                        )}
                      </span>

                      {/* Divider line for checked items */}
                      {item.checked && (
                        <div className="hidden h-px flex-1 bg-app-text-placeholder sm:block" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
