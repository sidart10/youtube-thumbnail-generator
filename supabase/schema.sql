-- Drop existing tables if they exist
drop table if exists images;
drop table if exists prompts;

-- Create prompts table
create table prompts (
  id uuid default gen_random_uuid() primary key,
  prompt_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  replicate_status text default 'pending'
);

-- Create images table
create table images (
  id uuid default gen_random_uuid() primary key,
  prompt_id uuid references prompts(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists prompts_created_at_idx on prompts(created_at desc);
create index if not exists images_prompt_id_idx on images(prompt_id);

-- Set up Row Level Security (RLS)
alter table prompts enable row level security;
alter table images enable row level security;

-- Create policies
create policy "Public prompts are viewable by everyone"
  on prompts for select
  using (true);

create policy "Public images are viewable by everyone"
  on images for select
  using (true);

create policy "Anyone can insert prompts"
  on prompts for insert
  with check (true);

create policy "Anyone can insert images"
  on images for insert
  with check (true);

create policy "Anyone can update prompts"
  on prompts for update
  using (true); 