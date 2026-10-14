import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Zap, ArrowRight, LayoutGrid, Table2 } from 'lucide-react';

export const ComparisonMatrix: React.FC = () => {
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  const criteria = [
    {
      feature: 'Delivery Time to Client',
      apex: 'Minutes (Copy & Deploy)',
      freelancer: '3 to 6 Weeks Delay',
      solo: '6 to 12 Months Learning',
    },
    {
      feature: 'Cost per Client Project',
      apex: '$0 (Unlimited Deployments)',
      freelancer: '$4,000 – $8,000 Per Site',
      solo: '100s of Hours Opportunity Cost',
    },
    {
      feature: 'Agency Profit Retention',
      apex: '100% Margin ($10,000+ Kept)',
      freelancer: '30% – 40% Margin (Shared)',
      solo: 'Low Profit While Stumbling',
    },
    {
      feature: 'Tested on Claude 3.7 & Cursor',
      apex: 'Verified 60 FPS Calibration',
      freelancer: 'Unknown Code Quality',
      solo: 'Constant Syntax Errors',
    },
    {
      feature: 'Client Pitching & Outreach Decks',
      apex: 'Included ($25k Value)',
      freelancer: 'None Provided',
      solo: 'None Provided',
    },
    {
      feature: 'Commercial & Reseller License',
      apex: 'Personal + Commercial + Reseller in ALL Plans',
      freelancer: 'Contractor IP Negotiations',
      solo: 'Personal Only',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-20 sm:py-28 md:py-32 px-4 sm:px-8 lg:px-16 bg-[#050508] border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-2"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-300 mb-4">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>THE STRATEGIC ADVANTAGE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 sm:mb-4">
            Why High-Earning Studios <span className="accent-text-gradient font-display italic font-normal">Never Code 3D From Scratch</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-white/60 font-sans">
            Compare the economic reality of deploying APEX3D Vault prompts against traditional options.
          </p>

          {/* Mobile View Toggle Switch (Phones only) */}
          <div className="md:hidden flex items-center justify-center gap-2 mt-6">
            <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setMobileViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  mobileViewMode === 'cards'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card View</span>
              </button>
              <button
                onClick={() => setMobileViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  mobileViewMode === 'table'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Native Card View (Default on Phones) */}
        <div className={`md:hidden space-y-4 ${mobileViewMode === 'cards' ? 'block' : 'hidden'}`}>
          {criteria.map((item, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl glass-panel bg-[#090912]/90 border border-white/10 space-y-3.5"
            >
              <div className="text-xs font-mono text-white/50 uppercase tracking-wider">
                {item.feature}
              </div>

              {/* APEX3D Vault Result (Featured) */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-blue-300 font-bold">⚡ APEX3D VAULT</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{item.apex}</div>
                </div>
              </div>

              {/* Other Options Row */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block text-[10px] font-mono">3D FREELANCER:</span>
                  <span className="text-rose-300/80 mt-1 block flex items-start gap-1">
                    <X className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                    <span>{item.freelancer}</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block text-[10px] font-mono">LEARNING SOLO:</span>
                  <span className="text-rose-300/80 mt-1 block flex items-start gap-1">
                    <X className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                    <span>{item.solo}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Matrix Table (Desktop & Tablet, and optional mobile toggle) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={`glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#090912]/80 overflow-x-auto shadow-2xl touch-pan-x ${
            mobileViewMode === 'table' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="md:hidden text-center py-2 bg-white/5 border-b border-white/10 text-[10px] font-mono text-white/50">
            ← Scroll horizontally to see Freelancer and Solo comparison →
          </div>
          <table className="w-full text-left border-collapse min-w-[580px] sm:min-w-[620px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 sm:p-5 md:p-6 text-xs font-mono uppercase tracking-wider text-white/50 w-2/5">
                  DELIVERABLE CRITERIA
                </th>
                <th className="p-4 sm:p-5 md:p-6 text-xs font-mono uppercase tracking-wider text-blue-300 font-bold w-1/5 bg-blue-500/10 border-x border-blue-500/30">
                  ⚡ APEX3D VAULT
                </th>
                <th className="p-4 sm:p-5 md:p-6 text-xs font-mono uppercase tracking-wider text-white/50 w-1/5">
                  HIRING 3D FREELANCER
                </th>
                <th className="p-4 sm:p-5 md:p-6 text-xs font-mono uppercase tracking-wider text-white/50 w-1/5">
                  LEARNING WEBGL SOLO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              {criteria.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 sm:p-5 md:p-6 font-medium text-white/90">
                    {row.feature}
                  </td>
                  <td className="p-4 sm:p-5 md:p-6 font-bold text-white bg-blue-500/[0.05] border-x border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-blue-400" />
                      <span>{row.apex}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 md:p-6 text-white/60">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{row.freelancer}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 md:p-6 text-white/60">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{row.solo}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </motion.section>
  );
};
