import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, VolumeX, Sparkles, Monitor, Smartphone, Layers, Shuffle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MacBookMockup } from './MacBookMockup';
import { IPhoneMockup } from './IPhoneMockup';
import { sound } from '../../lib/audioEngine';
import { VAULT_CATALOG, VaultItem } from '../../data/vaultCatalog';

export interface HeroPromptDemo {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  clientValue: string;
  videoUrl: string;
  fpsBadge: string;
  glowColor: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Luxury': 'rgba(245, 158, 11, 0.45)', // Amber
  'Advanced 3D': 'rgba(168, 85, 247, 0.45)', // Purple
  'Cyber & Agency': 'rgba(59, 130, 246, 0.45)', // Blue
  'E-Commerce': 'rgba(16, 185, 129, 0.45)', // Emerald
  'FinTech': 'rgba(6, 182, 212, 0.45)', // Cyan
  'Spatial OS': 'rgba(236, 72, 153, 0.45)', // Pink
  'Minimalist': 'rgba(148, 163, 184, 0.35)', // Slate
};

// Filter prompts with valid .mp4 video previews from the vault catalog
const ALL_HERO_PROMPTS: HeroPromptDemo[] = VAULT_CATALOG
  .filter((item) => item.videoUrl && item.videoUrl.endsWith('.mp4') && !item.isDeleted)
  .map((item) => ({
    id: item.id,
    name: item.title.split('—')[0].trim(),
    subtitle: item.subtitle || item.title,
    category: item.category,
    clientValue: item.clientValue || '$15,000',
    videoUrl: item.videoUrl,
    fpsBadge: item.fpsBadge || '60 FPS WEBGL',
    glowColor: CATEGORY_COLORS[item.category] || 'rgba(59, 130, 246, 0.45)',
  }));

type ViewMode = 'dual' | 'macbook' | 'iphone';

export const HeroDeviceStage: React.FC = () => {
  // 1. RANDOM SELECTION ON RELOAD: Pick a fresh video every single reload!
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (ALL_HERO_PROMPTS.length === 0) return 0;
    return Math.floor(Math.random() * ALL_HERO_PROMPTS.length);
  });

  // 2. RESPONSIVE DEFAULT: Mobile users start on 'iphone' (clean & immersive), Desktop on 'dual' (side-by-side)
  const [viewMode, setViewMode] = useState<ViewMode>('iphone');
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setViewMode(mobile ? 'iphone' : 'dual');
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const activeDemo = useMemo(() => {
    return ALL_HERO_PROMPTS[currentIndex] || ALL_HERO_PROMPTS[0];
  }, [currentIndex]);

  // Subtle 3D Mouse Parallax on Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 4;
    const rotateY = (x / (rect.width / 2)) * 5;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleNextPrompt = () => {
    try {
      sound.playClick();
    } catch {}
    setCurrentIndex((prev) => (prev + 1) % ALL_HERO_PROMPTS.length);
  };

  const handlePrevPrompt = () => {
    try {
      sound.playClick();
    } catch {}
    setCurrentIndex((prev) => (prev - 1 + ALL_HERO_PROMPTS.length) % ALL_HERO_PROMPTS.length);
  };

  const handleShuffle = () => {
    try {
      sound.playSuccess();
    } catch {}
    if (ALL_HERO_PROMPTS.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * ALL_HERO_PROMPTS.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % ALL_HERO_PROMPTS.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleSelectDemo = (idx: number) => {
    try {
      sound.playClick();
    } catch {}
    setCurrentIndex(idx);
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
      {/* Dynamic Ambient Aura Behind Devices */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[80%] rounded-full blur-[90px] sm:blur-[120px] pointer-events-none transition-all duration-700 -z-10"
        style={{
          backgroundColor: activeDemo.glowColor,
          opacity: 0.45,
        }}
      />

      {/* TOP CONTROLS BAR: Device View Switcher + Shuffle + Mute */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 sm:mb-4 px-1">
        {/* Device Switcher Pills (Clean, accessible, touch-friendly) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs text-white/70 shadow-lg">
          {/* Dual option shown on desktop / tablet */}
          <button
            type="button"
            onClick={() => handleSetView('dual')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                : 'hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Mac & iPhone (Side-by-Side)</span>
          </button>

          {/* iPhone Button (Highlighted on mobile by default) */}
          <button
            type="button"
            onClick={() => handleSetView('iphone')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
              viewMode === 'iphone'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                : 'hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>iPhone 15 Pro</span>
          </button>

          {/* MacBook Button */}
          <button
            type="button"
            onClick={() => handleSetView('macbook')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
              viewMode === 'macbook'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                : 'hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>MacBook 16"</span>
          </button>
        </div>

        {/* Shuffle / Random Button + Audio Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Random Prompt Button (Changes video on click) */}
          <button
            type="button"
            onClick={handleShuffle}
            title="Randomize / Next Prompt from Vault"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/70 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400/40 text-white/80 hover:text-white text-[11px] font-mono transition-all cursor-pointer"
          >
            <Shuffle className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* STAGE: HARDWARE DEVICES WITHOUT OVERLAPPING */}
      <div
        className="relative w-full flex items-center justify-center transition-transform duration-300 ease-out will-change-transform transform-gpu min-h-[290px] sm:min-h-[380px]"
        style={{
          transform: isMobile ? 'none' : `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* CASE 1: DUAL VIEW (DESKTOP) — Side-by-side with zero overlap */}
        {viewMode === 'dual' && (
          <div className="w-full flex flex-row items-end justify-center gap-4 lg:gap-6">
            {/* Left: MacBook Pro 16" */}
            <div className="flex-1 min-w-0 max-w-[560px] xl:max-w-[620px]">
              <MacBookMockup
                videoUrl={activeDemo.videoUrl}
                title={activeDemo.name}
                isMuted={isMuted}
              />
            </div>

            {/* Right: iPhone 15 Pro standing cleanly beside it (NO OVERLAP) */}
            <div className="w-[170px] xl:w-[200px] shrink-0 pb-1">
              <IPhoneMockup
                videoUrl={activeDemo.videoUrl}
                title={activeDemo.name}
                isMuted={isMuted}
              />
            </div>
          </div>
        )}

        {/* CASE 2: MACBOOK ONLY */}
        {viewMode === 'macbook' && (
          <div className="w-full max-w-[680px] xl:max-w-[760px] flex justify-center animate-role-fade-in">
            <MacBookMockup
              videoUrl={activeDemo.videoUrl}
              title={activeDemo.name}
              isMuted={isMuted}
              className="w-full"
            />
          </div>
        )}

        {/* CASE 3: IPHONE ONLY (Primary Mobile Centerpiece) */}
        {viewMode === 'iphone' && (
          <div className="w-[230px] sm:w-[260px] md:w-[280px] flex justify-center py-1 animate-role-fade-in">
            <IPhoneMockup
              videoUrl={activeDemo.videoUrl}
              title={activeDemo.name}
              isMuted={isMuted}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* ACTIVE PROMPT INFO STRIP: Title, Value & Prev/Next Controls */}
      <div className="w-full mt-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-[280px]">
                {activeDemo.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                Client Value: {activeDemo.clientValue}
              </span>
            </div>
            <div className="text-[11px] text-white/50 truncate max-w-[280px] sm:max-w-[380px]">
              {activeDemo.subtitle}
            </div>
          </div>
        </div>

        {/* Prev / Next Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <span className="text-[10px] font-mono text-white/40 mr-1">
            {currentIndex + 1} / {ALL_HERO_PROMPTS.length}
          </span>
          <button
            type="button"
            onClick={handlePrevPrompt}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
            title="Previous 3D prompt demo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextPrompt}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
            title="Next 3D prompt demo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE PROMPT SELECTOR PILLS */}
      <div className="w-full mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {ALL_HERO_PROMPTS.map((demo, idx) => {
          const isSelected = currentIndex === idx;
          return (
            <button
              key={demo.id}
              type="button"
              onClick={() => handleSelectDemo(idx)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] font-bold scale-[1.02]'
                  : 'bg-black/40 hover:bg-black/70 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: demo.glowColor.replace('0.45', '1') }}
              />
              <span>{demo.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
