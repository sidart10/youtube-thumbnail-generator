import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Starting prediction with prompt:", prompt);
    
    // Create the prediction
    const prediction = await replicate.predictions.create({
      version: "3e83c91dacc629a25abe472a7d0ee13cbaef2ed05128321d516c0dd473e3d452",
      input: {
        prompt,
        model: "dev",
        go_fast: false,
        lora_scale: 1,
        megapixels: "1",
        num_outputs: 2,
        aspect_ratio: "16:9",
        output_format: "png",
        guidance_scale: 4.8,
        output_quality: 100,
        prompt_strength: 0.8,
        extra_lora_scale: 2,
        num_inference_steps: 28
      },
    });

    console.log("Prediction created:", prediction);

    // Wait for the prediction to complete
    let finalPrediction = await replicate.wait(prediction);
    console.log("Final prediction:", finalPrediction);

    if (!finalPrediction.output || !Array.isArray(finalPrediction.output) || finalPrediction.output.length === 0) {
      throw new Error("No output generated from the model");
    }

    // Return all generated images instead of just the first one
    const imageUrls = finalPrediction.output;
    console.log("Generated image URLs:", imageUrls);

    if (!imageUrls.every(url => typeof url === 'string' && url.startsWith('https://'))) {
      throw new Error("Invalid image URLs generated");
    }

    return NextResponse.json({ output: imageUrls });
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate thumbnail" },
      { status: 500 }
    );
  }
} 