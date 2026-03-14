# Recipi Book - プロジェクトガイド

## プロジェクト概要

料理動画からレシピを自動変換・管理するWebアプリケーション。
ユーザーが料理動画のURLを入力すると、AIがレシピ（材料・手順）を抽出し、整理・保存できる。

## 技術スタック

- **フレームワーク**: Next.js 15（App Router）
- **言語**: TypeScript 5（strict mode）
- **UIライブラリ**: React 19
- **コンポーネント**: shadcn/ui
- **スタイリング**: Tailwind CSS v4
- **パッケージマネージャ**: npm

## アーキテクチャ

**クリーンアーキテクチャ**を採用する。依存の方向は常に内側（Domain）に向かう。

```
Presentation (app/, components/)
    ↓
Application (use-cases/)
    ↓
Domain (domain/)
    ↑
Infrastructure (infrastructure/)  ← Domain のインターフェースを実装
```

### レイヤーごとの責務と依存ルール

| レイヤー | 責務 | 依存してよいレイヤー |
|---------|------|-------------------|
| **Domain** | エンティティ、値オブジェクト、リポジトリインターフェース | なし（最内層） |
| **Application** | ユースケース、アプリケーションサービス | Domain のみ |
| **Infrastructure** | 外部API連携、DB操作、リポジトリ実装 | Domain のみ |
| **Presentation** | UI、ページ、コンポーネント | Application, Domain |

- **Domain 層は他のどの層にも依存しない**（純粋なTypeScript、フレームワーク非依存）
- Infrastructure 層は Domain 層のインターフェース（Port）を実装する（Adapter）
- Presentation 層は Application 層のユースケースを通じてデータにアクセスする
- レイヤーを飛び越えた依存は禁止（例: コンポーネントから直接 Infrastructure を呼ばない）

## ディレクトリ構成

```
src/
├── app/                        # Presentation: App Router ページ・レイアウト
│   ├── (auth)/                 #   認証関連ページグループ
│   ├── (main)/                 #   メインアプリページグループ
│   ├── layout.tsx
│   └── page.tsx
├── components/                 # Presentation: UIコンポーネント
│   ├── ui/                     #   shadcn/ui ベースコンポーネント
│   └── features/               #   機能別コンポーネント
│       ├── recipe/             #     レシピ関連
│       └── video/              #     動画関連
├── domain/                     # Domain: ビジネスロジックの中心
│   ├── entities/               #   エンティティ（Recipe, Ingredient, Step 等）
│   ├── value-objects/          #   値オブジェクト（Url, CookingTime 等）
│   ├── repositories/           #   リポジトリインターフェース（Port）
│   └── errors.ts               #   ドメインエラー定義
├── application/                # Application: ユースケース
│   ├── use-cases/              #   ユースケース実装
│   │   ├── extract-recipe.ts   #     動画からレシピ抽出
│   │   ├── save-recipe.ts      #     レシピ保存
│   │   └── list-recipes.ts     #     レシピ一覧取得
│   └── dto/                    #   データ転送オブジェクト
├── infrastructure/             # Infrastructure: 外部サービス連携
│   ├── api/                    #   外部API クライアント
│   ├── repositories/           #   リポジトリ実装（Adapter）
│   └── services/               #   AIサービス等の実装
├── hooks/                      # Presentation: カスタムフック
├── lib/                        # 共有ユーティリティ
│   ├── utils.ts                #   汎用ユーティリティ（cn() 等）
│   └── constants.ts            #   定数定義
└── styles/                     # グローバルスタイル
docs/                           # ドキュメント
public/                         # 静的アセット
```

## コーディング規約

### TypeScript

- `strict: true` を必ず有効にする
- `any` 型の使用は禁止。やむを得ない場合は `unknown` を使い、型ガードで絞り込む
- インターフェースよりも `type` を優先して使う。ただし Domain 層のリポジトリ Port は `interface` で定義する
- Enum は使わず、`as const` オブジェクトまたはユニオン型を使う
- Domain 層のコードはフレームワーク非依存にする（React, Next.js, 外部ライブラリの import 禁止）

```typescript
// Good
type Status = "idle" | "loading" | "success" | "error";

// Bad
enum Status {
  Idle,
  Loading,
  Success,
  Error,
}
```

### React

- 関数コンポーネントのみ使用（クラスコンポーネント禁止）
- コンポーネントは名前付きエクスポート（`export function`）を使う。`export default` は `page.tsx` と `layout.tsx` のみ
- Props の型は `ComponentNameProps` の命名で定義する
- `use client` ディレクティブは必要なコンポーネントにのみ付与する（デフォルトはServer Component）
- カスタムフックは `use` プレフィックスを付け、`src/hooks/` に配置する
- コンポーネントから直接 Infrastructure 層を呼ばない。必ず Application 層のユースケース経由でアクセスする

```typescript
// Good
type RecipeCardProps = {
  title: string;
  imageUrl: string;
  cookingTime: number;
};

export function RecipeCard({ title, imageUrl, cookingTime }: RecipeCardProps) {
  return <div>...</div>;
}
```

### CSS / スタイリング

- Tailwind CSS のユーティリティクラスを優先する
- カスタムCSSは原則として書かない。必要な場合は CSS Modules を使用する
- `cn()` ヘルパー（clsx + tailwind-merge）でクラス名を結合する
- マジックナンバーは避け、Tailwind のスペーシングスケールに従う

### インポート順序

```typescript
// 1. React / Next.js
import { useState } from "react";
import Link from "next/link";

// 2. 外部ライブラリ
import { z } from "zod";

// 3. Domain 層
import type { Recipe } from "@/domain/entities/recipe";

// 4. Application 層
import { extractRecipe } from "@/application/use-cases/extract-recipe";

// 5. Infrastructure 層（Server Component / API Route のみ）
import { RecipeRepositoryImpl } from "@/infrastructure/repositories/recipe-repository";

// 6. Presentation 層（コンポーネント、フック、ユーティリティ）
import { Button } from "@/components/ui/button";
import { useRecipe } from "@/hooks/use-recipe";
import { cn } from "@/lib/utils";
```

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| ファイル（コンポーネント） | kebab-case | `recipe-card.tsx` |
| ファイル（その他） | kebab-case | `use-recipe.ts`, `utils.ts` |
| コンポーネント | PascalCase | `RecipeCard` |
| 関数・変数 | camelCase | `getRecipeById`, `isLoading` |
| 型・インターフェース | PascalCase | `Recipe`, `RecipeCardProps` |
| リポジトリインターフェース | PascalCase + `Repository` | `RecipeRepository` |
| リポジトリ実装 | PascalCase + `RepositoryImpl` | `RecipeRepositoryImpl` |
| ユースケース | kebab-case ファイル / camelCase 関数 | `extract-recipe.ts` / `extractRecipe()` |
| 定数 | UPPER_SNAKE_CASE | `MAX_RECIPE_COUNT` |
| CSS変数 | kebab-case | `--color-primary` |
| ディレクトリ | kebab-case | `recipe-detail/` |

## Git ルール

### ブランチ戦略

- `main`: 本番ブランチ（直接pushしない）
- `develop`: 開発ブランチ
- `feature/<issue-id>-<short-description>`: 機能開発
- `fix/<issue-id>-<short-description>`: バグ修正

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に従う。日本語で記述する。

```
<type>: <description>

feat: レシピカード一覧の表示機能を追加
fix: 動画URL解析時のエラーハンドリングを修正
docs: UIデザインルールを追加
refactor: レシピ取得ロジックをカスタムフックに分離
style: レシピ詳細ページのレイアウトを調整
chore: ESLint設定を更新
```

## 関連ドキュメント

- [UIデザインルール](./docs/ui-design-rules.md)
- [カラーパレット](./docs/color-palette.md)
