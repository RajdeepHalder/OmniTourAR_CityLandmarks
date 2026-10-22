import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  User,
  Music,
  Compass,
  Layers,
  Flame,
  Radio,
} from 'lucide-react';
import { LandmarkData, NarrationData, ARClipScene } from '../types';

interface ARNarratedClipPlayerProps {
  landmark: LandmarkData;
  narration: NarrationData | null;
  isLoadingNarration: boolean;
  onRequestNarration: (voicePreset: string) => void;
  onBackToAR: () => void;
}

export const ARNarratedClipPlayer: React.FC<ARNarratedClipPlayerProps> = ({
  landmark,
  narration,
  isLoadingNarration,
  onRequestNarration,
  onBackToAR,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(20);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('Storyteller');
  const [ambientAudio, setAmbientAudio] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Default scenes if narration data is pending
  const scenes: ARClipScene[] = narration?.scenes || [
    {
      id: 'scene-1',
      title: 'Arrival & Horizon',
      startTime: 0,
      endTime: 5,
      zoom: 1.0,
      focalTarget: { x: 50, y: 50 },
      arEffect: 'horizon-grid',
      caption: `Behold ${landmark.name}, commanding the skyline of ${landmark.city}.`,
    },
    {
      id: 'scene-2',
      title: 'Architectural Blueprint',
      startTime: 5,
      endTime: 10,
      zoom: 1.3,
      focalTarget: { x: 50, y: 35 },
      arEffect: 'wireframe-scan',
      caption: `Constructed in ${landmark.yearBuiltOrInaugurated}, exhibiting pure ${landmark.architecturalStyle} design.`,
    },
    {
      id: 'scene-3',
      title: 'Structural Relics & Craft',
      startTime: 10,
      endTime: 15,
      zoom: 1.5,
      focalTarget: { x: 40, y: 65 },
      arEffect: 'golden-hour-glow',
      caption: 'Every column, vault, and relief holds centuries of human dedication.',
    },
    {
      id: 'scene-4',
      title: 'Living Legacy',
      startTime: 15,
      endTime: 22,
      zoom: 1.15,
      focalTarget: { x: 50, y: 45 },
      arEffect: 'constellation-pins',
      caption: 'Defying the passage of eras, still inspiring millions of travelers.',
    },
  ];

  // Determine current scene based on currentTime
  const currentScene =
    scenes.find((s) => currentTime >= s.startTime && currentTime < s.endTime) ||
    scenes[scenes.length - 1];

  // Handle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn(e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn);
    }
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [narration]);

  // Animated Waveform Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 36;
      const barWidth = canvas.width / bars - 2;

      for (let i = 0; i < bars; i++) {
        // Simulated frequency wave if playing, else calm ambient wave
        const multiplier = isPlaying ? 0.9 : 0.15;
        const wave = Math.sin(phase + i * 0.25) * 0.5 + 0.5;
        const noise = isPlaying ? Math.random() * 0.35 : 0.05;
        const height = Math.max(4, (wave * 0.65 + noise) * canvas.height * multiplier);

        const x = i * (barWidth + 2);
        const y = (canvas.height - height) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + height);
        grad.addColorStop(0, '#22d3ee');
        grad.addColorStop(0.5, '#818cf8');
        grad.addColorStop(1, '#c084fc');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 3);
        ctx.fill();
      }

      phase += isPlaying ? 0.12 : 0.03;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Calculate Camera Pan/Zoom transform for the AR Ken Burns effect
  const getCameraTransform = () => {
    if (!currentScene) return 'scale(1) translate(0%, 0%)';
    const targetX = (50 - currentScene.focalTarget.x) * 0.35;
    const targetY = (50 - currentScene.focalTarget.y) * 0.35;
    return `scale(${currentScene.zoom}) translate(${targetX}%, ${targetY}%)`;
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-6 max-w-5xl mx-auto py-2 px-4 sm:px-6 ${
        isFullscreen ? 'p-6 bg-slate-950 h-screen justify-center' : ''
      }`}
    >
      {/* Top Header & Tour Guide Voice Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>AR Spoken Narrative</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                GEMINI 3.8 FLASH TTS
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Narrator: {narration?.speakerName || 'Elena'} • Voice: {narration?.voiceName || 'Kore'}
            </p>
          </div>
        </div>

        {/* Tour Guide Persona Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'Storyteller', label: 'Elena (Storyteller)' },
            { id: 'Historian', label: 'Julian (Historian)' },
            { id: 'Architect', label: 'Maya (Architect)' },
            { id: 'Dramatic', label: 'Marcus (Epic)' },
          ].map((persona) => (
            <button
              key={persona.id}
              onClick={() => {
                setSelectedVoice(persona.id);
                onRequestNarration(persona.id);
              }}
              disabled={isLoadingNarration}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedVoice === persona.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {persona.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main AR Cinema Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-3xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-950/40 group">
        {/* Dynamic Camera Pan & Zoom Image Container */}
        <div
          className="w-full h-full transition-transform duration-1000 ease-out"
          style={{ transform: getCameraTransform() }}
        >
          <img
            src={landmark.capturedImage}
            alt={landmark.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ambient atmospheric lighting effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* AR Dynamic Scanlines & Scene HUD Layer */}
        <div className="absolute inset-0 pointer-events-none p-5 sm:p-7 flex flex-col justify-between">
          {/* Top telemetry overlay */}
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
            <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>AR DIRECTED CLIP • SCENE: {currentScene?.title?.toUpperCase()}</span>
            </div>
            <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-lg border border-purple-500/30 text-purple-300">
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </div>
          </div>

          {/* Focal Target Reticle moving to current scene focal position */}
          <div
            className="absolute w-20 h-20 border-2 border-dashed border-cyan-400/60 rounded-full flex items-center justify-center transition-all duration-1000 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${currentScene?.focalTarget.x || 50}%`,
              top: `${currentScene?.focalTarget.y || 50}%`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-5 text-[9px] font-mono text-cyan-300 bg-slate-950/80 px-1 rounded">
              AR FOCUS
            </span>
          </div>

          {/* Subtitle Teleprompter Bar */}
          <div className="self-center max-w-2xl text-center bg-slate-950/85 backdrop-blur-xl border border-cyan-500/30 p-3.5 rounded-2xl shadow-xl">
            <p className="text-sm sm:text-base font-medium text-slate-100 leading-snug">
              {currentScene?.caption || narration?.script}
            </p>
          </div>
        </div>

        {/* Loading Spinner for TTS generation */}
        {isLoadingNarration && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30">
            <div className="w-12 h-12 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-purple-300 animate-pulse">
              Generating High-Fidelity Audio with Gemini 3.8 Flash TTS...
            </p>
          </div>
        )}

        {/* Hidden Audio Element for TTS Playback */}
        {narration && (
          <audio
            ref={audioRef}
            src={`data:${narration.mimeType};base64,${narration.audioBase64}`}
            muted={isMuted}
          />
        )}
      </div>

      {/* Media Player Controls & Waveform Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 flex flex-col gap-3 shadow-xl">
        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 20}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            {/* Chapter markers on timeline */}
            {scenes.map((s) => (
              <div
                key={s.id}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-purple-400/80 rounded-sm pointer-events-none"
                style={{ left: `${(s.startTime / (duration || 20)) * 100}%` }}
                title={s.title}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons & Audio Visualizer */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={isLoadingNarration || !narration}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title={isPlaying ? 'Pause Narration' : 'Play Narration'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleRestart}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center transition"
              title="Replay from start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Real-time Frequency Waveform Visualizer */}
          <div className="flex-1 max-w-xs h-10 px-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center">
            <canvas ref={canvasRef} width={260} height={32} className="w-full h-full" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center transition"
              title="Toggle Theater Mode"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onBackToAR}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              Back to AR View
            </button>
          </div>
        </div>
      </div>

      {/* Script & Voice Design Metadata Box */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Spoken Narration Transcript & Voice Cues</span>
          </h4>
          <span className="text-[10px] font-mono text-purple-400">
            MODEL: GEMINI-3.8-FLASH-TTS (WAV 24kHz)
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-serif italic border-l-2 border-purple-500/50 pl-4 py-1">
          "{narration?.script || 'Loading narration script...'}"
        </p>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
