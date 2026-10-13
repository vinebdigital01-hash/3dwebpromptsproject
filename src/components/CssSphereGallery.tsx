import React, { useState, useRef, useEffect } from 'react';
import { Eye, Compass, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';
import { PromptModal } from './PromptModal';
import { sound } from '../lib/audioEngine';

interface SphereGalleryProps {
  onUnlockClick: () => void;
}

export const CssSphereGallery: React.FC<SphereGalleryProps> = ({ onUnlockClick }) => {
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [rotY, setRotY] = useState<number>(0);
  const [rotX, setRotX] = useState<number>(-4);
  const [radius, setRadius] = useState<number>(420);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const startTouchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inertia loop
  const velRef = useRef<{ x: number; y: number }>({ x: 0.12, y: 0 });

  // Responsive radius calculation for iPhone, mobile, tablets, and desktop
  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setRadius(230); // iPhone & small phones
      } else if (w < 768) {
        setRadius(280); // Large phones
      } else if (w < 1024) {
        setRadius(340); // Tablets / iPads
      } else {
        setRadius(420); // Desktop
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (!isDraggingRef.current) {
        setRotY((prev) => prev + velRef.current.x);
        setRotX((prev) => {
          const next = prev + velRef.current.y;
          return Math.max(-20, Math.min(20, next));
        });
        velRef.current.x *= 0.96;
        velRef.current.y *= 0.96;
        if (Math.abs(velRef.current.x) < 0.04) velRef.current.x = 0.06; // subtle smooth auto-spin
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    velRef.current.x = deltaX * 0.12;
    velRef.current.y = -deltaY * 0.12;

    setRotY((prev) => prev + deltaX * 0.25);
    setRotX((prev) => Math.max(-25, Math.min(25, prev - deltaY * 0.25)));

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Smart touch handling: Only locks rotation if swiping horizontally, allows normal vertical page scrolling
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isHorizontalSwipeRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startTouchRef.current.x;
    const diffY = currentY - startTouchRef.current.y;

    // Detect direction intent if not established yet
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          isHorizontalSwipeRef.current = true;
          isDraggingRef.current = true;
        } else {
          isHorizontalSwipeRef.current = false;
          isDraggingRef.current = false;
          return; // Let native vertical page scrolling happen freely!
        }
      } else {
        return;
      }
    }

    if (isHorizontalSwipeRef.current) {
      const deltaX = currentX - prevMouseRef.current.x;
      const deltaY = currentY - prevMouseRef.current.y;

      velRef.current.x = deltaX * 0.12;
      velRef.current.y = -deltaY * 0.08;

      setRotY((prev) => prev + deltaX * 0.35);
      setRotX((prev) => Math.max(-20, Math.min(20, prev - deltaY * 0.15)));

      prevMouseRef.current = { x: currentX, y: currentY };
    }
  };

  const onTouchEnd = () => {
    isDraggingRef.current = false;
    isHorizontalSwipeRef.current = null;
  };

  const rotateByStep = (direction: 'left' | 'right') => {
    sound.playClick();
    const step = 360 / VAULT_CATALOG.length;
    velRef.current.x = direction === 'left' ? -1.8 : 1.8;
  };

  const count = VAULT_CATALOG.length;

  return (
    <section className="relative py-20 sm:py-28 md:py-32 bg-[#050508] overflow-hidden border-t border-white/5 select-none will-change-transform transform-gpu">
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

        {/* Quick Stepper Controls for Mobile & Tablet */}
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
        className="relative w-full h-[390px] sm:h-[440px] md:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden will-change-transform transform-gpu touch-pan-y"
        style={{ perspective: radius < 300 ? '750px' : '1100px' }}
      >
        {/* Center 3D World */}
        <div
          className="relative w-0 h-0 transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {VAULT_CATALOG.map((item, idx) => {
            const angle = (idx / count) * 360;
            const rad = (angle * Math.PI) / 180;
            const x = Math.sin(rad) * radius;
            const z = Math.cos(rad) * radius;

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playSweep();
                  setSelectedItem(item);
                }}
                className="absolute top-0 left-0 w-[200px] sm:w-[240px] md:w-[260px] h-[260px] sm:h-[290px] md:h-[310px] -ml-[100px] sm:-ml-[120px] md:-ml-[130px] -mt-[130px] sm:-mt-[145px] md:-mt-[155px] rounded-2xl glass-panel bg-[#0a0a14]/90 border border-white/15 p-4 sm:p-5 text-left flex flex-col justify-between hover:border-blue-500/60 transition-all duration-200 shadow-2xl group cursor-pointer hover:shadow-blue-500/10"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${angle}deg)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="text-blue-300 font-bold truncate max-w-[110px]">{item.category}</span>
                    <span className="text-amber-400 font-bold font-mono shrink-0">{item.clientValue}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-200 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-white/50 mt-1.5 sm:mt-2 line-clamp-3 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-white/50 group-hover:text-blue-300">
                  <span>Inspect Prompt</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
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
