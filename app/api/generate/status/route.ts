import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    // Get prompt status
    const { data: prompt, error: promptError } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", promptId)
      .single();

    if (promptError) {
      return NextResponse.json({
        error: "Failed to fetch prompt status",
        details: promptError.message
      }, { status: 500 });
    }

    if (!prompt) {
      return NextResponse.json({
        error: "Prompt not found"
      }, { status: 404 });
    }

    // If the prompt is completed, fetch the generated images
    if (prompt.replicate_status === "completed") {
      const { data: images, error: imagesError } = await supabase
        .from("images")
        .select("*")
        .eq("prompt_id", promptId);

      if (imagesError) {
        return NextResponse.json({
          error: "Failed to fetch images",
          details: imagesError.message
        }, { status: 500 });
      }

      const formattedImages = images.map(image => ({
        id: image.id,
        url: image.image_url,
        prompt: prompt.prompt_text,
        liked: false
      }));

      return NextResponse.json({
        status: prompt.replicate_status,
        images: formattedImages
      });
    }

    // Return just the status for non-completed prompts
    return NextResponse.json({
      status: prompt.replicate_status,
      error: prompt.error_message
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to check status", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 