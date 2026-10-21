import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Monitor, Smartphone, Layers, Check } from 'lucide-react';
import { MacBookMockup } from './MacBookMockup';
import { IPhoneMockup } from './IPhoneMockup';
import { sound } from '../../lib/audioEngine';

export interface DemoProject {
  id: string;
  name: string;
  category: string;
  tech: string;
  desktopVideo: string;
  mobileVideo: string;
  glowColor: string;
  fps: number;
}

export const HERO_DEMOS: DemoProject[] = [
  {
    id: 'valmora',
    name: 'Valmora Luxury',
    category: 'Interactive 3D Configurator',
    tech: 'Three.js • PBR Shaders',
    desktopVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/valmora.mp4',
    mobileVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/valmora.mp4',
    glowColor: 'rgba(59, 130, 246, 0.45)', // Vivid Blue glow
    fps: 60,
  },
  {
    id: 'selene',
    name: 'Selene Spatial',
    category: 'Spatial Glassmorphism UI',
    tech: 'WebGL • Spatial Depth',
    desktopVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/selene.mp4',
    mobileVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/selene.mp4',
    glowColor: 'rgba(168, 85, 247, 0.45)', // Purple glow
    fps: 60,
  },
  {
    id: 'ora',
    name: 'Ora Generative',
    category: 'Generative Particle Waves',
    tech: 'GLSL Compute • Audio Reactive',
    desktopVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/ora-v2.mp4',
    mobileVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/ora-v2.mp4',
    glowColor: 'rgba(245, 158, 11, 0.45)', // Amber glow
    fps: 60,
  },
  {
    id: 'fluxora',
    name: 'Fluxora Fluid',
    category: 'Liquid Metal Physics',
    tech: 'Three.js • Fluid Simulation',
    desktopVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/fluxora.mp4',
    mobileVideo: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/fluxora.mp4',
    glowColor: 'rgba(16, 185, 129, 0.45)', // Emerald glow
    fps: 60,
  },
];

type ViewMode = 'dual' | 'macbook' | 'iphone';

export const HeroDeviceStage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<DemoProject>(HERO_DEMOS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('dual');
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // 3D Mouse Parallax on Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 5;
    const rotateY = (x / (rect.width / 2)) * 6;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleSelectDemo = (demo: DemoProject) => {
    try {
      sound.playClick();
    } catch {}
    setActiveDemo(demo);
  };

  const handleToggleMute = () => {
    try {
      sound.playClick();
    } catch {}
    setIsMuted((prev) => !prev);
  };

  const handleSetView = (mode: ViewMode) => {
    try {
      sound.playClick();
    } catch {}
    setViewMode(mode);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full flex flex-col items-center select-none"
    >
      {/* Dynamic Ambient Glow Behind Devices */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[75%] rounded-full blur-[100px] pointer-events-none transition-all duration-700 -z-10"
        style={{
          backgroundColor: activeDemo.glowColor,
          opacity: 0.55,
        }}
      />

      {/* TOP CONTROLS BAR: Device View Switcher + Live Status */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 px-2">
        {/* Device Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/70">
          <button
            type="button"
            onClick={() => handleSetView('dual')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                : 'hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Mac & iPhone</span>
            <span className="sm:hidden">Both</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetView('macbook')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
              viewMode === 'macbook'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                : 'hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>MacBook</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetView('iphone')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
              viewMode === 'iphone'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                : 'hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>iPhone</span>
          </button>
        </div>

        {/* Live 60 FPS Badge & Mute Toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>60 FPS WEBGL</span>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* STAGE: THE HARDWARE DEVICES WITH 3D PERSPECTIVE */}
      <div
        className="relative w-full flex items-center justify-center transition-transform duration-300 ease-out will-change-transform transform-gpu"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* 1. MACBOOK PRO 16-INCH */}
        {(viewMode === 'dual' || viewMode === 'macbook') && (
          <div
            className={`transition-all duration-500 ease-out ${
              viewMode === 'dual'
                ? 'w-[94%] sm:w-[88%] lg:w-[92%]'
                : 'w-[98%] sm:w-[96%]'
            }`}
          >
            <MacBookMockup
              videoUrl={activeDemo.desktopVideo}
              title={activeDemo.name}
              isMuted={isMuted}
            />
          </div>
        )}

        {/* 2. IPHONE 15 PRO */}
        {(viewMode === 'dual' || viewMode === 'iphone') && (
          <div
            className={`transition-all duration-500 ease-out ${
              viewMode === 'dual'
                ? 'absolute -bottom-4 right-1 sm:-bottom-6 sm:right-3 lg:-bottom-8 lg:right-6 w-[36%] max-w-[210px] z-30 drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]'
                : 'w-[70%] max-w-[280px] my-2 z-20'
            }`}
          >
            <IPhoneMockup
              videoUrl={activeDemo.mobileVideo}
              title={activeDemo.name}
              isMuted={isMuted}
            />
          </div>
        )}
      </div>

      {/* BOTTOM DEMO SELECTOR PILLS */}
      <div className="w-full mt-5 flex flex-col items-center gap-2">
        <div className="text-[11px] font-mono text-white/50 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Interactive One-Shot Prompt Demos — Tap to Inspect:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
          {HERO_DEMOS.map((demo) => {
            const isSelected = activeDemo.id === demo.id;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                className={`group px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600/25 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] scale-105'
                    : 'bg-black/40 hover:bg-black/70 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: demo.glowColor.replace('0.45', '1') }}
                />
                <span className="font-semibold">{demo.name}</span>
                <span className="hidden md:inline text-[10px] text-white/40">• {demo.category}</span>
                {isSelected && <Check className="w-3 h-3 text-blue-300" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
