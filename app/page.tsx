"use client";

import { ThumbnailForm } from "./components/ui/thumbnail-form";
import { ThumbnailGrid } from "./components/ui/thumbnail-grid";
import { useState } from "react";

interface Image {
  id: string;
  url: string;
  prompt: string;
  liked: boolean;
}

export default function Home() {
  const [images, setImages] = useState<Image[]>([]);

  const handleImagesGenerated = (newImages: Image[]) => {
    setImages((prevImages) => [...newImages, ...prevImages]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-8">
      <div className="max-w-5xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center">YouTube Thumbnail Generator</h1>
        <p className="text-center text-gray-600">
          Generate eye-catching thumbnails for your YouTube videos using AI
        </p>
        <ThumbnailForm onImagesGenerated={handleImagesGenerated} />
        <ThumbnailGrid images={images} />
      </div>
    </main>
  );
}
