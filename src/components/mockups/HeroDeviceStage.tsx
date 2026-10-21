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

const CATEGORY_COLORS: Record<string, string> = {
  'Luxury': 'rgba(245, 158, 11, 0.40)', // Amber
  'Advanced 3D': 'rgba(168, 85, 247, 0.40)', // Purple
  'Cyber & Agency': 'rgba(59, 130, 246, 0.40)', // Blue
  'E-Commerce': 'rgba(16, 185, 129, 0.40)', // Emerald
  'FinTech': 'rgba(6, 182, 212, 0.40)', // Cyan
  'Spatial OS': 'rgba(236, 72, 153, 0.40)', // Pink
  'Minimalist': 'rgba(148, 163, 184, 0.30)', // Slate
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
    glowColor: CATEGORY_COLORS[item.category] || 'rgba(59, 130, 246, 0.40)',
  }));

export const HeroDeviceStage: React.FC = () => {
  // RANDOM SELECTION ON RELOAD: Pick a fresh 3D video on every single reload
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (ALL_HERO_PROMPTS.length === 0) return 0;
    return Math.floor(Math.random() * ALL_HERO_PROMPTS.length);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const activeDemo = useMemo(() => {
    return ALL_HERO_PROMPTS[currentIndex] || ALL_HERO_PROMPTS[0];
  }, [currentIndex]);

  // Subtle 3D Mouse Parallax on Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 3;
    const rotateY = (x / (rect.width / 2)) * 4;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Click on stage smoothly advances to another 3D video
  const handleStageClick = () => {
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
      onClick={handleStageClick}
      title="Click to cycle 3D prompt demo"
      className="relative w-full flex flex-col items-center select-none cursor-pointer group"
    >
      {/* Dynamic Ambient Aura Behind Devices */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[75%] rounded-full blur-[80px] sm:blur-[120px] pointer-events-none transition-all duration-700 -z-10"
        style={{
          backgroundColor: activeDemo?.glowColor || 'rgba(59, 130, 246, 0.4)',
          opacity: 0.4,
        }}
      />

      {/* DUAL HARDWARE SHOWCASE: BIG MACBOOK + PROPORTIONAL SMALL IPHONE */}
      <div
        className="relative w-full flex items-end justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 transition-transform duration-300 ease-out will-change-transform transform-gpu pt-2 pb-1"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Left: Big MacBook Pro 16" (Dominant centerpiece) */}
        <div className="flex-1 min-w-0 max-w-[270px] xs:max-w-[320px] sm:max-w-[460px] md:max-w-[540px] lg:max-w-[620px] xl:max-w-[720px]">
          <MacBookMockup
            videoUrl={activeDemo.videoUrl}
            title={activeDemo.name}
            isMuted={true}
          />
        </div>

        {/* Right: Small Proportional iPhone 15 Pro (Sleek, standing cleanly beside it) */}
        <div className="w-[66px] xs:w-[78px] sm:w-[100px] md:w-[118px] lg:w-[130px] xl:w-[145px] shrink-0 pb-0.5 sm:pb-1">
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
