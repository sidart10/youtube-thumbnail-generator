import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Check prompts table
    const { error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .limit(1);

    if (promptsError) {
      return NextResponse.json({ error: "Prompts table error", details: promptsError.message }, { status: 500 });
    }

    // Check images table
    const { error: imagesError } = await supabase
      .from("images")
      .select("*")
      .limit(1);

    if (imagesError) {
      return NextResponse.json({ error: "Images table error", details: imagesError.message }, { status: 500 });
    }

    // Check storage bucket
    const { error: bucketError } = await supabase
      .storage
      .getBucket("thumbnails");

    if (bucketError) {
      return NextResponse.json({ error: "Storage bucket error", details: bucketError.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "healthy",
      tables: {
        prompts: { exists: true },
        images: { exists: true },
        storage: { exists: true }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Health check failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 