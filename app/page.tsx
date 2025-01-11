"use client";

import { useState } from "react";
import { ThumbnailForm } from "@/components/ui/thumbnail-form";
import { ThumbnailGrid } from "@/components/ui/thumbnail-grid";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [images, setImages] = useState<Array<{
    id: string;
    url: string;
    prompt: string;
    liked: boolean;
  }>>([]);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "thumbnail.webp";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleLike = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, liked: !img.liked } : img
      )
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-8">
      <h1 className="text-4xl font-bold text-center">
        YouTube Thumbnail Generator
      </h1>
      <ThumbnailForm setImages={setImages} />
      {images.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No thumbnails generated yet. Enter a prompt above to get started!
        </div>
      ) : (
        <ThumbnailGrid
          images={images}
          onLike={handleLike}
          onDownload={handleDownload}
        />
      )}
      <Toaster position="bottom-right" />
    </main>
  );
}
