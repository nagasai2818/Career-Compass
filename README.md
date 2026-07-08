<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5dd5228c-3ff3-492b-a349-c54ddb2010b6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Languages and Technologies Used

### Frontend
* **TypeScript (React / TSX)**: The core UI logic, routing, state management, and page views are built using TypeScript and React 19.
* **HTML5**: For page templates and semantic document structure.
* **CSS (TailwindCSS)**: Used for responsive styles, custom themes, animations, and modern UI layout alignment.

### Backend
* **JavaScript (Node.js / ESM)**: The backend API server (`server.js`) is written in modern JavaScript ES modules (Node.js).
* **Express**: Fast, unopinionated minimalist web framework for routing, CORS management, and hosting backend endpoints.

### Database & Auth integrations
* **SQL (PostgreSQL)**: Custom database schemas and Row Level Security (RLS) configurations are written in PostgreSQL dialect for Supabase storage and profiles table.
* **JSON (JSONB)**: Used to store nested lists (education, career preferences) inside Supabase records.

