# SpeakGrid

A voice-first AI chat app I built to experiment with text-to-speech, multimodal input, live search, and memory in one place.

This project started as me trying to make a chatbot feel more like a usable voice workspace instead of just a text box with a mic button. It's still evolving, but the main flow is already working pretty well.

## What it does

- Chat with an AI assistant
- Turn replies into audio
- Upload images and ask about them
- Search the web for live information
- Keep chat sessions around instead of starting from zero every time
- Handle auth properly so the backend is not wide open

## Stack

### Frontend
- React + Vite
- Custom CSS / themed UI

### Backend
- Node.js
- Express
- Multer for uploads

### Auth
- Clerk

### AI / APIs
- Gemini 2.5 Flash
- ElevenLabs
- Tavily

## Why I made it

I wanted one place where I could:
- ask something,
- attach an image if needed,
- get a useful answer,
- and hear the answer back without jumping between tools.

A lot of apps do one or two of these things, but I wanted the mix in a single workflow.

## Main features

- **Voice replies** using ElevenLabs
- **Image-aware chat** using Gemini multimodal input
- **Live web search** through Tavily
- **Session memory** so chats don't feel disposable
- **Auth-protected backend routes**
- **URL cleanup before TTS**, so spoken replies don't sound weird when links are included

## Project structure

```txt
client/   -> React frontend
server/   -> Express backend
```

Nothing fancy here. Just split frontend and backend so it's easier to work on both separately.

## Running it locally

### 1) Clone the repo

```bash
git clone <your-repo-url>
cd <project-directory>
```

### 2) Install packages

Frontend:
```bash
cd client
npm install
```

Backend:
```bash
cd ../server
npm install
```

### 3) Add env files

Create these files:

- `client/.env`
- `server/.env`

Use the example env files if they exist, or add your keys manually.

You'll probably need keys from:
- Clerk
- Google Gemini
- ElevenLabs
- Tavily

## Start the app

Open two terminals.

### Terminal 1 — backend
```bash
cd server
npm run start
```

### Terminal 2 — frontend
```bash
cd client
npm run dev
```

## Notes

A few things worth knowing:

- This project is still in the "build and improve" phase
- UI and naming may still change
- Some parts are more polished than others
- Audio / TTS flow can behave differently depending on browser autoplay rules

## Known rough edges

- Browser audio policies can be annoying
- Long replies are harder to make sound natural in TTS
- Uploaded files need proper handling and cleanup
- Some UI parts still need a cleaner mobile experience

## Deploying to Vercel

### Prerequisites

1. Push your code to a GitHub repository
2. Install Vercel CLI: `npm i -g vercel`

### Deploy Backend

```bash
cd server
vercel --prod
```

Set these environment variables in Vercel dashboard:
- `GEMINI_API_KEY`
- `ELEVENLABS_API_KEY`
- `TAVILY_API_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `BASE_URL` = your deployed backend URL (e.g., https://your-app.vercel.app)

### Deploy Frontend

```bash
cd client
vercel --prod
```

Set these environment variables in Vercel dashboard:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL` = your deployed backend URL

### Note

The backend deploys as a serverless function with file uploads stored temporarily. For persistent file storage, integrate Vercel Blob or external storage.

## What I want to improve next

- Better message controls
- Cleaner light mode
- Smarter voice modes / speaking styles
- Better memory flow across sessions
- Smoother deployment setup
