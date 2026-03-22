import type { RecipeDto } from "@/application/dto/extract-recipe-dto";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpandableText } from "@/components/ui/expandable-text";

type RecipeDetailProps = {
  recipe: RecipeDto;
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "簡単",
  medium: "普通",
  hard: "難しい",
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* ヘッダー */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold leading-tight">{recipe.title}</h2>
        {recipe.description && (
          <ExpandableText
            text={recipe.description}
            lines={3}
            className="text-sm leading-relaxed text-muted-foreground"
          />
        )}
        <div className="flex flex-wrap gap-2">
          {recipe.tags?.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {recipe.totalTime && (
            <Badge variant="outline">{recipe.totalTime}</Badge>
          )}
          {recipe.servings && (
            <Badge variant="outline">{recipe.servings}</Badge>
          )}
          {recipe.difficulty && (
            <Badge variant="secondary">
              {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
            </Badge>
          )}
          {recipe.channelName && (
            <Badge variant="outline">{recipe.channelName}</Badge>
          )}
        </div>
        {(recipe.prepTime || recipe.cookTime) && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            {recipe.prepTime && <span>下準備: {recipe.prepTime}</span>}
            {recipe.cookTime && <span>調理: {recipe.cookTime}</span>}
          </div>
        )}
      </div>

      {/* 材料リスト */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">材料</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">名前</th>
                  <th className="pb-2 pr-4 font-medium">分量</th>
                  <th className="hidden pb-2 pr-4 font-medium sm:table-cell">
                    単位
                  </th>
                  <th className="hidden pb-2 font-medium sm:table-cell">
                    備考
                  </th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((ingredient, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{ingredient.name}</td>
                    <td className="py-2 pr-4">
                      {ingredient.amount}
                      <span className="sm:hidden">
                        {ingredient.unit ? ` ${ingredient.unit}` : ""}
                      </span>
                    </td>
                    <td className="hidden py-2 pr-4 sm:table-cell">
                      {ingredient.unit ?? "—"}
                    </td>
                    <td className="hidden py-2 text-muted-foreground sm:table-cell">
                      {ingredient.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 手順リスト */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">手順</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.stepNumber} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {step.stepNumber}
                </span>
                <div className="space-y-1 pt-0.5">
                  <p className="text-sm leading-relaxed">{step.text}</p>
                  {step.duration && (
                    <p className="text-xs text-muted-foreground">
                      {step.duration}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* コツ・ポイント */}
      {recipe.tips && recipe.tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              コツ・ポイント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm leading-relaxed"
                >
                  <span className="shrink-0 text-primary">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 元動画リンク */}
      <div className="text-sm text-muted-foreground">
        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-150 hover:text-primary"
        >
          元の動画を見る →
        </a>
      </div>
    </div>
  );
}
