import React from 'react';
import { Camera, Sparkles, Compass, BookOpen, Film, Award, Volume2, Search, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'camera' | 'ar-view' | 'history' | 'clip' | 'passport';
  setActiveTab: (tab: 'camera' | 'ar-view' | 'history' | 'clip' | 'passport') => void;
  hasLandmark: boolean;
  passportCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasLandmark,
  passportCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('camera')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-lg">
                  OmniTour
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide font-mono">
                VISION • SEARCH • TTS
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'camera'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">Scanner</span>
          </button>

          <button
            onClick={() => hasLandmark && setActiveTab('ar-view')}
            disabled={!hasLandmark}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              !hasLandmark
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'ar-view'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>AR View</span>
          </button>

          <button
            onClick={() => hasLandmark && setActiveTab('history')}
            disabled={!hasLandmark}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              !hasLandmark
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={() => hasLandmark && setActiveTab('clip')}
            disabled={!hasLandmark}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              !hasLandmark
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'clip'
                ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 border border-indigo-500/50 shadow-sm shadow-indigo-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Film className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">AR Clip</span>
          </button>

          <button
            onClick={() => setActiveTab('passport')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
              activeTab === 'passport'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Passport</span>
            {passportCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                {passportCount}
              </span>
            )}
          </button>
        </nav>

        {/* AI Capability Tags */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title="Vision via Gemini 3.8 Flash">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Flash Vision</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title="Grounded via Gemini 3.8 Flash + Google Search">
            <Search className="w-3 h-3 text-sky-400" />
            <span>Search Grounded</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title="TTS via Gemini 3.8 Flash TTS">
            <Volume2 className="w-3 h-3 text-purple-400" />
            <span>Flash TTS</span>
          </div>
        </div>
      </div>
    </header>
  );
};
