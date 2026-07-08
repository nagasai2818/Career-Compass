# Project Setup Guide: The Sanctuary (Career Break Women)

"The Sanctuary" is a career re-entry platform designed for women returning to the workforce. It leverages AI (Google Gemini) for resume analysis, Firebase for authentication, and Supabase for profile storage.

## 🏗️ Technical Stack

- **Frontend**: React (TSX), Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express (API Proxy for Gemini AI)
- **Authentication**: Firebase Auth
- **Database**: Supabase (PostgreSQL with RLS)
- **AI Integration**: Google Gemini (via `@google/genai`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase Project
- Supabase Project
- Google Gemini API Key (via [Google AI Studio](https://aistudio.google.com/))

### 2. Installation

Clone the repository and install dependencies:

```bash
# Install root dependencies (React + Node)
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and populate it with your credentials:

```env
# Gemini AI Key
VITE_GEMINI_API_KEY="your_gemini_api_key"

# Firebase Config
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"

# Supabase Config
VITE_SUPABASE_URL="https://your_project_id.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 4. Database Setup (Supabase)

The project uses Supabase to store user profiles. 

1. Go to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Copy and run the contents of [supabase_setup.sql](file:///c:/Users/HP/Documents/GitHub/Career-Break-Women/supabase_setup.sql).

This script:
- Creates the `profiles` table.
- Enables Row Level Security (RLS).
- Sets up public access policies (for testing/integration).
- Adds an auto-update trigger for the `updated_at` column.

---

## 💻 Running the Application

To run the application locally, you need two terminal windows:

### Terminal 1: Frontend (Vite)
```bash
npm run dev
```
Starts the React app on `http://localhost:3000`.

### Terminal 2: Backend (Express)
```bash
npm run server
```
Starts the Node.js API server on `http://localhost:5001`. This server handles Gemini AI requests to avoid CORS issues and protect API keys.

---

## 📂 Project Structure

- `src/`: React frontend code.
  - `pages/`: Application screens (Login, Signup, Profile, Dashboard, Resume).
  - `components/`: Reusable UI components.
  - `services/`: API integration and utility services.
- `server.js`: Node.js/Express server logic.
- `supabase_setup.sql`: Database schema definition.
- `metadata.json`: Project metadata.

---

## 🛠️ Build for Production

To create a production build with the frontend bundled into the server:

```bash
# Build the React app
npm run build

# Start the unified server
npm start
```
The server will serve the static files from `dist/` and expose the API endpoints on the same port.
