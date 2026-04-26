import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Plus, X, ChevronUp, ChevronDown } from "lucide-react-native";

import type { Recipe, Ingredient, Step } from "@/domain/entities/recipe";
import { Input } from "@/components/ui/input";

type KeyedStep = Step & { _key: string };

type RecipeEditFormProps = {
  recipe: Recipe;
  onSave: (updates: Partial<Recipe>) => void;
  onCancel: () => void;
};

export function RecipeEditForm({
  recipe,
  onSave,
  onCancel,
}: RecipeEditFormProps) {
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description ?? "");
  const [totalTime, setTotalTime] = useState(recipe.totalTime ?? "");
  const [category, setCategory] = useState(recipe.category ?? "");
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | undefined
  >(recipe.difficulty);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    ...recipe.ingredients,
  ]);
  const keyCounter = useRef(recipe.steps.length);
  const [steps, setSteps] = useState<KeyedStep[]>(
    recipe.steps.map((s, i) => ({ ...s, _key: `s${i}` }))
  );

  const DIFFICULTIES = [
    { value: "easy", label: "簡単" },
    { value: "medium", label: "普通" },
    { value: "hard", label: "難しい" },
  ] as const;

  const handleSave = () => {
    onSave({
      title,
      description: description || undefined,
      totalTime: totalTime || undefined,
      category: category || undefined,
      difficulty,
      ingredients,
      steps: steps.map(({ _key, ...s }, i) => ({ ...s, stepNumber: i + 1 })),
    });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    keyCounter.current += 1;
    setSteps([
      ...steps,
      { stepNumber: steps.length + 1, text: "", _key: `s${keyCounter.current}` },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, text: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], text };
    setSteps(updated);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setSteps(updated);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      {/* Nav Bar */}
      <View
        style={{
          height: 48,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity onPress={onCancel}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#8A8680",
              fontFamily: "Inter",
            }}
          >
            キャンセル
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          レシピ編集
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#E86A30",
              fontFamily: "Inter",
            }}
          >
            保存
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 24,
        }}
      >
        {/* Title */}
        <Input
          label="タイトル"
          value={title}
          onChangeText={setTitle}
          inputStyle={{ height: 48, borderRadius: 10 }}
        />

        {/* Description */}
        <Input
          label="説明"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          inputStyle={{ borderRadius: 10 }}
        />

        {/* Time & Category */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="調理時間"
              value={totalTime}
              onChangeText={setTotalTime}
              placeholder="例: 30分"
              inputStyle={{ height: 44, borderRadius: 10 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="カテゴリ"
              value={category}
              onChangeText={setCategory}
              placeholder="例: 和食"
              inputStyle={{ height: 44, borderRadius: 10 }}
            />
          </View>
        </View>

        {/* Difficulty */}
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1F1E1C",
              fontFamily: "Inter",
            }}
          >
            難易度
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {DIFFICULTIES.map((d) => {
              const selected = difficulty === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  onPress={() =>
                    setDifficulty(selected ? undefined : d.value)
                  }
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected ? "#E86A30" : "#FFFFFF",
                    borderWidth: 1,
                    borderColor: selected ? "#E86A30" : "#E8E6E1",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: selected ? "#FFFFFF" : "#6B6862",
                      fontFamily: "Inter",
                    }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#E8E6E1" }} />

        {/* Ingredients */}
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#1F1E1C",
                fontFamily: "Inter",
              }}
            >
              材料
            </Text>
            <TouchableOpacity
              onPress={addIngredient}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={14} color="#E86A30" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#E86A30",
                  fontFamily: "Inter",
                }}
              >
                追加
              </Text>
            </TouchableOpacity>
          </View>
          {ingredients.map((ing, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
              }}
            >
              <TextInput
                value={ing.name}
                onChangeText={(v) => updateIngredient(index, "name", v)}
                placeholder="材料名"
                placeholderTextColor="#B0ACA3"
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E8E6E1",
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: "#1F1E1C",
                  fontFamily: "Inter",
                }}
              />
              <TextInput
                value={ing.amount}
                onChangeText={(v) => updateIngredient(index, "amount", v)}
                placeholder="分量"
                placeholderTextColor="#B0ACA3"
                style={{
                  width: 90,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E8E6E1",
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: "#1F1E1C",
                  fontFamily: "Inter",
                }}
              />
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <X size={18} color="#B0ACA3" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#E8E6E1" }} />

        {/* Steps */}
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#1F1E1C",
                fontFamily: "Inter",
              }}
            >
              手順
            </Text>
            <TouchableOpacity
              onPress={addStep}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={14} color="#E86A30" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#E86A30",
                  fontFamily: "Inter",
                }}
              >
                追加
              </Text>
            </TouchableOpacity>
          </View>
          {steps.map((step, index) => (
            <View
              key={step._key}
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              {/* Number + Move buttons */}
              <View
                style={{
                  alignItems: "center",
                  gap: 2,
                  marginTop: 4,
                }}
              >
                <TouchableOpacity
                  onPress={() => moveStep(index, "up")}
                  disabled={index === 0}
                  hitSlop={{ top: 8, bottom: 4, left: 8, right: 8 }}
                  style={{
                    width: 32,
                    height: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: index === 0 ? 0.2 : 1,
                  }}
                >
                  <ChevronUp size={20} color="#8A8680" />
                </TouchableOpacity>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: "#E86A30",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#FFFFFF",
                      fontFamily: "Inter",
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => moveStep(index, "down")}
                  disabled={index === steps.length - 1}
                  hitSlop={{ top: 4, bottom: 8, left: 8, right: 8 }}
                  style={{
                    width: 32,
                    height: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: index === steps.length - 1 ? 0.2 : 1,
                  }}
                >
                  <ChevronDown size={20} color="#8A8680" />
                </TouchableOpacity>
              </View>
              <TextInput
                value={step.text}
                onChangeText={(v) => updateStep(index, v)}
                placeholder="手順を入力..."
                placeholderTextColor="#B0ACA3"
                multiline
                textAlignVertical="top"
                style={{
                  flex: 1,
                  minHeight: 72,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E8E6E1",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 13,
                  lineHeight: 19.5,
                  color: "#1F1E1C",
                  fontFamily: "Inter",
                }}
              />
              <TouchableOpacity
                onPress={() => removeStep(index)}
                style={{ marginTop: 30 }}
              >
                <X size={18} color="#B0ACA3" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
