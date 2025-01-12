import { NextResponse } from "next/server";
import Replicate from "replicate";
import { supabase } from "@/lib/supabase";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function streamToBlob(stream: ReadableStream): Promise<Blob> {
  const response = new Response(stream);
  const blob = await response.blob();
  return blob;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("Received prompt:", prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Creating prompt record...");
    // Create a prompt record
    const { data: promptRecord, error: promptError } = await supabase
      .from("prompts")
      .insert([
        {
          prompt_text: prompt,
          replicate_status: "pending",
        },
      ])
      .select()
      .single();

    if (promptError) {
      console.error("Error creating prompt record:", promptError);
      return NextResponse.json({
        error: "Database error",
        details: promptError.message,
      }, { status: 500 });
    }

    console.log("Prompt record created:", promptRecord);

    console.log("Generating image with Replicate...");
    // Generate image using Replicate
    const output = await replicate.run(
      "sidart10/sid-flex-2:3e83c91dacc629a25abe472a7d0ee13cbaef2ed05128321d516c0dd473e3d452",
      {
        input: {
          prompt,
          model: "dev",
          go_fast: false,
          lora_scale: 0.8,
          megapixels: "1",
          num_outputs: 4,
          aspect_ratio: "16:9",
          output_format: "png",
          guidance_scale: 4.7,
          output_quality: 80,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 28,
        },
      }
    );

    console.log("Replicate output:", output);

    if (!output || !Array.isArray(output)) {
      throw new Error("Failed to generate image");
    }

    const results = [];
    // Upload image to Supabase Storage and save record
    for (const stream of output) {
      if (stream instanceof ReadableStream) {
        console.log("Converting stream to blob...");
        const imageBlob = await streamToBlob(stream);
        
        const fileName = `${promptRecord.id}/${Date.now()}.png`;
        console.log("Uploading to Supabase storage:", fileName);
        
        const { error: uploadError } = await supabase.storage
          .from("thumbnails")
          .upload(fileName, imageBlob);

        if (uploadError) {
          console.error("Error uploading to storage:", uploadError);
          return NextResponse.json({
            error: "Storage error",
            details: uploadError.message,
          }, { status: 500 });
        }

        console.log("Getting public URL for uploaded file");
        const { data: publicUrl } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(fileName);

        console.log("Public URL:", publicUrl);

        // Save image record
        console.log("Saving image record to database");
        const { data: imageRecord, error: imageError } = await supabase
          .from("images")
          .insert([
            {
              prompt_id: promptRecord.id,
              image_url: publicUrl.publicUrl,
              storage_path: fileName,
            },
          ])
          .select()
          .single();

        if (imageError) {
          console.error("Error saving image record:", imageError);
          return NextResponse.json({
            error: "Database error",
            details: imageError.message,
          }, { status: 500 });
        }

        results.push({
          id: imageRecord.id,
          url: publicUrl.publicUrl,
          prompt: prompt,
          liked: false
        });
      }
    }

    // Update prompt status to completed
    console.log("Updating prompt status to completed");
    const { error: updateError } = await supabase
      .from("prompts")
      .update({ replicate_status: "completed" })
      .eq("id", promptRecord.id);

    if (updateError) {
      console.error("Error updating prompt status:", updateError);
      return NextResponse.json({
        error: "Database error",
        details: updateError.message,
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      images: results,
      message: "Thumbnail generated successfully"
    });
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate thumbnail", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 