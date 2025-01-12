import Image from "next/image";
import { Download, Heart } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

interface ThumbnailGridProps {
  images: {
    id: string;
    url: string;
    prompt: string;
    liked?: boolean;
  }[];
  onLike?: (id: string) => void;
  onDownload?: (url: string) => void;
}

export function ThumbnailGrid({ images, onLike, onDownload }: ThumbnailGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl">
      {images.map((image) => (
        <Card key={image.id} className="group relative overflow-hidden">
          <div className="aspect-video w-full relative">
            <Image
              src={image.url}
              alt={image.prompt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onLike?.(image.id)}
              >
                <Heart
                  className={`h-5 w-5 ${image.liked ? "fill-red-500 text-red-500" : "text-white"}`}
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onDownload?.(image.url)}
              >
                <Download className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 truncate">{image.prompt}</p>
          </div>
        </Card>
      ))}
    </div>
  );
} 