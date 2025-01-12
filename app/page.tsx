"use client";

import { useState, useEffect } from "react";
import { ThumbnailForm } from "@/app/components/ui/thumbnail-form";
import { ThumbnailGrid } from "@/app/components/ui/thumbnail-grid";
import { Toaster } from "react-hot-toast";

type Image = {
  id: string;
  url: string;
  prompt: string;
  liked: boolean;
};

export default function Home() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/images");
      const data = await response.json();
      if (data.images) {
        setImages(data.images);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleNewImages = (newImages: Image[]) => {
    setImages(prev => [...newImages, ...prev]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-8">
      <h1 className="text-4xl font-bold text-center">
        YouTube Thumbnail Generator
      </h1>
      <ThumbnailForm setImages={handleNewImages} />
      {loading ? (
        <div className="text-center text-gray-500 mt-8">
          Loading thumbnails...
        </div>
      ) : images.length === 0 ? (
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
