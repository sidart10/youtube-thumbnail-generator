import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type ImageWithPrompt = {
  id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
  prompts: {
    prompt_text: string;
  };
};

export async function GET() {
  try {
    const { data: images, error } = await supabase
      .from('images')
      .select(`
        id,
        image_url,
        storage_path,
        created_at,
        prompts:prompt_id (
          prompt_text
        )
      `)
      .order('created_at', { ascending: false }) as { data: ImageWithPrompt[] | null, error: any };

    if (error) {
      console.error("Error fetching images:", error);
      return NextResponse.json({
        error: "Failed to fetch images",
        details: error.message
      }, { status: 500 });
    }

    if (!images) {
      return NextResponse.json({ images: [] });
    }

    const transformedImages = images.map(image => ({
      id: image.id,
      url: image.image_url,
      prompt: image.prompts.prompt_text,
      liked: false
    }));

    return NextResponse.json({
      images: transformedImages
    });
  } catch (error) {
    console.error("Error in GET /api/images:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 