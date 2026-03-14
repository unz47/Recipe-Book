"use client";

import { useState } from "react";

import type {
  ActionResult,
  RecipeDto,
} from "@/application/dto/extract-recipe-dto";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UrlInputFormProps = {
  onSuccess: (recipe: RecipeDto) => void;
  extractAction: (url: string) => Promise<ActionResult<RecipeDto>>;
};

type Status = "idle" | "loading" | "success" | "error";

export function UrlInputForm({ onSuccess, extractAction }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setStatus("loading");
    setErrorMessage("");

    const result = await extractAction(trimmedUrl);

    if (result.success) {
      setStatus("success");
      onSuccess(result.data);
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-3">
      <label
        htmlFor="youtube-url"
        className="text-sm font-medium text-foreground"
      >
        YouTube URL
      </label>
      <div className="flex gap-2">
        <Input
          id="youtube-url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="h-10"
        />
        <Button type="submit" disabled={isLoading || !url.trim()} size="lg">
          {isLoading ? (
            <>
              <svg
                className="size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>抽出中...</span>
            </>
          ) : (
            "レシピを抽出"
          )}
        </Button>
      </div>
      {status === "error" && errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </form>
  );
}
