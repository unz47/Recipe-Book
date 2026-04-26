import { useState } from "react";
import { View, Text } from "react-native";
import { Link as LinkIcon, Sparkles } from "lucide-react-native";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UrlInputFormProps = {
  onExtract: (url: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
};

export function UrlInputForm({
  onExtract,
  isLoading,
  error,
}: UrlInputFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (!url.trim()) return;
    onExtract(url.trim());
  };

  return (
    <View style={{ gap: 12 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#6B6862",
          fontFamily: "Inter",
        }}
      >
        動画URLを入力
      </Text>
      <Input
        value={url}
        onChangeText={setUrl}
        placeholder="https://youtube.com/watch?v=..."
        icon={<LinkIcon size={18} color="#B0ACA3" />}
        inputStyle={{ height: 52 }}
      />
      <Button
        title="レシピを抽出する"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={!url.trim()}
        icon={
          !isLoading ? <Sparkles size={18} color="#FFFFFF" /> : undefined
        }
        style={{ height: 52 }}
      />
      {error && (
        <Text
          style={{
            fontSize: 13,
            color: "#D64545",
            fontFamily: "Inter",
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
