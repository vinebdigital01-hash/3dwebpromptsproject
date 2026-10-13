import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface StickyFunnelBarProps {
  onUnlockClick: () => void;
}

export const StickyFunnelBar: React.FC<StickyFunnelBarProps> = ({ onUnlockClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 15 });

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 480);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 22, seconds: 15 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-4 pt-2.5 sm:pt-3.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5 bg-[#0a0a14]/95 backdrop-blur-xl border-t border-white/15 shadow-2xl shadow-black select-none will-change-transform transform-gpu"
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
            {/* Urgency Message */}
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="text-[11px] sm:text-xs">
                <span className="font-semibold text-white">
                  ⚡ FLASH SALE: Lifetime Price Rises to ₹5,999 in{' '}
                  <span className="font-mono text-amber-300 font-bold whitespace-nowrap">
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </span>
                <span className="hidden md:inline text-white/50 ml-2">
                  • 500+ Master Prompts + Reseller License in All Plans
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end shrink-0">
              <button
                onClick={() => {
                  sound.playSuccess();
                  onUnlockClick();
                }}
                onMouseEnter={() => sound.playHover()}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Claim Lifetime Access (₹2,999)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
