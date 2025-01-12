# Project overview
Use this guide to build backend for YouTube Thumbnail Generator web app, where I can generate custom thumbnails using Replicate's model and store them in Supabase.

# Tech stack
- Next.js
- Supabase (for database and storage)
- Replicate (for image generation)

# Tables & buckets to create
Supabase storage bucket: thumbnails

-- Store information about each prompt session
table prompts (
  id uuid default gen_random_uuid() primary key,
  prompt_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  replicate_status text default 'pending',
  model_version text
);

-- Store generated images from each prompt
table generated_images (
  id uuid default gen_random_uuid() primary key,
  prompt_id uuid references prompts(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

# Requirements

## Handle image generation workflow:
- Save prompt to prompts table when user submits
- Call Replicate API to generate images
- For each generated image:
  - Upload to Supabase storage bucket
  - Save record in generated_images table
- Update prompt status to 'completed'

## Display generated images:
-  Display all the images ever generated in a grid
- Thumbnail grid should fetch and display all images from the "thumbnails" data table
- Query both tables to get all prompts and their images
- Sort by most recent

# Documentations
## Example of uploading files to supabase storage
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient('your_project_url', 'your_supabase_api_key')

// Upload file using standard upload
async function uploadFile(file) {
  const { data, error } = await supabase.storage.from('bucket_name').upload('file_path', file)
  if (error) {
    // Handle error
  } else {
    // Handle success
  }
}