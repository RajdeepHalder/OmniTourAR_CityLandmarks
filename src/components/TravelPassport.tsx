import React from 'react';
import {
  Award,
  Calendar,
  MapPin,
  Film,
  Compass,
  Trash2,
  Sparkles,
  Camera,
  Download,
  BookOpen,
} from 'lucide-react';
import { PassportEntry, LandmarkData } from '../types';

interface TravelPassportProps {
  entries: PassportEntry[];
  onSelectLandmark: (landmark: LandmarkData) => void;
  onClearPassport: () => void;
  onScanNew: () => void;
}

export const TravelPassport: React.FC<TravelPassportProps> = ({
  entries,
  onSelectLandmark,
  onClearPassport,
  onScanNew,
}) => {
  // Badges earned calculation
  const badges = [
    {
      id: 'first-scan',
      title: 'First Landmark Discovery',
      desc: 'Identified your first architectural landmark with Gemini 4 Argon',
      icon: '🏛️',
      unlocked: entries.length >= 1,
    },
    {
      id: 'audio-explorer',
      title: 'Audio Tour Connoisseur',
      desc: 'Experienced an AR-style narrated clip powered by Gemini 3.8 Flash TTS',
      icon: '🎙️',
      unlocked: entries.some((e) => e.narration !== undefined),
    },
    {
      id: 'deep-scholar',
      title: 'History Scholar',
      desc: 'Explored Google Search grounded historical dossiers',
      icon: '📜',
      unlocked: entries.some((e) => e.history !== undefined),
    },
    {
      id: 'globetrotter',
      title: 'World Wonder Seeker',
      desc: 'Collected 3 or more landmarks in your digital passport',
      icon: '🌍',
      unlocked: entries.length >= 3,
    },
  ];

  const handleExportPassport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'omnitour-ar-passport.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2 px-4 sm:px-6">
      {/* Passport Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/80 p-5 rounded-3xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">
              OFFICIAL TRAVEL PASSPORT
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
              {entries.length} STAMPS LOGGED
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Your Architectural Travel Journal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every landmark recognized, grounded, and narrated during your urban explorations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <>
              <button
                onClick={handleExportPassport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                title="Export Passport as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={onClearPassport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition"
                title="Clear Passport entries"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={onScanNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/25 transition-all hover:scale-105"
          >
            <Camera className="w-4 h-4" />
            <span>Scan New Landmark</span>
          </button>
        </div>
      </div>

      {/* Explorer Badges Carousel */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Explorer Achievements</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                b.unlocked
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-50'
              }`}
            >
              <div>
                <span className="text-2xl mb-1 block">{b.icon}</span>
                <h4 className="text-xs font-bold text-slate-200 truncate">{b.title}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                  {b.desc}
                </p>
              </div>
              <span
                className={`mt-2 text-[9px] font-mono font-bold uppercase tracking-wider ${
                  b.unlocked ? 'text-amber-400' : 'text-slate-600'
                }`}
              >
                {b.unlocked ? '✓ UNLOCKED' : 'LOCKED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Passport Stamps Collection */}
      {entries.length === 0 ? (
        <div className="bg-slate-900/40 rounded-3xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
            ✈️
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Your Passport is Empty</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Capture or select a city landmark in the scanner. Once identified, stamp it into your passport to save historical clips and notes.
            </p>
          </div>
          <button
            onClick={onScanNew}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            Launch Scanner Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group bg-slate-900/80 rounded-3xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              {/* Photo Banner with Digital Stamp */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                <img
                  src={entry.landmark.capturedImage}
                  alt={entry.landmark.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Digital Passport Stamp */}
                <div className="absolute top-3 right-3 w-16 h-16 rounded-full border-2 border-dashed border-amber-400 bg-amber-950/80 backdrop-blur-md p-1 flex flex-col items-center justify-center text-center transform rotate-12 shadow-lg">
                  <span className="text-[8px] font-mono font-bold text-amber-300 uppercase tracking-tighter">
                    VISITED
                  </span>
                  <span className="text-[9px] font-extrabold text-white uppercase truncate max-w-[50px]">
                    {entry.landmark.city}
                  </span>
                  <span className="text-[7px] font-mono text-amber-400">
                    {entry.visitDate}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-16">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
                    {entry.landmark.architecturalStyle}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1 leading-tight truncate">
                    {entry.landmark.name}
                  </h3>
                </div>
              </div>

              {/* Card Footer & Action Buttons */}
              <div className="p-4 flex items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-950/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {entry.landmark.city}, {entry.landmark.country}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectLandmark(entry.landmark)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold border border-cyan-500/30 transition-all"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Re-Open AR</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
