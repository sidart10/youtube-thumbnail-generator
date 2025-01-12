import { NextResponse } from "next/server";
import Replicate from "replicate";
import { supabase } from "@/lib/supabase";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function downloadImage(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  return await response.blob();
}

export const runtime = 'edge'; // Use edge runtime for better performance
export const maxDuration = 60; // Set to maximum allowed for Hobby plan (60 seconds)

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

    // Start the image generation process in the background
    (async () => {
      try {
        console.log("Creating prediction with Replicate...");
        const prediction = await replicate.predictions.create({
          version: "3e83c91dacc629a25abe472a7d0ee13cbaef2ed05128321d516c0dd473e3d452",
          input: {
            prompt,
            model: "dev",
            go_fast: true, // Enable fast mode
            lora_scale: 0.8,
            megapixels: "1",
            num_outputs: 2, // Reduce number of outputs for faster processing
            aspect_ratio: "16:9",
            output_format: "png",
            guidance_scale: 4.7,
            output_quality: 80,
            prompt_strength: 0.8,
            extra_lora_scale: 1,
            num_inference_steps: 20, // Reduce steps for faster processing
          },
        });

        // Update status to processing
        await supabase
          .from("prompts")
          .update({ replicate_status: "processing" })
          .eq("id", promptRecord.id);

        console.log("Waiting for prediction...");
        const output = await replicate.wait(prediction);
        console.log("Prediction completed:", output);

        if (!output || !output.output || !Array.isArray(output.output)) {
          throw new Error("Invalid output from Replicate");
        }

        const results = [];
        // Process each image URL from Replicate
        for (const imageUrl of output.output) {
          if (typeof imageUrl !== 'string') {
            console.warn("Skipping invalid image URL:", imageUrl);
            continue;
          }

          try {
            console.log("Downloading image:", imageUrl);
            const imageBlob = await downloadImage(imageUrl);
            
            const fileName = `${promptRecord.id}/${Date.now()}.png`;
            console.log("Uploading to Supabase storage:", fileName);
            
            const { error: uploadError } = await supabase.storage
              .from("thumbnails")
              .upload(fileName, imageBlob);

            if (uploadError) {
              console.error("Error uploading to storage:", uploadError);
              continue;
            }

            const { data: publicUrl } = supabase.storage
              .from("thumbnails")
              .getPublicUrl(fileName);

            // Save image record
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
              continue;
            }

            results.push({
              id: imageRecord.id,
              url: publicUrl.publicUrl,
              prompt: prompt,
              liked: false
            });
          } catch (imageError) {
            console.error("Error processing image:", imageError);
            continue;
          }
        }

        // Update prompt status based on results
        const status = results.length > 0 ? "completed" : "failed";
        await supabase
          .from("prompts")
          .update({ 
            replicate_status: status,
            completed_at: new Date().toISOString()
          })
          .eq("id", promptRecord.id);

      } catch (error) {
        console.error("Background task error:", error);
        await supabase
          .from("prompts")
          .update({ 
            replicate_status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error"
          })
          .eq("id", promptRecord.id);
      }
    })().catch(console.error);

    // Immediately return the prompt ID to the client
    return NextResponse.json({ 
      success: true, 
      message: "Image generation started",
      promptId: promptRecord.id
    });

  } catch (error) {
    console.error("Error in generate endpoint:", error);
    return NextResponse.json(
      { 
        error: "Failed to start generation", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 