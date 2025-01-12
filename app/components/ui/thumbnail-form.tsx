import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import toast from "react-hot-toast";

type Image = {
  id: string;
  url: string;
  prompt: string;
  liked: boolean;
};

interface ThumbnailFormProps {
  setImages: (images: Image[]) => void;
}

export function ThumbnailForm({ setImages }: ThumbnailFormProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate thumbnail");
      }

      if (data.images) {
        setImages(data.images);
        toast.success("Thumbnail generated successfully!");
        setPrompt("");
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate thumbnail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a prompt for your thumbnail..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>
    </form>
  );
} 