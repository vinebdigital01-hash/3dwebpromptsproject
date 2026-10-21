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

  // Gentle 3D Mouse Parallax on Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
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
      className="relative w-full flex items-center justify-center select-none cursor-pointer group py-4 sm:py-6"
    >
      {/* 1. Large Soft Blue/Orange Glow Behind Devices */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[95%] rounded-full blur-[90px] sm:blur-[130px] pointer-events-none -z-10 transition-all duration-700 opacity-65"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(59,130,246,0.4), rgba(245,158,11,0.2) 60%, transparent 80%)',
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

      {/* 3. Floating Hardware Composition (6s loop, 8px float + Desktop Mouse Tilt) */}
      <div
        className="relative w-full max-w-[540px] sm:max-w-[580px] lg:max-w-[620px] xl:max-w-[680px] flex items-center justify-center animate-gentle-float will-change-transform transform-gpu"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Laptop Centered: Thin Metal Frame, Screen Fully Visible, Soft Reflection */}
        <div className="w-full">
          <MacBookMockup
            videoUrl={activeDemo.videoUrl}
            title={activeDemo.name}
            isMuted={true}
          />
        </div>

        {/* Phone in Front, Bottom-Right: Overlapping Laptop's Corner by only ~15%, Tilted -6°, Deep Shadow */}
        <div className="absolute -bottom-3 sm:-bottom-4 -right-1 sm:-right-3 md:-right-5 w-[88px] xs:w-[102px] sm:w-[124px] md:w-[138px] xl:w-[152px] z-20 -rotate-6 transition-transform duration-300 drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)]">
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
