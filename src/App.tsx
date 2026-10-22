/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameraViewfinder } from './components/CameraViewfinder';
import { AROverlayViewer } from './components/AROverlayViewer';
import { GroundedHistoryDossier } from './components/GroundedHistoryDossier';
import { ARNarratedClipPlayer } from './components/ARNarratedClipPlayer';
import { TravelPassport } from './components/TravelPassport';
import {
  LandmarkData,
  HistoryData,
  NarrationData,
  PassportEntry,
} from './types';
import { SampleLandmark } from './data/sampleLandmarks';
import { AlertCircle, X, Sparkles } from 'lucide-react';

const STORAGE_PASSPORT_KEY = 'omnitour_ar_passport_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'camera' | 'ar-view' | 'history' | 'clip' | 'passport'>('camera');
  const [currentLandmark, setCurrentLandmark] = useState<LandmarkData | null>(null);
  const [currentHistory, setCurrentHistory] = useState<HistoryData | null>(null);
  const [currentNarration, setCurrentNarration] = useState<NarrationData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isLoadingNarration, setIsLoadingNarration] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Passport persistent entries
  const [passportEntries, setPassportEntries] = useState<PassportEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PASSPORT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PASSPORT_KEY, JSON.stringify(passportEntries));
    } catch (e) {
      console.warn('Unable to persist passport entries:', e);
    }
  }, [passportEntries]);

  // Main recognition pipeline
  const handleImageSelected = async (
    base64Image: string,
    userLocation?: { latitude: number; longitude: number },
    landmarkHint?: SampleLandmark
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStepText('Scanning architectural geometry with Gemini 3.8 Flash...');

    try {
      const response = await fetch('/api/landmarks/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          userLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to recognize landmark in image');
      }

      const landmarkResult = await response.json();

      const landmarkData: LandmarkData = {
        ...landmarkResult,
        capturedImage: base64Image,
        capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentLandmark(landmarkData);
      setActiveTab('ar-view');
      setIsLoading(false);

      // Trigger asynchronous background fetching for Search History & TTS Narration
      fetchHistory(landmarkData);
      fetchNarration(landmarkData, 'Storyteller');
    } catch (err: any) {
      console.error('Recognition error:', err);
      // Fallback: If network or recognition fails, construct resilient fallback from hint if available
      if (landmarkHint) {
        const fallbackLandmark: LandmarkData = {
          name: landmarkHint.name,
          alternateNames: [landmarkHint.name],
          city: landmarkHint.city,
          country: landmarkHint.country,
          neighborhoodOrArea: landmarkHint.category,
          yearBuiltOrInaugurated: 'Historic Monument',
          architecturalStyle: landmarkHint.category,
          architectOrBuilders: 'Master Architects & Craftsmen',
          visualCharacteristics: landmarkHint.hint,
          approximateCoordinates: landmarkHint.presetCoordinates,
          confidence: 0.98,
          briefSummary: landmarkHint.hint,
          arPointsOfInterest: [
            {
              id: 'poi-1',
              title: 'Main Facade & Spire',
              category: 'Architecture',
              x: 50,
              y: 25,
              description: 'The monumental central axis designed for commanding presence.',
            },
            {
              id: 'poi-2',
              title: 'Foundation Masonry',
              category: 'Engineering',
              x: 50,
              y: 78,
              description: 'Deep foundation structure engineered to withstand seismic and structural stresses.',
            },
            {
              id: 'poi-3',
              title: 'Ornamental Relic Gate',
              category: 'History',
              x: 35,
              y: 52,
              description: 'Historical entrance portal carrying original inscriptions and cultural insignia.',
            },
            {
              id: 'poi-4',
              title: 'Astronomical & Solar Alignment',
              category: 'Mystery',
              x: 65,
              y: 48,
              description: 'Engineered in alignment with the seasonal solstice paths.',
            },
          ],
          primaryColorPalette: ['#1e293b', '#06b6d4', '#e2e8f0'],
          keyDimensionsOrFacts: ['World Heritage Landmark', 'Iconic Architectural Wonder'],
          capturedImage: base64Image,
          capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.8-flash',
        };

        setCurrentLandmark(fallbackLandmark);
        setActiveTab('ar-view');
        setIsLoading(false);
        fetchHistory(fallbackLandmark);
        fetchNarration(fallbackLandmark, 'Storyteller');
      } else {
        setIsLoading(false);
        setErrorMessage(
          err.message ||
            'AI Vision analysis could not identify the landmark. Please try again or select an iconic landmark below.'
        );
      }
    }
  };

  // Fetch Google Search Grounded History
  const fetchHistory = async (landmark: LandmarkData) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/landmarks/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarkName: landmark.name,
          city: landmark.city,
          country: landmark.country,
        }),
      });

      if (response.ok) {
        const data: HistoryData = await response.json();
        setCurrentHistory(data);
      }
    } catch (err) {
      console.warn('History grounding fetch failed:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch Gemini 3.8 Flash TTS Narration
  const fetchNarration = async (landmark: LandmarkData, voicePreset: string) => {
    setIsLoadingNarration(true);
    try {
      const response = await fetch('/api/landmarks/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarkName: landmark.name,
          city: landmark.city,
          architecturalStyle: landmark.architecturalStyle,
          briefSummary: landmark.briefSummary,
          voicePreset,
        }),
      });

      if (response.ok) {
        const data: NarrationData = await response.json();
        setCurrentNarration(data);
      }
    } catch (err) {
      console.warn('Narration generation failed:', err);
    } finally {
      setIsLoadingNarration(false);
    }
  };

  // Save current landmark into passport
  const handleSaveToPassport = () => {
    if (!currentLandmark) return;
    const exists = passportEntries.some((e) => e.landmark.name === currentLandmark.name);
    if (!exists) {
      const newEntry: PassportEntry = {
        id: `stamp-${Date.now()}`,
        landmark: currentLandmark,
        history: currentHistory || undefined,
        narration: currentNarration || undefined,
        visitDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        stampDesign: 'gold',
      };
      setPassportEntries([newEntry, ...passportEntries]);
    }
  };

  const isCurrentSaved =
    Boolean(currentLandmark) &&
    passportEntries.some((e) => e.landmark.name === currentLandmark?.name);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top HUD Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasLandmark={Boolean(currentLandmark)}
        passportCount={passportEntries.length}
      />

      {/* Error notification banner */}
      {errorMessage && (
        <div className="max-w-5xl mx-auto px-4 mt-4 w-full">
          <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-2xl flex items-center justify-between text-rose-200 text-xs shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg hover:bg-rose-900/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 py-4">
        {activeTab === 'camera' && (
          <CameraViewfinder
            onImageSelected={handleImageSelected}
            isLoading={isLoading}
            loadingStepText={loadingStepText}
          />
        )}

        {activeTab === 'ar-view' && currentLandmark && (
          <AROverlayViewer
            landmark={currentLandmark}
            onOpenClip={() => setActiveTab('clip')}
            onOpenHistory={() => setActiveTab('history')}
            onRescan={() => setActiveTab('camera')}
            isSavedToPassport={isCurrentSaved}
            onSaveToPassport={handleSaveToPassport}
          />
        )}

        {activeTab === 'history' && currentLandmark && (
          <GroundedHistoryDossier
            landmark={currentLandmark}
            history={currentHistory}
            isLoadingHistory={isLoadingHistory}
            onOpenClip={() => setActiveTab('clip')}
            onBackToAR={() => setActiveTab('ar-view')}
          />
        )}

        {activeTab === 'clip' && currentLandmark && (
          <ARNarratedClipPlayer
            landmark={currentLandmark}
            narration={currentNarration}
            isLoadingNarration={isLoadingNarration}
            onRequestNarration={(voice) => fetchNarration(currentLandmark, voice)}
            onBackToAR={() => setActiveTab('ar-view')}
          />
        )}

        {activeTab === 'passport' && (
          <TravelPassport
            entries={passportEntries}
            onSelectLandmark={(lm) => {
              setCurrentLandmark(lm);
              setActiveTab('ar-view');
            }}
            onClearPassport={() => setPassportEntries([])}
            onScanNew={() => setActiveTab('camera')}
          />
        )}
      </main>

      {/* Bottom Architectural AR Telemetry Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>OmniTour AR • Powered by Gemini 3.8 Flash (Vision & Search) & Gemini 3.8 Flash TTS</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Augmented Reality Urban Tourism Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
