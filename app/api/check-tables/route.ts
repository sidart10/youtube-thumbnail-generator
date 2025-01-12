import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Check prompts table
    const { data: promptsData, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .limit(1);

    if (promptsError) {
      return NextResponse.json({
        error: "Prompts table error",
        details: promptsError.message,
      }, { status: 500 });
    }

    // Check generated_images table
    const { data: imagesData, error: imagesError } = await supabase
      .from("generated_images")
      .select("*")
      .limit(1);

    if (imagesError) {
      return NextResponse.json({
        error: "Generated images table error",
        details: imagesError.message,
      }, { status: 500 });
    }

    // Check thumbnails bucket
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket("thumbnails");

    if (bucketError) {
      return NextResponse.json({
        error: "Thumbnails bucket error",
        details: bucketError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "All tables and storage bucket exist",
      tables: {
        prompts: true,
        generated_images: true,
        thumbnails_bucket: true
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check tables",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 