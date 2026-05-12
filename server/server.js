import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { askBrain, clearBrainSession, transformReplyForSpeech, translateForTts } from "./brain.js"; 
import { speakText } from "./speak.js";
import { requireAuth, clerkMiddleware } from "@clerk/express";

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// 1. Point the static server to the new 'responses' folder
const responsesDir = path.join(process.cwd(), 'responses');
if (!fs.existsSync(responsesDir)) {
  fs.mkdirSync(responsesDir);
}
app.use('/audio', express.static(responsesDir)); 

app.post('/api/chat', requireAuth(), upload.single('attachment'), async (req, res) => {

  const userId= req.auth.userId;
  console.log(`[AUTH SUCCESS] Request recieved from authenticated user: ${userId}`);
  
  try {
    const message = req.body.message;
    const sessionId = req.body.sessionId || 'default';
    const targetLanguage = req.body.targetLanguage || 'Auto';
    const outputMode = req.body.outputMode || 'default';
    const file = req.file; 
    
    console.log(`[Session: ${sessionId}] User says: ${message}`);
    
    const textResponse = await askBrain(message, file, sessionId);
    const speechReadyReply = await transformReplyForSpeech(textResponse, outputMode);
    const translatedReply = await translateForTts(speechReadyReply, targetLanguage);
    const ttsInput = translatedReply || speechReadyReply || textResponse;
    const ttsText = ttsInput.replace(/https?:\/\/[^\s]+/g, "the links provided in the chat");
    const fileName = await speakText(ttsText);

    if (file) fs.unlinkSync(file.path);

    res.json({ 
        reply: textResponse,
        speechReadyReply,
        translatedReply,
        outputMode,
        targetLanguage,
        audioUrl: `${BASE_URL}/audio/${fileName}`,
        fileName: fileName 
    });

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post('/api/session/delete', (req, res) => {
  const { sessionId, audioFiles } = req.body;
  
  clearBrainSession(sessionId);

  // 2. Delete the specific audio files from the 'responses' folder
  if (audioFiles && audioFiles.length > 0) {
    audioFiles.forEach(fileName => {
      const filePath = path.join(responsesDir, fileName); // Look inside responses/
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted audio file: responses/${fileName}`);
      }
    });
  }

  res.json({ success: true, message: "Session and files deleted." });
});

app.listen(PORT, () => {
  console.log(`--- SpeakGrid AI API running on http://localhost:${PORT} ---`);
});
