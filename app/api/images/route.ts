import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ImageRecord {
  id: string;
  prompt_id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
  liked: boolean;
  prompts: {
    prompt_text: string;
  };
}

export async function GET() {
  try {
    const { data: images, error } = await supabase
      .from("images")
      .select(`
        *,
        prompts (
          prompt_text
        )
      `)
      .order('created_at', { ascending: false })
      .returns<ImageRecord[]>();

    if (error) {
      return NextResponse.json({ error: "Failed to fetch images", details: error.message }, { status: 500 });
    }

    if (!images) {
      return NextResponse.json({ images: [] });
    }

    const formattedImages = images.map((image) => ({
      id: image.id,
      url: image.image_url,
      prompt: image.prompts.prompt_text,
      liked: image.liked
    }));

    return NextResponse.json({ images: formattedImages });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch images", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 