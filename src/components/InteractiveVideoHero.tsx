import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HeartHandshake,
  Building,
  Heart,
  Zap,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DURATION_SECONDS = 8.0;
const TOTAL_FRAMES = 192;

interface Chapter {
  id: string;
  name: string;
  startSec: number;
  badge: string;
  headline: string;
  desc: string;
  icon: any;
  accent: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    name: '1. Rescue Rush',
    startSec: 0.0,
    badge: 'SURPLUS DISPATCH',
    headline: 'High-Speed Hyperlocal Food Rescue',
    desc: 'Untouched wedding and banquet meals dispatched within 60 seconds before quality drops.',
    icon: Truck,
    accent: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    id: 'ch2',
    name: '2. Safety Portal',
    startSec: 2.3,
    badge: 'FSSAI SAFETY SCIENCE',
    headline: 'Immutable Safe-Until Timers',
    desc: 'Real-time countdowns enforce strict food safety. When time runs out, human distribution locks.',
    icon: ShieldCheck,
    accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    id: 'ch3',
    name: '3. Delivery Fleet',
    startSec: 5.0,
    badge: 'LOGISTICS DEADLOCK BROKEN',
    headline: 'Live App Quoting & 50/50 Splits',
    desc: 'Propose live Porter, Dunzo, or Rapido courier fares. Transparent 5-way cost sharing stops delivery friction.',
    icon: Zap,
    accent: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
  },
  {
    id: 'ch4',
    name: '4. Hatch Opens',
    startSec: 7.0,
    badge: '100% ZERO-WASTE',
    headline: 'Nourishing Shelters & Gaushalas',
    desc: 'The food truck arrives! Serving orphanages, night shelters, or routing to local cattle sanctuaries.',
    icon: Heart,
    accent: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  }
];

export const InteractiveVideoHero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DURATION_SECONDS);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);

  // Active chapter based on currentTime
  const currentChapter =
    CHAPTERS.slice().reverse().find((ch) => currentTime >= ch.startSec) || CHAPTERS[0];

  // Listen to video time updates
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const restartVideo = () => {
    seekTo(0);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Autoplay on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // Autoplay blocked by browser policy until interaction
      setIsPlaying(false);
    });
  }, []);

  const currentFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round((currentTime / duration) * TOTAL_FRAMES)));
  const isHatchOpen = currentTime >= 6.9;

  return (
    /* Double-Bezel Hardware Architecture (outer shell + inner core) */
    <div
      ref={containerRef}
      className="p-2 sm:p-2.5 rounded-[2.2rem] bg-slate-900/40 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl transition-all"
    >
      <div className="relative rounded-[calc(2.2rem-0.6rem)] overflow-hidden bg-slate-950 border border-slate-800 text-white shadow-inner">
        {/* Top Floating Glass Island */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-black/70 backdrop-blur-md text-amber-400 border border-amber-400/30 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Cinematic Launch Video • 192 Frames</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/10 backdrop-blur-md text-slate-300">
              Frame {currentFrame} / {TOTAL_FRAMES}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-transform active:scale-95"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video Surface */}
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
          {!isVideoLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-slate-400 font-mono tracking-wider">Streaming high-speed video...</span>
            </div>
          )}
          <video
            ref={videoRef}
            src="/ahara_launch_fast.mp4"
            playsInline
            muted
            loop
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onLoadedData={() => setIsVideoLoaded(true)}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer select-none"
          />

          {/* Deep Cinematic Ambient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 pointer-events-none" />

          {/* Dynamic Story Overlay (Updates with each chapter) */}
          <div className="absolute bottom-20 left-4 sm:left-8 right-4 sm:right-8 z-20 pointer-events-none">
            <div className="max-w-xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-sm ${currentChapter.accent}`}>
                <currentChapter.icon className="w-3 h-3" />
                <span>{currentChapter.badge}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                {currentChapter.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 drop-shadow">
                {currentChapter.desc}
              </p>
            </div>
          </div>

          {/* Hatch Opened Portal Reveal (Frames 170+) */}
          {isHatchOpen && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-200">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                  <span>The Serving Hatch Is Open!</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    Step Directly Into AHARA
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    Surplus meals safely routed. Select your portal to begin active coordination:
                  </p>
                </div>

                {/* Nested Button-in-Button Architecture */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Link
                    to="/donor"
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4" />
                      <span>Donor Portal</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>

                  <Link
                    to="/receiver"
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>Recipient Portal</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </div>

                <button
                  onClick={restartVideo}
                  className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1.5 pt-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Video Story from Start</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Fluid Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800/80 space-y-3">
          {/* Hardware Scrubber Bar */}
          <div className="relative group">
            <input
              type="range"
              min={0}
              max={duration || DURATION_SECONDS}
              step={0.05}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            />
            {/* Chapter Markers */}
            <div className="absolute -top-1 left-0 right-0 flex justify-between pointer-events-none px-1">
              {CHAPTERS.map((ch) => (
                <span
                  key={ch.id}
                  style={{ left: `${(ch.startSec / (duration || DURATION_SECONDS)) * 100}%` }}
                  className="w-1.5 h-3 bg-slate-600 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Controls + Chapter Jump Chips */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-600/30 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={restartVideo}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-slate-400 ml-2">
                {currentTime.toFixed(1)}s / {(duration || DURATION_SECONDS).toFixed(1)}s
              </span>
            </div>

            {/* Quick Chapter Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              {CHAPTERS.map((ch) => {
                const isActive = currentChapter.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => seekTo(ch.startSec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <ch.icon className="w-3.5 h-3.5" />
                    <span>{ch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
