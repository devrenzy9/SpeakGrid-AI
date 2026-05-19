import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { askBrain, clearBrainSession, transformReplyForSpeech, translateForTts } from "./brain.js";
import { speakText } from "./speak.js";
import { requireAuth, clerkMiddleware } from "@clerk/express";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// 1. Serve generated audio responses via /audio/*
const responsesDir = path.join(process.cwd(), 'responses');
if (!fs.existsSync(responsesDir)) {
  fs.mkdirSync(responsesDir, { recursive: true });
}
app.use('/audio', express.static(responsesDir));

// 2. Chat endpoint
app.post('/api/chat', requireAuth(), upload.single('attachment'), async (req, res) => {
  const userId = req.auth.userId;
  const { message, sessionId = 'default', targetLanguage = 'Auto', outputMode = 'default' } = req.body;

  try {
    const textResponse = await askBrain(message, req.file, sessionId);
    const speechReadyReply = await transformReplyForSpeech(textResponse, outputMode);
    const translatedReply = await translateForTts(speechReadyReply, targetLanguage);
    const ttsInput = translatedReply || speechReadyReply || textResponse;
    const ttsText = ttsInput.replace(/https?:\/\/[^\s]+/g, "the links provided in the chat");
    const fileName = await speakText(ttsText);

    if (req.file) fs.unlinkSync(req.file.path);

    res.json({
      reply: textResponse,
      speechReadyReply,
      translatedReply,
      outputMode,
      targetLanguage,
      fileName,
    });
  } catch (error) {
    console.error('[API] /api/chat error:', error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 3. Session delete endpoint
app.post('/api/session/delete', (req, res) => {
  const { sessionId, audioFiles } = req.body;
  clearBrainSession(sessionId);

  if (audioFiles?.length) {
    audioFiles.forEach(fileName => {
      const filePath = path.join(responsesDir, fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
  }

  res.json({ success: true, message: "Session and files deleted." });
});

// 4. Serve built React app from dist
// __dirname is absolute (path.join(__dirname, '..', 'client', 'dist')) works regardless
// of the process CWD — the Vercel function bundle always mirrors the project layout.
const distPath = path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(distPath)) {
  console.log('[STATIC] React dist found at:', distPath);

  app.use(express.static(distPath, {
    etag: true,
    maxAge: '1h',
  }));

  // SPA fallback — all unmatched routes serve index.html
  app.use('/*splat', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the Express app for Vercel serverless functions.
// @vercel/node will call the exported handler for each routed request.
export default app;

// Keep app.listen() for local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`--- SpeakGrid AI API running on http://localhost:${PORT} ---`);
  });
}
