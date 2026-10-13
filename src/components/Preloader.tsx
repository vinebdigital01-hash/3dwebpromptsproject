import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const WORDS = ['Synthesize', 'Render', 'Command', 'Convert'];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number>(0);
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 2400; // ms

    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * 100);

      setCount(current);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        setCount(100);
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            onComplete();
          }, 450);
        }, 300);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#050508] text-white flex flex-col justify-between p-8 sm:p-12 transition-opacity duration-500 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-sm shadow-blue-500/50" />
          <span className="text-xs uppercase tracking-[0.3em] text-white/50 font-mono">
            APEX3D // VAULT 2026
          </span>
        </div>
        <span className="text-xs text-blue-300 font-mono">INITIALIZING WEBGL CORE</span>
      </div>

      {/* Center Dynamic Word */}
      <div className="my-auto text-center">
        <div className="text-xs font-mono uppercase tracking-[0.25em] text-blue-300 mb-3">
          Ready to Deploy
        </div>
        <div
          key={wordIndex}
          className="font-display italic text-5xl sm:text-7xl md:text-8xl bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent animate-role-fade-in"
        >
          {WORDS[wordIndex]}
        </div>
        <div className="mt-4 text-xs sm:text-sm text-white/40 font-mono">
          Compiling High-Ticket Three.js Prompt Schemas...
        </div>
      </div>

      {/* Bottom Counter & Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="text-xs sm:text-sm text-white/40 font-mono">
            $10,000 / MO SALES FUNNEL ARCHITECTURE
          </div>
          <div className="text-6xl sm:text-8xl md:text-9xl font-display text-white tabular-nums tracking-tighter">
            {String(count).padStart(3, '0')}
          </div>
        </div>

        {/* Progress line */}
        <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full accent-gradient transition-all duration-75 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            style={{ width: `${count}%` }}
          />
        </div>
      </div>
    </div>
  );
};
