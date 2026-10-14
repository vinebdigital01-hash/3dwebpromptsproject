import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Lock, ArrowRight, Shuffle, Sparkles } from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface StudioTheaterProps {
  onUnlockClick: () => void;
}

export interface FeatureRelease {
  number: string;
  id: string;
  name: string;
  brand: string;
  clientFee: string;
  category: string;
  tokens: string;
  model: string;
  videoUrl: string;
  poster: string;
  description: string;
  specs: string[];
}

export const RELEASES: FeatureRelease[] = [
  {
    number: '01',
    id: 'apple-watch-ultra',
    brand: 'Apple Watch Ultra 4',
    name: 'Apple Watch Ultra 4 Spatial Showcase',
    clientFee: '$18,500',
    category: 'Spatial Hardware & Horology',
    tokens: '3,240 TOKENS',
    model: 'Claude 3.7 Sonnet',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/a3ee62c8-c674-48a3-84a9-e8269eefd621.mp4',
    poster: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&auto=format&fit=crop&q=80',
    description: 'Ultra-precision hardware turntable featuring brushed titanium case specular reflections, orange action button interaction, and dynamic watchface complication switches.',
    specs: ['PBR Anisotropic Titanium', 'Ray-Traced Sapphire Crystal', 'Double-Dome Reflection Shaders'],
  },
  {
    number: '02',
    id: 'dala-workplace',
    brand: 'Dala AI',
    name: 'Dala Workplace Search Experience',
    clientFee: '$15,000',
    category: 'Enterprise AI & Knowledge Graph',
    tokens: '2,890 TOKENS',
    model: 'Cursor + Claude 3.7',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/3863f6a5-d963-4e26-ab94-4f5dae747954.mp4',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
    description: 'Your workplace has the answer. Just ask Dala for it. Real-time floating semantic query vectors, generative answer synthesis, and magnetic cursor navigation.',
    specs: ['Instant Semantic Query Canvas', 'Subtle Frosted Micro-Interactions', 'Linear/Notion-Grade Glassmorphism'],
  },
  {
    number: '03',
    id: 'monopo-saigon',
    brand: 'monopo saigon',
    name: 'Monopo Saigon Creative Showreel',
    clientFee: '$22,000',
    category: 'Global Creative Studio',
    tokens: '3,450 TOKENS',
    model: 'Claude 3.7 + Cursor',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/a2f41146-9aef-429b-b606-91a852661960.mp4',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80',
    description: 'Awwwards Site of the Year standard creative agency showreel with brutalist typography, high-impact scroll momentum, and audio-synced video transitions.',
    specs: ['Momentum Smooth-Scrub Engine', 'Kinetic Editorial Typography', 'Awwwards SOTY Pacing'],
  },
  {
    number: '04',
    id: 'wise',
    brand: 'Wise',
    name: 'Wise Global Money Kinetic Experience',
    clientFee: '$16,500',
    category: 'Global FinTech Leader',
    tokens: '2,650 TOKENS',
    model: 'Claude 3.7 Sonnet',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4',
    poster: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1400&auto=format&fit=crop&q=80',
    description: 'High-conversion currency transfer engine featuring bold oversized display typography, responsive conversion calculators, and slick tactile card flows.',
    specs: ['Bold Tabular Number Engines', 'Real-time Currency Conversion Flow', 'Tactile Input Micro-Interactions'],
  },
  {
    number: '05',
    id: 'resend',
    brand: 'Resend',
    name: 'Resend Developer Dark-Mode System',
    clientFee: '$14,000',
    category: 'Developer Platform',
    tokens: '2,780 TOKENS',
    model: 'Claude 3.7 + v0',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=80',
    description: 'The email API for developers. Sleek obsidian surfaces, glowing hairline borders, live code snippet execution, and ultra-crisp monospace telemetry.',
    specs: ['Obsidian Theme Tokens', 'Subtle Border Gradient Shimmers', 'Interactive Code Sandbox'],
  },
  {
    number: '06',
    id: 'launchdarkly',
    brand: 'LaunchDarkly',
    name: 'LaunchDarkly Enterprise Feature Matrix',
    clientFee: '$17,500',
    category: 'Enterprise SaaS',
    tokens: '3,100 TOKENS',
    model: 'ChatGPT o3 + Cursor',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/8b7c1764-b8c0-4d71-9b7e-6bd84bce04ad.mp4',
    poster: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1400&auto=format&fit=crop&q=80',
    description: 'Interactive toggle flags and dynamic release pipelines with glowing circuit board connections, real-time telemetry metrics, and enterprise risk controls.',
    specs: ['Dynamic Toggle Pipeline State', 'Connected Circuit Line Shaders', 'Enterprise Security Badges'],
  },
  {
    number: '07',
    id: 'auros',
    brand: 'Auros',
    name: 'Auros High-Frequency Trading Core',
    clientFee: '$20,000',
    category: 'Algorithmic Web3 & Quant',
    tokens: '3,380 TOKENS',
    model: 'Claude 3.7 Sonnet',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/ed2c729e-76ce-4ad0-bad8-c57d67247ec7.mp4',
    poster: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1400&auto=format&fit=crop&q=80',
    description: 'Algorithmic trading firm platform featuring real-time liquidity point clouds, live latency ticker meters, and high-frequency order book visualizer.',
    specs: ['Instanced Liquidity Cloud', 'Ultra-Low Latency UI Response', 'Dark Quant Luxury Aesthetics'],
  },
  {
    number: '08',
    id: 'anchor-ai',
    brand: 'Anchor AI',
    name: 'Anchor AI Autonomous Agent Platform',
    clientFee: '$38,500',
    category: 'Autonomous Multi-Agent Systems',
    tokens: '3,750 TOKENS',
    model: 'Claude 3.7 + Cursor',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80',
    description: 'Autonomous multi-agent orchestration console with real-time vector streaming telemetry, glass tactile HUD panels, and instantaneous task dispatch animations.',
    specs: ['Real-Time Vector Streaming', 'Monochrome Glass HUD', 'Sub-16ms Frame Budget'],
  },
  {
    number: '09',
    id: 'alethia-ai',
    brand: 'Alethia AI',
    name: 'Alethia Deep Reasoning Neural Engine',
    clientFee: '$44,000',
    category: 'Cognitive Reasoning Architecture',
    tokens: '3,920 TOKENS',
    model: 'Claude 3.7 Sonnet',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/alethia-video.mp4',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
    description: 'Cognitive neural reasoning interface with live token synthesis lattices, GPU confidence scoring contours, and interactive query visualizer.',
    specs: ['GPU Vertex Lattice Morphing', 'Confidence Scoring Contours', 'Streaming Token Sim'],
  },
  {
    number: '10',
    id: 'geno-trace',
    brand: 'Geno Trace',
    name: 'Geno Trace Bio-Computational Helix',
    clientFee: '$48,000',
    category: 'Precision Genomics & Biotech',
    tokens: '4,100 TOKENS',
    model: 'Claude 3.7 Sonnet',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Geno%20Trace.mp4',
    poster: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1400&auto=format&fit=crop&q=80',
    description: 'High-precision genomic sequencing explorer featuring 3D spatial DNA coordinates, molecular bond raymarching, and interactive CRISPR target highlights.',
    specs: ['Spatial Helix Coordinates', 'CRISPR Target Highlighting', 'Gold Ambient Specular'],
  },
  {
    number: '11',
    id: 'apex-cyber-matrix',
    brand: 'Apex Cyber Matrix',
    name: 'Spatial Cyber Kinetic Grid (Section 21)',
    clientFee: '$32,000',
    category: 'Avant-Garde Kinetic Web',
    tokens: '2,950 TOKENS',
    model: 'GSAP + React 19',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=80',
    description: 'High-density holographic wireframe grid with responsive perspective parallax, floating telemetry indicators, and frictionless scroll momentum.',
    specs: ['GSAP Scroll-Linked Parallax', 'High-Density SVG Wireframe', 'Sub-50KB Asset Footprint'],
  },
  {
    number: '12',
    id: 'quantum-obsidian',
    brand: 'Quantum Obsidian',
    name: 'Dark Obsidian Quantum Hologram (Section 20)',
    clientFee: '$39,000',
    category: 'Spatial PBR & Holography',
    tokens: '3,400 TOKENS',
    model: 'Three.js + Shaders',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(20).webp',
    poster: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=1400&auto=format&fit=crop&q=80',
    description: 'Refractive obsidian optical chamber with Cauchy light dispersion, responsive gyroscope inertia, and dark luxury depth layers.',
    specs: ['Cauchy Light Dispersion', 'Refractive Obsidian PBR', 'Multi-Tier Spatial Parallax'],
  },
];

export const StudioTheater: React.FC<StudioTheaterProps> = ({ onUnlockClick }) => {
  // Randomly select any reel on initial load instead of always showing 01 Apple Watch
  const [activeIdx, setActiveIdx] = useState<number>(() => {
    return Math.floor(Math.random() * RELEASES.length);
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const current = RELEASES[activeIdx];
  const isImageMedia =
    current.videoUrl.toLowerCase().endsWith('.webp') ||
    current.videoUrl.toLowerCase().endsWith('.png') ||
    current.videoUrl.toLowerCase().endsWith('.gif');

  // Automatically scroll the horizontal dock to center the randomly selected release card
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dockRef.current) {
        const activeEl = dockRef.current.querySelector<HTMLElement>('[data-active="true"]');
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeIdx]);

  // Auto-play when user arrives at video, auto-pause when user scrolls away
  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video || isImageMedia) return;

        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(() => {});
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeIdx, isImageMedia]);

  const handleSelect = (idx: number) => {
    sound.playClick();
    setActiveIdx(idx);
    setIsPlaying(true);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  const handleRandomSelect = () => {
    sound.playSweep();
    setActiveIdx((prev) => {
      let next = Math.floor(Math.random() * RELEASES.length);
      if (next === prev && RELEASES.length > 1) {
        next = (prev + 1) % RELEASES.length;
      }
      return next;
    });
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlay = () => {
    if (isImageMedia) return;
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      } else {
        containerRef.current.requestFullscreen?.().catch(() => {});
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentT = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setProgress((currentT / dur) * 100);
    }
  };

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-24 md:py-28 bg-[#040407] border-t border-white/10 select-none overflow-hidden will-change-transform transform-gpu">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
        {/* Editorial Eyebrow & Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 pb-5 sm:pb-6 border-b border-white/10"
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-blue-300 uppercase tracking-widest mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>THE PANORAMIC THEATER • REFERO & MOTIONSITES REELS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {RELEASES.length} World-Class Production <span className="accent-text-gradient font-display italic font-normal">Reels</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/50 max-w-md font-sans leading-relaxed">
            Unobstructed screen captures from real high-ticket client systems built with APEX 3D prompts. Select any brand release to inspect:
          </p>
        </motion.div>

        {/* Release Dock Header with Random Shuffle Trigger */}
        <div className="flex items-center justify-between gap-3 mb-2 px-1">
          <span className="text-[11px] sm:text-xs font-mono text-white/50 tracking-wider">
            FEATURED CLIENT DELIVERABLES ({RELEASES.length})
          </span>
          <button
            onClick={handleRandomSelect}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-mono transition-all active:scale-95 shadow-sm"
            title="Randomize and play a surprise 3D client reel"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-400" />
            <span>Shuffle Random Reel</span>
          </button>
        </div>

        {/* Responsive Horizontal Release Dock (Touch-scrollable on mobile/tab) */}
        <div className="relative mb-6 sm:mb-8">
          {/* Subtle lateral gradient fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#050508] to-transparent z-10 sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#050508] to-transparent z-10 sm:hidden" />

          <div ref={dockRef} className="flex items-center gap-2.5 overflow-x-auto pb-3 px-1 scrollbar-none snap-x touch-pan-x -mx-2 sm:mx-0">
            {RELEASES.map((item, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  key={item.id}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => sound.playHover()}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-300 relative border shrink-0 min-w-[140px] sm:min-w-[190px] snap-start ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-blue-500/80 shadow-lg shadow-blue-500/15'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono mb-1">
                    <span className={isActive ? 'text-blue-300 font-bold' : 'text-white/40'}>
                      {item.number}
                    </span>
                    <span className={isActive ? 'text-amber-300 font-bold font-mono' : 'text-white/50'}>
                      {item.clientFee}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">
                    {item.brand}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-white/40 truncate font-sans mt-0.5">
                    {item.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panoramic Cinema Screen Stage (Zero text overlap on video for 100% clarity) */}
        <motion.div
          ref={containerRef}
          key={current.id}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#06060c] border border-white/15 shadow-2xl group flex flex-col"
        >
          {/* 1. Dedicated Unobstructed Video Player Stage */}
          <div
            className="relative w-full aspect-video sm:aspect-[16/9] bg-black overflow-hidden cursor-pointer select-none"
            data-cursor="play"
            onClick={togglePlay}
          >
            {isImageMedia ? (
              <img
                key={current.videoUrl}
                src={current.videoUrl}
                alt={current.name}
                className="w-full h-full object-contain sm:object-cover bg-black"
              />
            ) : (
              <video
                ref={videoRef}
                key={current.videoUrl}
                src={current.videoUrl}
                poster={current.poster}
                autoPlay
                muted={isMuted}
                playsInline
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleRandomSelect}
                className="w-full h-full object-contain sm:object-cover bg-black"
              />
            )}

            {/* Top Clean Floating Status & Controls (Non-intrusive, corners only) */}
            <div className="absolute top-3 sm:top-5 inset-x-3 sm:inset-x-6 flex items-center justify-between z-20 pointer-events-none">
              {/* Brand and category pill */}
              <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/15 text-[11px] sm:text-xs font-mono shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-none">{current.brand}</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-blue-300 hidden sm:inline">{current.category}</span>
              </div>

              {/* Action buttons (Mute, Shuffle, Fullscreen, Quality) */}
              <div className="flex items-center gap-2 pointer-events-auto">
                {/* Shuffle Button in Player */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRandomSelect();
                  }}
                  className="p-1.5 sm:p-2 rounded-full bg-black/75 hover:bg-blue-600 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition-all text-xs flex items-center gap-1 font-mono"
                  title="Play Another Random Reel"
                >
                  <Shuffle className="w-3 h-3 text-blue-400" />
                  <span className="hidden sm:inline text-[10px]">SHUFFLE</span>
                </button>

                {!isImageMedia && (
                  <button
                    onClick={toggleMute}
                    className="p-1.5 sm:p-2 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition-all text-xs"
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <span className="font-mono text-[10px] px-1">MUTED</span> : <span className="font-mono text-[10px] px-1 text-blue-400 font-bold">AUDIO ON</span>}
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition-all text-[11px] font-mono"
                  title="Toggle Fullscreen"
                >
                  <span>FULLSCREEN</span>
                </button>

                <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-amber-400 font-bold font-mono text-[10px] sm:text-[11px]">
                  {isImageMedia ? 'ANIMATED LOOP' : '60 FPS 4K'}
                </div>
              </div>
            </div>

            {/* Center Play/Pause Toggle Indicator */}
            {!isImageMedia && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
                <div
                  className={`w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 shadow-xl ${
                    isPlaying
                      ? 'opacity-0 group-hover:opacity-90 scale-95'
                      : 'opacity-90 scale-100 ring-4 ring-blue-500/20'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5 text-blue-400" />
                  )}
                </div>
              </div>
            )}

            {/* Bottom Scrubber Progress Bar */}
            {!isImageMedia && (
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-10 pointer-events-none">
                <div
                  className="h-full bg-blue-500 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* 2. Dedicated Cinematic Dossier Section Below Video (Zero overlap, fully responsive) */}
          <div className="p-5 sm:p-7 md:p-8 bg-[#090914] border-t border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 sm:gap-8">
              {/* Left Column: Title, Metadata, Description & Tech Specifications */}
              <div className="space-y-4 flex-1">
                {/* Meta Tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/25 font-bold">
                    PROMPT ARCHITECTURE FOR {current.brand.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 text-white/70 border border-white/10">
                    {current.tokens}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25">
                    Calibrated: {current.model}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {current.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans mt-2">
                    {current.description}
                  </p>
                </div>

                {/* Specifications Badges */}
                <div className="pt-1">
                  <div className="text-[10px] font-mono uppercase text-white/40 mb-2">
                    VERIFIED PRODUCTION SHADERS & COMPONENTS:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {current.specs.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-mono text-blue-200 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Commercial Value & Unlock Call-To-Action */}
              <div className="lg:w-80 shrink-0 p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    PROVEN CLIENT BILLING VALUE
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                      {current.clientFee}
                    </span>
                    <span className="text-xs text-white/50 font-sans">Verified Invoice</span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1 font-sans leading-relaxed">
                    Instantly copy the exact prompt architecture that generated this commercial 3D deliverable.
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playSuccess();
                    onUnlockClick();
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className="w-full py-3.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock Prompt Architecture ({current.clientFee})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
