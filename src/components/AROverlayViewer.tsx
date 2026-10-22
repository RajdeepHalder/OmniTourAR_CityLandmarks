import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Info,
  Volume2,
  Film,
  BookOpen,
  Camera,
  MapPin,
  Check,
  Eye,
  Sliders,
  Share2,
  Bookmark,
  Calendar,
  Building,
} from 'lucide-react';
import { LandmarkData, ARPointOfInterest } from '../types';

interface AROverlayViewerProps {
  landmark: LandmarkData;
  onOpenClip: () => void;
  onOpenHistory: () => void;
  onRescan: () => void;
  isSavedToPassport: boolean;
  onSaveToPassport: () => void;
}

type ARMode = 'vision' | 'lidar' | 'timetravel' | 'night';

export const AROverlayViewer: React.FC<AROverlayViewerProps> = ({
  landmark,
  onOpenClip,
  onOpenHistory,
  onRescan,
  isSavedToPassport,
  onSaveToPassport,
}) => {
  const [activePin, setActivePin] = useState<ARPointOfInterest | null>(
    landmark.arPointsOfInterest[0] || null
  );
  const [arMode, setArMode] = useState<ARMode>('vision');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Category color mapping
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Architecture':
        return 'from-cyan-500 to-blue-500 text-cyan-300 border-cyan-500/40';
      case 'Engineering':
        return 'from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/40';
      case 'History':
        return 'from-amber-500 to-orange-500 text-amber-300 border-amber-500/40';
      case 'Mystery':
        return 'from-purple-500 to-pink-500 text-purple-300 border-purple-500/40';
      case 'Art':
        return 'from-rose-500 to-red-500 text-rose-300 border-rose-500/40';
      default:
        return 'from-sky-500 to-indigo-500 text-sky-300 border-sky-500/40';
    }
  };

  // Filter styles for AR modes
  const getFilterStyle = (): React.CSSProperties => {
    switch (arMode) {
      case 'lidar':
        return {
          filter: 'invert(88%) hue-rotate(180deg) contrast(150%) saturate(140%) brightness(95%)',
        };
      case 'timetravel':
        return {
          filter: 'sepia(80%) contrast(120%) brightness(85%) hue-rotate(-20deg)',
        };
      case 'night':
        return {
          filter: 'brightness(60%) contrast(140%) saturate(160%) hue-rotate(210deg)',
        };
      case 'vision':
      default:
        return {};
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Exploring ${landmark.name} in ${landmark.city}, ${landmark.country} with OmniTour AR!`
    );
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-2 px-4 sm:px-6">
      {/* Top Action & Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-semibold px-2">
            AR SHADER:
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setArMode('vision')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                arMode === 'vision'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vision AR
            </button>
            <button
              onClick={() => setArMode('lidar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                arMode === 'lidar'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LiDAR Matrix
            </button>
            <button
              onClick={() => setArMode('timetravel')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                arMode === 'timetravel'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Time Travel ({landmark.yearBuiltOrInaugurated})
            </button>
            <button
              onClick={() => setArMode('night')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                arMode === 'night'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Night Glow
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              showHotspots
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showHotspots ? 'Pins Visible' : 'Pins Hidden'}</span>
          </button>

          <button
            onClick={onSaveToPassport}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isSavedToPassport
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSavedToPassport ? 'Saved to Passport' : 'Stamp Passport'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
            title="Share Landmark Discovery"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main AR Viewport Display */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-3xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950/50">
        {/* Base Landmark Image with dynamic AR Shader Filter */}
        <img
          src={landmark.capturedImage}
          alt={landmark.name}
          className="w-full h-full object-cover select-none transition-all duration-700"
          style={getFilterStyle()}
        />

        {/* LiDAR Mesh Overlay Texture when in LiDAR mode */}
        {arMode === 'lidar' && (
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        )}

        {/* Vintage Vignette when in Time Travel mode */}
        {arMode === 'timetravel' && (
          <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(40,20,10,0.6)_100%] pointer-events-none mix-blend-multiply" />
        )}

        {/* Cyberpunk HUD Frame Elements */}
        <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
          {/* Top HUD stats */}
          <div className="flex items-start justify-between">
            <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30 max-w-sm pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                  IDENTIFIED LANDMARK
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {Math.round((landmark.confidence || 0.95) * 100)}% CONFIDENCE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {landmark.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  {landmark.city}, {landmark.country}
                  {landmark.neighborhoodOrArea ? ` (${landmark.neighborhoodOrArea})` : ''}
                </span>
              </div>
            </div>

            {/* Quick action buttons on HUD */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={onOpenClip}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>Watch AR Narrated Clip</span>
              </button>
              <button
                onClick={onOpenHistory}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-cyan-500/30 backdrop-blur-md transition-all hover:border-cyan-400"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Google Search History</span>
              </button>
            </div>
          </div>

          {/* Bottom HUD Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-cyan-300/90 pointer-events-auto">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>STYLE: {landmark.architecturalStyle}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>ERA: {landmark.yearBuiltOrInaugurated}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {landmark.approximateCoordinates?.latitude?.toFixed(4)}°N,{' '}
                {landmark.approximateCoordinates?.longitude?.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic AR Hotspots / POI Pins mapped to landmark image */}
        {showHotspots &&
          landmark.arPointsOfInterest.map((poi, idx) => {
            const isSelected = activePin?.id === poi.id;
            return (
              <div
                key={poi.id || idx}
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
              >
                {/* Interactive Pulsing Pin Button */}
                <button
                  onClick={() => setActivePin(isSelected ? null : poi)}
                  className={`group relative flex items-center justify-center transition-transform hover:scale-125 focus:outline-none ${
                    isSelected ? 'scale-125 z-30' : ''
                  }`}
                  title={`${poi.title} (${poi.category})`}
                >
                  <span className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 text-[10px] font-mono font-bold transition-all ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 border-white shadow-cyan-400/80 scale-110'
                        : 'bg-slate-950/90 text-cyan-300 border-cyan-400/70 hover:bg-cyan-500 hover:text-slate-950'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Hotspot Floating Label */}
                  <span className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-950/90 text-cyan-300 text-[10px] font-bold font-mono whitespace-nowrap border border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                    {poi.title}
                  </span>
                </button>
              </div>
            );
          })}

        {/* Selected AR Hotspot Callout Card */}
        {activePin && (
          <div
            className="absolute z-30 transform -translate-x-1/2 bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-400/60 p-4 rounded-2xl shadow-2xl shadow-cyan-950 max-w-xs sm:max-w-sm transition-all animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: `${Math.max(20, Math.min(80, activePin.x))}%`,
              top: `${Math.max(15, Math.min(70, activePin.y - 12))}%`,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-gradient-to-r ${getCategoryColor(
                  activePin.category
                )}`}
              >
                {activePin.category.toUpperCase()}
              </span>
              <button
                onClick={() => setActivePin(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{activePin.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {activePin.description}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
              <span>AR NODE #{activePin.id || 'POI'}</span>
              <button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(
                    `${activePin.title}. ${activePin.description}`
                  );
                  window.speechSynthesis?.speak(utterance);
                }}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
              >
                <Volume2 className="w-3 h-3" />
                <span>Audio Cue</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Architectural Intelligence & Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary Card */}
        <div className="md:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Architectural Identity & Visual Synthesis
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {landmark.briefSummary}
            </p>
            {landmark.visualCharacteristics && (
              <p className="text-xs text-slate-400 leading-relaxed mt-2 border-l-2 border-cyan-500/40 pl-3 italic">
                "{landmark.visualCharacteristics}"
              </p>
            )}
          </div>

          {/* Key Facts Chips */}
          {landmark.keyDimensionsOrFacts && landmark.keyDimensionsOrFacts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
              {landmark.keyDimensionsOrFacts.map((fact, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950 text-cyan-300 border border-cyan-500/20"
                >
                  {fact}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hotspots Quick Explorer List */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>AR Focal Points</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              {landmark.arPointsOfInterest.length} PINS
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {landmark.arPointsOfInterest.map((poi, idx) => (
              <button
                key={poi.id || idx}
                onClick={() => setActivePin(poi)}
                className={`p-2 rounded-xl text-left transition-all border ${
                  activePin?.id === poi.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{poi.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    #{idx + 1}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {poi.category} • {poi.description}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={onRescan}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan Another Landmark</span>
          </button>
        </div>
      </div>
    </div>
  );
};
