import { RECIPE_THUMBNAIL_COLORS } from "./constants";

export function getThumbnailColor(index: number): string {
  return RECIPE_THUMBNAIL_COLORS[index % RECIPE_THUMBNAIL_COLORS.length];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function adjustAmount(amount: string, ratio: number): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;

  const adjusted = num * ratio;
  if (Number.isInteger(adjusted)) return adjusted.toString();
  return parseFloat(adjusted.toFixed(2)).toString();
}
