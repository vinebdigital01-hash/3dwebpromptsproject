import React, { useState, useRef, useMemo } from 'react';
import { MacBookMockup } from './MacBookMockup';
import { IPhoneMockup } from './IPhoneMockup';
import { sound } from '../../lib/audioEngine';
import { VAULT_CATALOG } from '../../data/vaultCatalog';

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

// Filter prompts with valid .mp4 video previews from vault catalog
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
    glowColor: 'rgba(59, 130, 246, 0.45)',
  }));

export const HeroDeviceStage: React.FC = () => {
  // RANDOM SELECTION ON RELOAD: Pick a fresh 3D video from the vault catalog
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (ALL_HERO_PROMPTS.length === 0) return 0;
    return Math.floor(Math.random() * ALL_HERO_PROMPTS.length);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const activeDemo = useMemo(() => {
    return ALL_HERO_PROMPTS[currentIndex] || ALL_HERO_PROMPTS[0];
  }, [currentIndex]);

  // Gentle 3D Mouse Parallax on Desktop (max 6deg, disabled on touch and prefers-reduced-motion)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReduced || window.innerWidth < 1024) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 4.5; // max ~5deg
    const rotateY = (x / (rect.width / 2)) * 5.5;  // max ~6deg
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Subtle click to cycle next 3D demonstration
  const handleCycleNext = () => {
    try {
      sound.playClick();
    } catch {}
    if (ALL_HERO_PROMPTS.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % ALL_HERO_PROMPTS.length);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCycleNext}
      title="Click to explore another 3D prompt demo"
      className="relative w-full flex flex-col items-center justify-center select-none cursor-pointer group py-2"
    >
      {/* 1. Large Soft Blue/Orange Glow Behind Devices */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[95%] rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -z-10 transition-all duration-700 opacity-60"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(59,130,246,0.38), rgba(245,158,11,0.18) 60%, transparent 80%)',
        }}
      />

      {/* 2. Faint Grid Pattern that Fades Out at the Edges */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. Floating Hardware Composition (Laptop 100% of right column, max 720px) */}
      <div
        className="relative w-full max-w-[720px] flex items-center justify-center animate-gentle-float will-change-transform transform-gpu"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Laptop: 100% width of container, max 720px, 16/10 screen aspect ratio */}
        <div className="w-full">
          <MacBookMockup
            videoUrl={activeDemo.videoUrl}
            title={activeDemo.name}
            isMuted={true}
          />
        </div>

        {/* Phone: 
            - Width: 22% of laptop (min 120px, max 170px) on desktop (>=1280px);
              20% on 1024-1279px (min 110px); 32% on mobile (<1024px);
              Hidden only below 360px.
            - Position: right: 0 (INSIDE right column, zero clipping), bottom: -24px.
            - Rotate: -5deg. Overlaps laptop by max 15%.
            - Deep soft shadow.
        */}
        <div
          style={{ transform: 'rotate(-5deg)' }}
          className="hidden min-[360px]:block absolute bottom-[-18px] sm:bottom-[-24px] right-0 w-[32%] sm:w-[28%] lg:w-[20%] xl:w-[22%] min-w-[110px] xl:min-w-[120px] max-w-[170px] z-20 transition-transform duration-300 drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
        >
          <IPhoneMockup
            videoUrl={activeDemo.videoUrl}
            title={activeDemo.name}
            isMuted={true}
          />
        </div>
      </div>

      {/* 4. Label Pill: Moved OUTSIDE laptop screen, floating below bottom-left corner with 16px gap, full text, no ellipsis */}
      <div className="w-full max-w-[720px] mt-4 flex justify-start md:max-lg:justify-center px-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-white/90 shadow-lg whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-semibold text-white tracking-tight">{activeDemo.name}</span>
          <span className="text-white/30">·</span>
          <span className="text-blue-400 font-mono">{activeDemo.fpsBadge}</span>
        </div>
      </div>
    </div>
  );
};
