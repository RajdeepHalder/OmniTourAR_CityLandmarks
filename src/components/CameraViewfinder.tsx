import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Upload,
  RefreshCw,
  Compass,
  MapPin,
  Crosshair,
  Sliders,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_LANDMARKS, SampleLandmark } from '../data/sampleLandmarks';

interface CameraViewfinderProps {
  onImageSelected: (base64Image: string, userLocation?: { latitude: number; longitude: number }, landmarkHint?: SampleLandmark) => void;
  isLoading: boolean;
  loadingStepText: string;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onImageSelected,
  isLoading,
  loadingStepText,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [simulatedHeading, setSimulatedHeading] = useState<number>(312);
  const [simulatedPitch, setSimulatedPitch] = useState<number>(-4);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Obtain geolocation if permitted
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          });
        },
        (err) => {
          console.warn('Geolocation unavailable or denied:', err.message);
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, []);

  // Gyro / orientation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedHeading((prev) => (prev + (Math.random() * 0.4 - 0.2) + 360) % 360);
      setSimulatedPitch((prev) => Math.max(-15, Math.min(15, prev + (Math.random() * 0.6 - 0.3))));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Hard stop camera tracks immediately
  const stopCamera = () => {
    // 1. Stop all tracks stored in streamRef
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
      } catch (err) {
        console.warn('Error stopping streamRef tracks:', err);
      }
      streamRef.current = null;
    }

    // 2. Stop any stream attached to the video DOM element
    if (videoRef.current) {
      try {
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => {
            track.enabled = false;
            track.stop();
          });
        }
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      } catch (err) {
        console.warn('Error clearing video element:', err);
      }
    }

    setCameraActive(false);
  };

  // Camera stream initialization
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      // If user switched mode, component unmounted, or turned off while waiting for permission:
      if (!isMountedRef.current || mode !== 'camera') {
        stream.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play interrupted:', e));
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Unable to access device camera:', err);
      setCameraError('Camera access unavailable or blocked. You can upload an image or select a world landmark below.');
      stopCamera();
    }
  };

  // Lifecycle control: stop camera whenever mode changes or component unmounts
  useEffect(() => {
    isMountedRef.current = true;

    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [mode]);

  // Capture frame from live video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply digital zoom crop
    if (zoomLevel > 1) {
      const cropW = width / zoomLevel;
      const cropH = height / zoomLevel;
      const startX = (width - cropW) / 2;
      const startY = (height - cropH) / 2;
      ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, width, height);
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    // Explicitly turn off camera hardware immediately after capturing
    stopCamera();
    onImageSelected(dataUrl, userLocation || undefined);
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop live camera hardware before processing upload
    stopCamera();

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result, userLocation || undefined);
      }
    };
    reader.readAsDataURL(file);
  };

  // Convert Sample Landmark image URL to base64 via temporary canvas
  const handleSelectSample = async (sample: SampleLandmark) => {
    // Stop live camera hardware before loading sample landmark
    stopCamera();

    try {
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageSelected(reader.result, sample.presetCoordinates, sample);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to convert sample landmark image:', err);
      onImageSelected(sample.imageUrl, sample.presetCoordinates, sample);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2 px-4 sm:px-6">
      {/* Viewfinder Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (mode === 'camera' && cameraActive) {
                stopCamera();
              } else {
                setMode('camera');
                startCamera();
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              mode === 'camera' && cameraActive
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{mode === 'camera' && cameraActive ? 'Camera Active' : 'Start Camera'}</span>
          </button>

          {/* Explicit Camera Off Button */}
          {cameraActive && (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
              title="Turn off camera hardware and release device stream"
            >
              <CameraOff className="w-4 h-4 text-rose-400" />
              <span>Turn Off</span>
            </button>
          )}

          <button
            onClick={() => {
              stopCamera();
              setMode('upload');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              mode === 'upload'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* Telemetry info bar */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-400/90">
          <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>{Math.round(simulatedHeading)}° NW</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {userLocation
                ? `${userLocation.latitude}°, ${userLocation.longitude}°`
                : 'GPS Searching...'}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>FOV 84°</span>
          </div>
        </div>
      </div>

      {/* Main Viewfinder Canvas / Video Frame */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-3xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950/40 group">
        {mode === 'camera' ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-6 gap-3 z-10">
                <AlertCircle className="w-10 h-10 text-amber-400 animate-pulse" />
                <p className="text-slate-300 max-w-sm text-sm">
                  {cameraError || 'Initializing camera feed...'}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
                  >
                    Retry Camera
                  </button>
                  <button
                    onClick={() => setMode('upload')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                  >
                    Switch to Upload
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Upload Mode Box */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900/60 to-slate-950 cursor-pointer border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 transition group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300 shadow-lg shadow-cyan-500/10 mb-4">
              <Upload className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Select or Drop a City Photo
            </h3>
            <p className="text-slate-400 text-xs max-w-md text-center mb-4">
              Upload any landmark, cathedral, ancient monument, statue, bridge, or city architecture. Gemini 3.8 Flash will analyze its features.
            </p>
            <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 group-hover:bg-cyan-400 transition">
              Browse Local Photos
            </span>
          </div>
        )}

        {/* Hidden Canvas for Frame Extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {/* AR Viewfinder HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
          {/* Top HUD bar */}
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300/80">
            <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AR VISION HUD v4.0</span>
            </div>
            <div className="bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-2">
              <span>MODEL:</span>
              <span className="text-cyan-400 font-bold">GEMINI 3.8 FLASH</span>
            </div>
          </div>

          {/* Center Target Reticle */}
          <div className="relative self-center flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

            {/* Central crosshair */}
            <div className="w-12 h-12 rounded-full border border-cyan-400/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow" />
            </div>

            {/* Artificial Horizon Line */}
            <div
              className="absolute w-36 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent transition-transform duration-200"
              style={{ transform: `rotate(${simulatedPitch}deg)` }}
            />

            {/* Scanning line animation */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan" />
          </div>

          {/* Bottom HUD bar with zoom & capture button */}
          <div className="flex items-center justify-between pointer-events-auto">
            {/* Zoom selector */}
            <div className="flex items-center gap-1 bg-slate-950/70 backdrop-blur-md p-1 rounded-xl border border-cyan-500/20">
              {[1, 2, 5].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    zoomLevel === z
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>

            {/* Capture shutter button */}
            {mode === 'camera' && cameraActive && (
              <button
                onClick={capturePhoto}
                disabled={isLoading}
                className="relative -top-2 w-16 h-16 rounded-full bg-slate-950 border-4 border-cyan-400 flex items-center justify-center shadow-xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-transform group cursor-pointer focus:outline-none"
                title="Capture Landmark Photo"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-400 group-hover:bg-cyan-300 flex items-center justify-center transition-colors">
                  <Camera className="w-6 h-6 text-slate-950" />
                </div>
              </button>
            )}

            <div className="text-[11px] font-mono text-cyan-400/80 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20 hidden sm:block">
              FRAME: 1920x1080 60FPS
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-white tracking-wide">
                AI Vision Recognition Active
              </h4>
              <p className="text-cyan-400 text-xs font-mono mt-1 animate-pulse">
                {loadingStepText || 'Analyzing architectural geometry with Gemini 4 Argon...'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Flash Vision 3D Facade Parsing</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Google Search Grounding</span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Landmarks Gallery for 1-Tap Exploration */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Explore Iconic World Landmarks (One-Tap Test)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {SAMPLE_LANDMARKS.length} Destinations Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_LANDMARKS.map((landmark) => (
            <button
              key={landmark.id}
              onClick={() => handleSelectSample(landmark)}
              disabled={isLoading}
              className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all text-left focus:outline-none"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={landmark.thumbnailUrl}
                  alt={landmark.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <span className="absolute top-2 right-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
                  {landmark.city}
                </span>
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {landmark.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {landmark.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
