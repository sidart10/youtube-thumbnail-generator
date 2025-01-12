import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface ThumbnailFormProps {
  onImagesGenerated: (images: any[]) => void;
}

export function ThumbnailForm({ onImagesGenerated }: ThumbnailFormProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async (promptId: string) => {
    try {
      const response = await fetch(`/api/generate/status?promptId=${promptId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.status === "completed" && data.images) {
        setIsLoading(false);
        onImagesGenerated(data.images);
      } else if (data.status === "failed") {
        setIsLoading(false);
        setError(data.error || "Failed to generate images");
      } else {
        // Keep polling if still processing
        setTimeout(() => checkStatus(promptId), 2000);
      }
    } catch (error) {
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Failed to check status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.promptId) {
        // Start polling for status
        checkStatus(data.promptId);
      } else {
        throw new Error("No prompt ID received");
      }
    } catch (error) {
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Failed to generate thumbnail");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-4">
      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Describe your YouTube thumbnail..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading || !prompt.trim()}>
        {isLoading ? "Generating..." : "Generate Thumbnail"}
      </Button>
    </form>
  );
} 