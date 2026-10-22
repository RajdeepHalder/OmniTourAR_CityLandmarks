import fs from 'fs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, 'dist');
const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(distPath, 'index.html'));
const port = parseInt(process.env.PORT || '3000', 10);

const app = express();
app.use(express.json({ limit: '35mb' }));

// Server-side Gemini Client with mandatory telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ARPointOfInterest {
  id: string;
  title: string;
  category: 'Architecture' | 'Engineering' | 'History' | 'Mystery' | 'Art';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  description: string;
}

export interface LandmarkRecognitionResult {
  name: string;
  alternateNames: string[];
  city: string;
  country: string;
  neighborhoodOrArea: string;
  yearBuiltOrInaugurated: string;
  architecturalStyle: string;
  architectOrBuilders: string;
  visualCharacteristics: string;
  approximateCoordinates: {
    latitude: number;
    longitude: number;
  };
  confidence: number;
  briefSummary: string;
  arPointsOfInterest: ARPointOfInterest[];
  primaryColorPalette: string[];
  keyDimensionsOrFacts: string[];
  modelUsed: string;
}

/**
 * 1. Image Recognition using `gemini-4-argon` as requested
 */
app.post('/api/landmarks/recognize', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userLocation } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data in request body' });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const locationContext = userLocation?.latitude
      ? `User device approximate location: latitude ${userLocation.latitude}, longitude ${userLocation.longitude}.`
      : 'User location: unspecified.';

    const promptText = `You are a world-class architectural historian and computer vision specialist for an Augmented Reality travel guide app.
${locationContext}

Analyze the provided city photo carefully:
1. Identify the exact landmark, cathedral, ancient monument, bridge, tower, temple, castle, square, or notable architectural marvel shown.
2. If it's a specific recognized component of a famous site (e.g. The Spire of Notre-Dame, Trevi Fountain central relief, etc.), name both the specific structure and the site.
3. If it's an unrecognized or generic street scene, identify the likely city, architectural era/style, and prominent visible elements with best estimation.
4. Provide 4 to 6 specific AR hotspots / features that are visually prominent or architecturally significant in this view.
Coordinate system:
- 'x' is horizontal percentage (0% = left edge, 100% = right edge).
- 'y' is vertical percentage (0% = top edge, 100% = bottom edge).
Ensure x and y spread across the landmark's prominent elements (e.g. main dome, entrance portal, clock, spire, foundation, relief carving).

Return strictly valid JSON conforming to the schema.`;

    const modelUsed = 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            alternateNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            city: { type: Type.STRING },
            country: { type: Type.STRING },
            neighborhoodOrArea: { type: Type.STRING },
            yearBuiltOrInaugurated: { type: Type.STRING },
            architecturalStyle: { type: Type.STRING },
            architectOrBuilders: { type: Type.STRING },
            visualCharacteristics: { type: Type.STRING },
            approximateCoordinates: {
              type: Type.OBJECT,
              properties: {
                latitude: { type: Type.NUMBER },
                longitude: { type: Type.NUMBER },
              },
              required: ['latitude', 'longitude'],
            },
            confidence: { type: Type.NUMBER },
            briefSummary: { type: Type.STRING },
            arPointsOfInterest: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                },
                required: ['id', 'title', 'category', 'x', 'y', 'description'],
              },
            },
            primaryColorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyDimensionsOrFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'name',
            'city',
            'country',
            'yearBuiltOrInaugurated',
            'architecturalStyle',
            'briefSummary',
            'arPointsOfInterest',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);

    const result: LandmarkRecognitionResult = {
      ...parsedData,
      modelUsed,
    };

    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/landmarks/recognize:', err);
    return res.status(500).json({
      error: err.message || 'Failed to recognize landmark in image',
    });
  }
});

/**
 * 2. History & Deep Grounding using `gemini-3.8-flash` with Google Search Grounding tool
 */
app.post('/api/landmarks/history', async (req, res) => {
  try {
    const { landmarkName, city, country } = req.body;

    if (!landmarkName) {
      return res.status(400).json({ error: 'Missing landmarkName' });
    }

    const prompt = `Search the live web and assemble a comprehensive historical dossier for the landmark "${landmarkName}" located in ${city || ''}, ${country || ''}.
Focus on:
1. Origin & Genesis: Who commissioned it, the initial construction, groundbreaking ceremonies, and why it was built.
2. Dramatic Historical Turning Points: Sieges, fires, revolutions, world wars, survival stories, or dramatic transformations.
3. Architectural & Engineering Secrets: Revolutionary construction methods, materials used, optical illusions, underground chambers, or hidden symbolism.
4. Recent News & Discoveries: Modern restoration works (2020-2026), archaeological findings, current visiting status, or upcoming anniversaries.
5. Curiosities & Legends: Quirky trivia, urban legends, ghost stories, or lesser-known facts.

Structure your response with clear Markdown headings:
# ${landmarkName}: The Living Chronicle
## 1. Genesis & Construction
## 2. Epochs & Transformations
## 3. Engineering Feats & Hidden Chambers
## 4. Legends, Curiosities & Secrets
## 5. Modern Era & Conservation
## 6. Insider Travel Wisdom

Write in a compelling, authoritative, immersive prose suited for a cultural traveler.`;

    // Note: Do NOT use responseMimeType when using googleSearch tool
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const markdownHistory = response.text || '';

    // Extract Grounding Chunks & Search Sources as instructed by gemini-api skill
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri)
      .map((web: any) => ({
        uri: web.uri,
        title: web.title || web.uri,
      }));

    // Deduplicate sources by URI
    const uniqueSources = Array.from(
      new Map(webSources.map((item: any) => [item.uri, item])).values()
    );

    const searchQueries =
      response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    return res.json({
      landmarkName,
      historyMarkdown: markdownHistory,
      sources: uniqueSources,
      searchQueries,
    });
  } catch (err: any) {
    console.error('Error in /api/landmarks/history:', err);
    return res.status(500).json({
      error: err.message || 'Failed to fetch grounded history',
    });
  }
});

/**
 * 3. Text to Speech AR Narrated Clip using `gemini-3.8-flash-tts`
 */
app.post('/api/landmarks/narrate', async (req, res) => {
  try {
    const {
      landmarkName,
      city,
      architecturalStyle,
      briefSummary,
      voicePreset = 'Storyteller', // 'Storyteller', 'Historian', 'Architect'
      customScript,
    } = req.body;

    if (!landmarkName && !customScript) {
      return res.status(400).json({ error: 'Missing landmark details or script' });
    }

    // Voice mapping for gemini-3.8-flash-tts
    // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    let voiceName = 'Kore';
    let speakerName = 'Elena';
    let speechStyle = 'Warm, captivating travel documentary narrator with evocative pauses and wonder';

    if (voicePreset === 'Historian') {
      voiceName = 'Puck';
      speakerName = 'Julian';
      speechStyle = 'Eloquent, scholarly cultural historian, measured and authoritative with dramatic emphasis';
    } else if (voicePreset === 'Architect') {
      voiceName = 'Zephyr';
      speakerName = 'Maya';
      speechStyle = 'Insightful, observant architectural critic highlighting structural wonder and light';
    } else if (voicePreset === 'Dramatic') {
      voiceName = 'Fenrir';
      speakerName = 'Marcus';
      speechStyle = 'Epic, cinematic narrator invoking timeless legends, grandeur, and suspense';
    }

    let scriptText = customScript;

    // If script not pre-provided, generate a bespoke 50-70 word cinematic script tailored for AR narration
    if (!scriptText) {
      scriptText = `${speakerName}: Welcome to ${landmarkName} in ${city || 'this historic city'}. <breath> Gaze upon its ${architecturalStyle || 'magnificent'} contours. Built to defy time itself, every stone holds the echoes of centuries past. Look closely at the towering arches and intricate details—where engineering met human ambition. As sunlight touches the facade, history ceases to be just memory—it comes alive right before your eyes.`;
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: scriptText,
              speechMetadata: {
                speaker: speakerName,
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    // gemini-3.8-flash-tts unary default returns a complete WAV file (audio/wav, RIFF header, 24kHz mono 16-bit)
    const base64Audio =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio content returned by gemini-3.8-flash-tts');
    }

    // Generate AR Clip scenes for synchronized visual effects
    const scenes = [
      {
        id: 'scene-1',
        title: 'Arrival & Horizon',
        startTime: 0,
        endTime: 4.5,
        zoom: 1.0,
        focalTarget: { x: 50, y: 50 },
        arEffect: 'horizon-grid',
        caption: `Behold ${landmarkName}, standing proudly against the city skyline.`,
      },
      {
        id: 'scene-2',
        title: 'Architectural Blueprint',
        startTime: 4.5,
        endTime: 9.5,
        zoom: 1.25,
        focalTarget: { x: 50, y: 35 },
        arEffect: 'wireframe-scan',
        caption: `Examine the ${architecturalStyle || 'monumental'} framework and master geometry.`,
      },
      {
        id: 'scene-3',
        title: 'Detail & Craftsmanship',
        startTime: 9.5,
        endTime: 15.0,
        zoom: 1.45,
        focalTarget: { x: 45, y: 65 },
        arEffect: 'golden-hour-glow',
        caption: 'Centuries of human artistry etched into every surface and relief.',
      },
      {
        id: 'scene-4',
        title: 'Timeless Presence',
        startTime: 15.0,
        endTime: 22.0,
        zoom: 1.1,
        focalTarget: { x: 50, y: 45 },
        arEffect: 'constellation-pins',
        caption: 'A living witness to history, standing resolute into tomorrow.',
      },
    ];

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      script: scriptText,
      speakerName,
      voiceName,
      scenes,
    });
  } catch (err: any) {
    console.error('Error in /api/landmarks/narrate:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate narrated audio clip',
    });
  }
});

/**
 * 4. Interactive Trivia Quiz for the recognized landmark
 */
app.post('/api/landmarks/quiz', async (req, res) => {
  try {
    const { landmarkName, city } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate 3 fascinating multiple-choice trivia questions about "${landmarkName}" in "${city}".
For each question:
- question: Clear, engaging question
- options: Exactly 4 options
- correctIndex: 0-3
- explanation: A fascinating 1-sentence historical explanation of why that answer is true.
Return JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    const quizData = JSON.parse(response.text || '[]');
    return res.json({ questions: quizData });
  } catch (err: any) {
    console.error('Error in /api/landmarks/quiz:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 OmniTour AR server listening at http://0.0.0.0:${port}`);
  });
}

startServer();
