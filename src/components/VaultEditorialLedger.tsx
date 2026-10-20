import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Copy, Layers, Search, Sparkles, Check, ExternalLink } from 'lucide-react';
import { VaultItem, isPromptFree } from '../data/vaultCatalog';
import { getAllVaultPrompts, initPromptsCloudSync } from '../lib/promptCatalogStore';
import { PromptModal } from './PromptModal';
import { CopyPromptLeadModal } from './CopyPromptLeadModal';
import { sound } from '../lib/audioEngine';

interface VaultEditorialLedgerProps {
  onUnlockClick: () => void;
}

const CATEGORIES = [
  'All Free Samples',
  'Luxury Brands',
  'Spatial & WebGL',
  'High-Ticket Agency',
  'AI Agents & Systems',
  'E-Commerce 3D',
];

export const VaultEditorialLedger: React.FC<VaultEditorialLedgerProps> = ({ onUnlockClick }) => {
  const [allPrompts, setAllPrompts] = useState<VaultItem[]>(() => getAllVaultPrompts());
  const [inspectItem, setInspectItem] = useState<VaultItem | null>(null);
  const [leadTargetPrompt, setLeadTargetPrompt] = useState<VaultItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All Free Samples');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real-time Cloud Database synchronization for prompts
  useEffect(() => {
    const unsub = initPromptsCloudSync();
    const handleUpdate = () => {
      setAllPrompts(getAllVaultPrompts());
    };

    window.addEventListener('apex_prompts_updated', handleUpdate);
    return () => {
      unsub();
      window.removeEventListener('apex_prompts_updated', handleUpdate);
    };
  }, []);

  // Filter strictly to FREE prompts only — paid prompts are kept locked in paid vault
  const freePrompts = useMemo(() => {
    return allPrompts.filter((item) => isPromptFree(item) && !item.isDeleted);
  }, [allPrompts]);

  const filteredItems = useMemo(() => {
    return freePrompts.filter((item) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'All Free Samples' ||
        activeCategory === 'All' ||
        item.filterGroup === activeCategory;

      if (!matchesCategory) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        item.testedModels.some((model) => model.toLowerCase().includes(q))
      );
    });
  }, [freePrompts, activeCategory, searchQuery]);

  const handleRowClick = (item: VaultItem) => {
    sound.playClick();
    setLeadTargetPrompt(item);
  };

  const handleInspectClick = (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    sound.playSweep();
    setInspectItem(item);
  };

  return (
    <motion.section
      id="catalog"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#050508] border-t border-white/5 select-none"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>FREE PRODUCTION SAMPLES • CLICK TO COPY &amp; ACCESS PORTAL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Free Sample Prompts &amp; <span className="accent-text-gradient font-display italic font-normal">Blueprints</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/60 max-w-md font-sans">
            Try our production-verified 3D WebGL prompts for free. Click any prompt below to copy the full code syntax and launch into the Member Portal.
          </p>
        </motion.div>

        {/* Live Search and Category Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Interactive Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search free prompts (e.g. Three.js, Luxury, Cyber, GLSL)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Free Prompts Counter Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-white/70 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Showing <strong className="text-emerald-400 font-bold">{filteredItems.length} Free Sample Prompts</strong> on Homepage
            </span>
          </div>
        </div>

        {/* Filter Bar Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-10 pb-2"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-500/30'
                  : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Editorial Ledger Rows */}
        <div className="divide-y divide-white/10 border-y border-white/10">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-white/40 text-sm font-mono">
              No free prompt blueprints match "{searchQuery}". Try selecting "All Free Samples".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const num = String(index + 1).padStart(2, '0');

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: (index % 5) * 0.05 }}
                  onClick={() => handleRowClick(item)}
                  onMouseEnter={() => sound.playHover()}
                  className="group py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] px-4 sm:px-6 -mx-4 rounded-2xl transition-all border border-transparent hover:border-emerald-500/20"
                >
                  {/* Left: Number + Title + Badges */}
                  <div className="flex items-start md:items-center gap-4 sm:gap-6 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-mono text-emerald-400/60 group-hover:text-emerald-400 font-bold transition-colors mt-0.5 md:mt-0">
                      {num}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>FREE SAMPLE</span>
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-1 font-sans line-clamp-1 max-w-xl">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Valuation + Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pt-2 md:pt-0 shrink-0">
                    <div className="text-left md:text-right hidden sm:block">
                      <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
                        {item.clientValue}
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">
                        {item.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Secondary Inspect Specs Button */}
                      <button
                        type="button"
                        onClick={(e) => handleInspectClick(e, item)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-mono transition-all flex items-center gap-1.5"
                        title="Inspect blueprint specifications"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>

                      {/* Primary Copy Free Prompt Button */}
                      <button
                        type="button"
                        onClick={() => handleRowClick(item)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Free Prompt</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Database Footer Callout for Complete 500+ Paid Vault */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/25 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-blue-300 uppercase tracking-widest">
                WANT THE ENTIRE 500+ MASTER VAULT?
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Unlock 500+ Production Prompts &amp; Client SOW Blueprints
              </h4>
              <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl font-sans">
                Every pass includes instant search, copy rights, Google Drive download mirror, commercial client license, and reseller rights.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playSuccess();
              onUnlockClick();
            }}
            className="w-full md:w-auto px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <span>Unlock 500+ Vault (From ₹49)</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Copy Prompt Syntax Lead Capture Modal (Directly copies & redirects to /#portal) */}
      <CopyPromptLeadModal
        isOpen={!!leadTargetPrompt}
        promptSnippet={leadTargetPrompt?.promptArchitecture || ''}
        clientTitle={leadTargetPrompt?.title}
        onClose={() => setLeadTargetPrompt(null)}
        onSuccessRedirect={() => {
          setLeadTargetPrompt(null);
          window.location.hash = '#portal';
        }}
      />

      {/* Technical Inspection Modal */}
      <PromptModal
        item={inspectItem}
        onClose={() => setInspectItem(null)}
        onUnlockClick={onUnlockClick}
      />
    </motion.section>
  );
};
