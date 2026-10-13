import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Lock, Layers, Search, Sparkles, Database, Check } from 'lucide-react';
import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';
import { PromptModal } from './PromptModal';
import { sound } from '../lib/audioEngine';

interface VaultEditorialLedgerProps {
  onUnlockClick: () => void;
}

const CATEGORIES = [
  'All (500+)',
  'Luxury Brands',
  'High-Ticket Agency',
  'E-Commerce 3D',
  'Spatial & WebGL',
  'AI Agents & Systems',
  'Design Systems',
];

export const VaultEditorialLedger: React.FC<VaultEditorialLedgerProps> = ({ onUnlockClick }) => {
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All (500+)');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return VAULT_CATALOG.filter((item) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'All (500+)' || item.filterGroup === activeCategory;

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
  }, [activeCategory, searchQuery]);

  const handleRowClick = (item: VaultItem) => {
    sound.playSweep();
    setSelectedItem(item);
  };

  return (
    <motion.section
      id="catalog"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#050508] border-t border-white/5 select-none will-change-transform transform-gpu"
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
            <div className="flex items-center gap-2 text-xs font-mono text-white/70 uppercase tracking-widest mb-3">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>THE PRODUCTION ARCHIVE • 500+ MASTER PROMPTS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Vault Catalog & <span className="accent-text-gradient font-display italic font-normal">500+ Blueprints</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/50 max-w-sm font-sans">
            Every entry in our 500+ vault includes verified prompt syntax, Three.js component code, and client pitch decks.
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
              placeholder="Search 500+ prompts (e.g. Three.js, Luxury, Cyber, Sneaker, GLSL)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all font-sans"
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

          {/* Database Counter Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-white/60 shrink-0">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Showing {filteredItems.length} of <strong className="text-white">500+ Prompts</strong> in Vault
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
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/30'
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
              No prompt blueprints match "{searchQuery}". Try searching "Three.js", "Luxury", or "Cyber".
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
                  className="group py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition-colors"
                >
                  {/* Left: Number + Title */}
                  <div className="flex items-start md:items-center gap-4 sm:gap-6">
                    <span className="text-xs sm:text-sm font-mono text-white/30 group-hover:text-blue-400 transition-colors mt-0.5 md:mt-0">
                      {num}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-white transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-white/50 mt-1 font-sans line-clamp-1 max-w-xl">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Valuation + Models + Inspect Link */}
                  <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8 pt-2 md:pt-0">
                    <div className="text-left md:text-right">
                      <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
                        {item.clientValue}
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">
                        {item.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors shrink-0">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Database Footer Callout for 500+ Prompts */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-purple-950/30 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-blue-300 uppercase tracking-widest">
                COMPLETE DATABASE ACCESS
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                500+ Master Prompts In The Live Repository
              </h4>
              <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl font-sans">
                Every pass includes instant search and copy permissions across all 500+ prompts, code templates, Google Drive mirror, and weekly drops.
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

      {/* Inspection Modal */}
      <PromptModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUnlockClick={onUnlockClick}
      />
    </motion.section>
  );
};
