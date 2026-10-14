import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Compass, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';
import { PromptModal } from './PromptModal';
import { sound } from '../lib/audioEngine';

interface SphereGalleryProps {
  onUnlockClick: () => void;
}

interface LayoutConfig {
  radius: number;
  cardWidth: number;
  cardHeight: number;
  perspective: number;
}

export const CssSphereGallery: React.FC<SphereGalleryProps> = ({ onUnlockClick }) => {
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [rotY, setRotY] = useState<number>(0);
  const [rotX, setRotX] = useState<number>(-3);
  const [layout, setLayout] = useState<LayoutConfig>({
    radius: 1050,
    cardWidth: 280,
    cardHeight: 340,
    perspective: 1200,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const startTouchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inertia loop
  const velRef = useRef<{ x: number; y: number }>({ x: 0.1, y: 0 });

  // Dynamically compute radius so cards NEVER intersect in 3D space
  const updateDimensions = useCallback(() => {
    const w = window.innerWidth;
    const count = VAULT_CATALOG.length;
    let cardWidth = 280;
    let cardHeight = 340;
    let gap = 34;
    let perspective = 1200;

    if (w < 480) {
      cardWidth = 210;
      cardHeight = 280;
      gap = 20;
      perspective = 850;
    } else if (w < 768) {
      cardWidth = 240;
      cardHeight = 300;
      gap = 24;
      perspective = 1000;
    } else if (w < 1024) {
      cardWidth = 260;
      cardHeight = 320;
      gap = 28;
      perspective = 1100;
    }

    const slot = cardWidth + gap;
    // Minimum theoretical radius to prevent any polygon overlap: R = slot / (2 * sin(PI / count))
    const calculatedRadius = Math.round(slot / (2 * Math.sin(Math.PI / count)));

    setLayout({
      radius: calculatedRadius,
      cardWidth,
      cardHeight,
      perspective,
    });
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Smooth auto-rotation with IntersectionObserver viewport pause
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number | null = null;
    let isLoopRunning = false;

    const tick = () => {
      if (!isDraggingRef.current) {
        setRotY((prev) => (prev + velRef.current.x) % 360);
        velRef.current.x *= 0.96;
        velRef.current.y *= 0.96;
        if (Math.abs(velRef.current.x) < 0.04) {
          velRef.current.x = 0.06;
        }
      }
      animId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animId = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (isLoopRunning) {
        isLoopRunning = false;
        if (animId !== null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    return () => {
      stopLoop();
      observer.disconnect();
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragDistanceRef.current = 0;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
    if (dragDistanceRef.current > 6) {
      hasDraggedRef.current = true;
    }

    velRef.current.x = deltaX * 0.12;
    velRef.current.y = -deltaY * 0.06;

    setRotY((prev) => (prev + deltaX * 0.22) % 360);
    setRotX((prev) => Math.max(-8, Math.min(2, prev - deltaY * 0.05)));

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mobile touch controls with vertical scroll pass-through
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      hasDraggedRef.current = false;
      dragDistanceRef.current = 0;
      isHorizontalSwipeRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startTouchRef.current.x;
    const diffY = currentY - startTouchRef.current.y;

    dragDistanceRef.current += Math.abs(diffX) + Math.abs(diffY);
    if (dragDistanceRef.current > 6) {
      hasDraggedRef.current = true;
    }

    // Detect direction intent: allow native vertical page scroll if swiping vertically
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          isHorizontalSwipeRef.current = true;
          isDraggingRef.current = true;
        } else {
          isHorizontalSwipeRef.current = false;
          isDraggingRef.current = false;
          return;
        }
      } else {
        return;
      }
    }

    if (isHorizontalSwipeRef.current) {
      const deltaX = currentX - prevMouseRef.current.x;
      const deltaY = currentY - prevMouseRef.current.y;

      velRef.current.x = deltaX * 0.12;
      setRotY((prev) => (prev + deltaX * 0.28) % 360);
      setRotX((prev) => Math.max(-8, Math.min(2, prev - deltaY * 0.04)));

      prevMouseRef.current = { x: currentX, y: currentY };
    }
  };

  const onTouchEnd = () => {
    isDraggingRef.current = false;
    isHorizontalSwipeRef.current = null;
  };

  const rotateByStep = (direction: 'left' | 'right') => {
    sound.playClick();
    velRef.current.x = direction === 'left' ? -2.2 : 2.2;
  };

  const count = VAULT_CATALOG.length;

  return (
    <section className="relative py-20 sm:py-28 md:py-32 bg-[#050508] overflow-hidden border-t border-white/5 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-300 mb-4">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>PURE CSS 3D INTERACTIVE CAROUSEL</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          The Spatial <span className="accent-text-gradient font-display italic font-normal">Vault Orbit</span>
        </h2>
        <p className="text-xs sm:text-sm text-white/50 max-w-lg mx-auto font-sans">
          Swipe horizontally or use arrows to spin through 500+ production prompts in real 3D space. Tap any card to inspect full prompt architecture.
        </p>

        {/* Quick Stepper Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => rotateByStep('left')}
            className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-mono"
            title="Rotate Left"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Rotate Left</span>
          </button>
          <span className="text-[11px] font-mono text-white/40 px-2">
            Swipe or Drag 360°
          </span>
          <button
            onClick={() => rotateByStep('right')}
            className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-mono"
            title="Rotate Right"
          >
            <span className="hidden sm:inline">Rotate Right</span>
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* 3D Viewport Stage */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        data-cursor="drag"
        className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden will-change-transform transform-gpu touch-pan-y"
        style={{ perspective: `${layout.perspective}px` }}
      >
        {/* Left & Right Cinematic Edge Vignettes */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent z-30" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#050508] via-[#050508]/80 to-transparent z-30" />

        {/* Center 3D World */}
        <div
          className="relative w-0 h-0 will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${layout.radius}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {VAULT_CATALOG.map((item, idx) => {
            const angle = (idx / count) * 360;
            // Angle of the card relative to camera (normalized to [-180, 180])
            const relAngle = ((angle + rotY) % 360 + 540) % 360 - 180;
            const absRel = Math.abs(relAngle);
            const isVisible = absRel < 88;

            // Opacity falloff curve: 1.0 at center, smoothly fading towards the side horizon
            const opacity = isVisible
              ? Math.max(0, Math.min(1, Math.cos((relAngle * Math.PI) / 180) ** 0.85))
              : 0;

            const zIndex = Math.round(100 - absRel);

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasDraggedRef.current) return;
                  sound.playSweep();
                  setSelectedItem(item);
                }}
                className="absolute top-0 left-0 rounded-2xl bg-[#0c0d16] border border-white/15 p-4 sm:p-5 text-left flex flex-col justify-between hover:border-blue-500/60 shadow-2xl group cursor-pointer hover:shadow-blue-500/20"
                style={{
                  width: `${layout.cardWidth}px`,
                  height: `${layout.cardHeight}px`,
                  marginLeft: `-${layout.cardWidth / 2}px`,
                  marginTop: `-${layout.cardHeight / 2}px`,
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${angle}deg) translateZ(${layout.radius}px)`,
                  backfaceVisibility: 'hidden',
                  visibility: isVisible ? 'visible' : 'hidden',
                  pointerEvents: isVisible && absRel < 75 ? 'auto' : 'none',
                  opacity,
                  zIndex,
                  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.05)',
                }}
              >
                {/* Subtle top card glow highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent rounded-t-2xl" />

                <div>
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono mb-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold truncate max-w-[130px]">
                      {item.category}
                    </span>
                    <span className="text-amber-400 font-bold font-mono shrink-0">
                      {item.clientValue}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-blue-200 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  {item.highlightStat && (
                    <div className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {item.highlightStat}
                    </div>
                  )}

                  <p className="text-[11px] sm:text-xs text-white/55 mt-2 line-clamp-3 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[11px] sm:text-xs font-mono text-white/60 group-hover:text-blue-300 transition-colors mt-auto">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Inspect Prompt
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PromptModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUnlockClick={onUnlockClick}
      />
    </section>
  );
};
