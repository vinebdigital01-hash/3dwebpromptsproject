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

  // Gentle 3D Mouse Parallax on Desktop (disabled on touch devices)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    if (isTouch || window.innerWidth < 1024) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 3;
    const rotateY = (x / (rect.width / 2)) * 3.5;
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
      className="relative w-full flex items-center justify-center select-none cursor-pointer group py-2 sm:py-4 overflow-visible"
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

      {/* 3. Floating Hardware Composition (Laptop 92% of right column + Phone overlapping corner by ~12%) */}
      <div
        className="relative w-full max-w-[92%] sm:max-w-[92%] lg:max-w-[92%] flex items-center justify-center animate-gentle-float will-change-transform transform-gpu overflow-visible"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Laptop: 92% of the right column, screen fully visible, no clipped text */}
        <div className="w-full">
          <MacBookMockup
            videoUrl={activeDemo.videoUrl}
            title={activeDemo.name}
            isMuted={true}
          />
        </div>

        {/* Phone: 26% width on xl, 24% on lg, 30% on mobile. Overlaps laptop corner by only 12%, tilted -5°, deep shadow. Hidden on iPhone SE (<=375px) */}
        <div
          style={{ transform: 'rotate(-5deg)' }}
          className="hidden min-[380px]:block absolute -bottom-2 sm:-bottom-3 -right-1 sm:-right-2 md:right-0 w-[30%] sm:w-[28%] lg:w-[24%] xl:w-[26%] z-20 transition-transform duration-300 drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
        >
          <IPhoneMockup
            videoUrl={activeDemo.videoUrl}
            title={activeDemo.name}
            isMuted={true}
          />
        </div>
      </div>
    </div>
  );
};
