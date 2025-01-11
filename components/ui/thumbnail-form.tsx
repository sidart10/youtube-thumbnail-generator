import { useState } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ThumbnailFormProps {
  setImages: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    url: string;
    prompt: string;
    liked: boolean;
  }>>>;
}

export function ThumbnailForm({ setImages }: ThumbnailFormProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateThumbnail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      toast.loading("Generating your thumbnails...", { id: "generating" });

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: ` ${prompt}`
        }),
      });

      const data = await response.json();
      console.log("Response from API:", data);

      if (!response.ok || !data.output) {
        throw new Error(data.error || "Failed to generate thumbnails");
      }

      const imageUrls = Array.isArray(data.output) ? data.output : [data.output];
      console.log("Generated image URLs:", imageUrls);

      if (!imageUrls.length) {
        throw new Error("No images were generated");
      }

      // Add all new images to the images array
      const newImages = imageUrls.map((url: string) => ({
        id: `${Date.now()}-${Math.random()}`,
        url,
        prompt,
        liked: false,
      }));
      console.log("Adding new images:", newImages);
      
      setImages((prev) => [...newImages, ...prev]);
      toast.success(`Generated ${newImages.length} thumbnails successfully!`, { id: "generating" });
      setPrompt(""); // Clear the input after successful generation
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate thumbnails",
        { id: "generating" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <form onSubmit={generateThumbnail} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Generate YouTube Thumbnail</h2>
          <p className="text-sm text-gray-500">
            Enter a prompt to generate multiple custom YouTube thumbnails
          </p>
        </div>
        <div className="space-y-4">
          <Input
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading || !prompt.trim()} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Thumbnails"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
} 