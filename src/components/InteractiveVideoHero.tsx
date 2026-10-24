import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TOTAL_FRAMES = 192;
const FPS = 24; // 24 frames per second -> ~8 seconds total

interface Chapter {
  id: string;
  name: string;
  startFrame: number;
  badge: string;
  headline: string;
  desc: string;
  icon: any;
  color: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    name: '1. Rescue Rush',
    startFrame: 1,
    badge: 'SURPLUS ON THE MOVE',
    headline: 'High-Speed Hyperlocal Food Rescue',
    desc: 'Surplus food from weddings and caterers dispatched within minutes before quality degrades.',
    icon: Truck,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'ch2',
    name: '2. Safety Portal',
    startFrame: 55,
    badge: 'FSSAI SAFETY SCIENCE',
    headline: 'Immutable Safe-Until Timers',
    desc: 'Real-time countdowns enforce public health safety. When time runs out, human claims lock automatically.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'ch3',
    name: '3. Delivery Fleet',
    startFrame: 120,
    badge: 'LOGISTICS DEADLOCK BROKEN',
    headline: 'Dynamic Quoting & 50/50 Splits',
    desc: 'Propose live Porter, Dunzo, or Rapido quotes. Transparent 5-way cost sharing stops delivery friction.',
    icon: Zap,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'ch4',
    name: '4. Hatch Opens',
    startFrame: 180,
    badge: '100% ZERO-WASTE ACHIEVED',
    headline: 'Nourishing Shelters & Gaushalas',
    desc: 'The truck arrives! Food is served to orphanages, night shelters, or diverted to cattle shelters.',
    icon: Heart,
    color: 'from-rose-500 to-emerald-600'
  }
];

export const InteractiveVideoHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null));

  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Determine current active chapter
  const currentChapter =
    CHAPTERS.slice().reverse().find((ch) => currentFrame >= ch.startFrame) || CHAPTERS[0];

  // Helper to get frame path
  const getFramePath = (index: number) => {
    const padded = String(index).padStart(4, '0');
    return `/frames/frame_${padded}.jpg`;
  };

  // Draw a given frame on canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (img && img.complete && img.naturalWidth > 0) {
      // Auto fit aspect ratio
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Preload frames progressively
  useEffect(() => {
    let isMounted = true;

    // Load first frame immediately
    const firstImg = new Image();
    firstImg.src = getFramePath(1);
    firstImg.onload = () => {
      if (!isMounted) return;
      imagesRef.current[1] = firstImg;
      setLoadedCount(1);
      setIsLoadingInitial(false);
      drawFrame(1);

      // Sequentially load the rest
      let index = 2;
      const loadNext = () => {
        if (!isMounted || index > TOTAL_FRAMES) return;
        const img = new Image();
        img.src = getFramePath(index);
        img.onload = () => {
          if (!isMounted) return;
          imagesRef.current[index] = img;
          setLoadedCount(index);
          index++;
          if (index <= TOTAL_FRAMES) {
            // Batch loads in small idle chunks
            if (index % 10 === 0) {
              setTimeout(loadNext, 10);
            } else {
              loadNext();
            }
          }
        };
        img.onerror = () => {
          index++;
          loadNext();
        };
      };
      loadNext();
    };

    return () => {
      isMounted = false;
    };
  }, [drawFrame]);

  // Video playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 1000 / FPS;
    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev >= TOTAL_FRAMES ? 1 : prev + 1;
        drawFrame(next);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, drawFrame]);

  // User manually scrubs frame
  const handleScrub = (newFrame: number) => {
    setCurrentFrame(newFrame);
    drawFrame(newFrame);
  };

  const jumpToChapter = (startFrame: number) => {
    handleScrub(startFrame);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const restartVideo = () => {
    handleScrub(1);
    setIsPlaying(true);
  };

  const isHatchOpen = currentFrame >= 170;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl text-white">
      {/* Top Banner Tag */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-amber-400 border border-amber-400/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>CINEMATIC LAUNCH STORY • 192 FRAMES</span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 backdrop-blur-md text-slate-300">
          Frame {currentFrame} / {TOTAL_FRAMES}
        </span>
      </div>

      {/* Video Canvas Container */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {isLoadingInitial && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading AHARA Video Experience...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer select-none"
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" />

        {/* Dynamic Story Overlay (Updates with each video chapter) */}
        <div className="absolute bottom-16 sm:bottom-20 left-4 sm:left-8 right-4 sm:right-8 z-20 pointer-events-none">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-md">
              <currentChapter.icon className="w-3 h-3 text-slate-950" />
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

        {/* Interactive Hatch Open Modal: Emerges when hatch is open (frame 170+) */}
        {isHatchOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl shadow-emerald-500/20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                <span>The Serving Kitchen Is Open!</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  Step Inside AHARA
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Surplus food safely arrived. Choose your portal or explore the interactive feature playgrounds below:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                  to="/donor"
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Enter Donor Portal</span>
                </Link>

                <Link
                  to="/receiver"
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-transform hover:scale-105"
                >
                  <Building className="w-4 h-4" />
                  <span>Enter Recipient Portal</span>
                </Link>
              </div>

              <button
                onClick={() => handleScrub(1)}
                className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 pt-1 underline"
              >
                <RotateCcw className="w-3 h-3" />
                Replay Cinematic Intro Video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Interactive Control Bar */}
      <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-3">
        {/* Scrubber Range */}
        <div className="relative group">
          <input
            type="range"
            min={1}
            max={TOTAL_FRAMES}
            value={currentFrame}
            onChange={(e) => handleScrub(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
          />
          {/* Chapter Tick Marks */}
          <div className="absolute -top-1 left-0 right-0 flex justify-between pointer-events-none px-1">
            {CHAPTERS.map((ch) => (
              <span
                key={ch.id}
                style={{ left: `${(ch.startFrame / TOTAL_FRAMES) * 100}%` }}
                className="w-1.5 h-3 bg-slate-600 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Buttons & Chapter Jump Chips */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-600/30"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={restartVideo}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Replay from start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-slate-400 ml-2">
              {Math.floor((currentFrame / FPS) * 10) / 10}s / ~8.0s
              {loadedCount < TOTAL_FRAMES && (
                <span className="ml-2 text-[10px] text-amber-400">
                  (Loading {loadedCount}/{TOTAL_FRAMES})
                </span>
              )}
            </span>
          </div>

          {/* Quick Chapter Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {CHAPTERS.map((ch) => {
              const isActive = currentChapter.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => jumpToChapter(ch.startFrame)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
  );
};
