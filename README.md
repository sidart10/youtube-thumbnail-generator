# YouTube Thumbnail Generator

A web application that generates custom YouTube thumbnails using AI. Built with Next.js, Shadcn UI, and Replicate.

## Features

- Generate custom YouTube thumbnails using text prompts
- Download generated thumbnails
- Like/save favorite thumbnails
- Responsive grid layout
- Modern UI with loading states and animations

## Prerequisites

- Node.js 18+ installed
- Replicate API token
- (Optional) Supabase account for database
- (Optional) Clerk account for authentication

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Add your Replicate API token to `.env.local`:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a descriptive prompt for your desired YouTube thumbnail
2. Click "Generate Thumbnail" and wait for the AI to create your image
3. Download the generated thumbnail or like it to save for later
4. View all your generated thumbnails in the grid below

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Replicate AI
- Supabase (coming soon)
- Clerk Authentication (coming soon)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
