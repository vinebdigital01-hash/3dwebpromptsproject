import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, DollarSign, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface RoiCalculatorProps {
  onUnlockClick: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onUnlockClick }) => {
  const [projectCount, setProjectCount] = useState<number>(6);
  const [targetFee, setTargetFee] = useState<number>(10000);

  const traditionalFee = 1500;
  const traditionalTotal = projectCount * traditionalFee;
  const apexTotal = projectCount * targetFee;
  const profitDelta = apexTotal - traditionalTotal;
  const lifetimeCost = 36; // $36 / ₹2,999 Lifetime VIP Pass
  const roiMultiplier = Math.round((profitDelta / lifetimeCost));

  return (
    <section id="calculator" className="relative py-20 sm:py-28 md:py-32 px-4 sm:px-8 lg:px-16 bg-[#050508] border-t border-white/5 will-change-transform transform-gpu">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[300px] sm:h-[500px] bg-blue-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-2"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-white/80 mb-4">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>AGENCY REVENUE SIMULATOR</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 sm:mb-4">
            Why 3D Websites Generate <span className="accent-text-gradient font-display italic font-normal">10X Client Billings</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-white/60 font-sans leading-relaxed">
            A standard 2D flat website is commoditized at $1,500. A high-end 3D WebGL experience commands between $8,500 and $15,000+. Calculate your annual agency upside below:
          </p>
        </motion.div>

        {/* Interactive Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-[#090914]/90 border border-white/10 shadow-2xl shadow-black/80"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Controls (Col 6) */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              {/* Slider 1: Number of Projects */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <label className="text-xs sm:text-sm font-medium text-white/80">
                    Annual client websites built:
                  </label>
                  <span className="text-lg sm:text-2xl font-bold font-mono text-blue-400 tabular-nums shrink-0">
                    {projectCount} sites
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={projectCount}
                  onChange={(e) => {
                    sound.playClick();
                    setProjectCount(parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] sm:text-[11px] text-white/40 font-mono mt-1.5">
                  <span>1 site / yr</span>
                  <span>12 sites (1/mo)</span>
                  <span>25 sites / yr</span>
                </div>
              </div>

              {/* Slider 2: Target 3D Fee per Project */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <label className="text-xs sm:text-sm font-medium text-white/80">
                    Target 3D invoice fee:
                  </label>
                  <span className="text-lg sm:text-2xl font-bold font-mono text-blue-400 tabular-nums shrink-0">
                    ${targetFee.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="20000"
                  step="500"
                  value={targetFee}
                  onChange={(e) => {
                    sound.playClick();
                    setTargetFee(parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] sm:text-[11px] text-white/40 font-mono mt-1.5">
                  <span>$5,000 (Entry)</span>
                  <span>$10,000 (Average)</span>
                  <span>$20,000 (Luxury)</span>
                </div>
              </div>

              {/* Comparison Bar Pill */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-white/60">
                  <span className="truncate pr-2">Traditional 2D rate ($1,500/site):</span>
                  <span className="font-mono text-white/80 shrink-0 tabular-nums">${traditionalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-white/60">
                  <span className="truncate pr-2 font-medium text-white/80">With APEX 3D Prompts:</span>
                  <span className="font-mono text-emerald-400 font-bold shrink-0 tabular-nums">${apexTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right Results Hero Box (Col 6) */}
            <div className="lg:col-span-6 rounded-2xl p-5 sm:p-7 md:p-8 bg-gradient-to-br from-[#0c0c16] to-[#121220] border border-blue-500/30 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-500/5">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-blue-300">
                  ANNUAL PROFIT EXPANSION
                </span>
                <div className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent my-2 sm:my-3 font-mono tabular-nums">
                  +${profitDelta.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  By elevating your deliverables from basic 2D templates to interactive 3D WebGL experiences, you add an extra{' '}
                  <strong className="text-amber-300">${profitDelta.toLocaleString()}</strong> in pure profit to your bottom line.
                </p>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-5 sm:my-6 pt-4 border-t border-white/10">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase">INVESTMENT RECOVERY</div>
                  <div className="text-sm sm:text-base md:text-lg font-bold text-blue-300 mt-0.5 truncate">Day 1 of Project 1</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase">ROI ON LIFETIME PASS</div>
                  <div className="text-sm sm:text-base md:text-lg font-bold text-amber-400 mt-0.5 tabular-nums">+{roiMultiplier}x Upside</div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playSuccess();
                  onUnlockClick();
                }}
                onMouseEnter={() => sound.playHover()}
                className="w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <span>Claim Your 10x Agency Upside</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
