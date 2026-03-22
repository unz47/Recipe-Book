-- Recipi Book データベーススキーマ

-- レシピテーブル
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  total_time TEXT,
  prep_time TEXT,
  cook_time TEXT,
  servings TEXT,
  difficulty TEXT,
  tips TEXT[] DEFAULT '{}',
  channel_name TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用制限テーブル
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  extraction_count INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes(user_id);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS user_usage_user_id_month_idx ON user_usage(user_id, month);

-- Row Level Security (RLS) 有効化
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- レシピテーブルのポリシー
-- ユーザーは自分のレシピのみ閲覧可能
CREATE POLICY "Users can view own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のレシピのみ作成可能
CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のレシピのみ更新可能
CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のレシピのみ削除可能
CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- 使用制限テーブルのポリシー
-- ユーザーは自分の使用状況のみ閲覧可能
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の使用状況のみ作成可能
CREATE POLICY "Users can insert own usage" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の使用状況のみ更新可能
CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- レシピテーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 使用制限テーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 抽出回数を増やす関数
CREATE OR REPLACE FUNCTION increment_extraction_count(
  p_user_id UUID,
  p_month TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_usage (user_id, month, extraction_count, plan)
  VALUES (p_user_id, p_month, 1, 'free')
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    extraction_count = user_usage.extraction_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- user_usage テーブルにユニーク制約を追加（なければ）
ALTER TABLE user_usage DROP CONSTRAINT IF EXISTS user_usage_user_id_month_key;
ALTER TABLE user_usage ADD CONSTRAINT user_usage_user_id_month_key UNIQUE (user_id, month);
