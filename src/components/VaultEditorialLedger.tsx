import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Copy, Layers, Search, Sparkles, Check, Play, Pause, LayoutGrid, List } from 'lucide-react';
import { VaultItem, isPromptFree } from '../data/vaultCatalog';
import { getAllVaultPrompts, initPromptsCloudSync } from '../lib/promptCatalogStore';
import { isMediaImage } from '../lib/mediaUtils';
import { PromptModal } from './PromptModal';
import { CopyPromptLeadModal } from './CopyPromptLeadModal';
import { sound } from '../lib/audioEngine';
import { trackPromptInspect, trackSearch } from '../lib/visitorTracker';

interface VaultEditorialLedgerProps {
  onUnlockClick: () => void;
}

const CATEGORIES = [
  'All Free',
  'Luxury Brands',
  'Spatial & WebGL',
  'High-Ticket Agency',
  'AI Agents & Systems',
  'E-Commerce 3D',
];

// Single Free Prompt Card Component with Full Video / GIF / Image Preview
const FreePromptCard: React.FC<{
  item: VaultItem;
  index: number;
  onCopyClick: (item: VaultItem) => void;
  onInspectClick: (item: VaultItem) => void;
}> = ({ item, index, onCopyClick, onInspectClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const isImage = isMediaImage(item.videoUrl);

  const num = String(index + 1).padStart(2, '0');

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isImage) return;

    if (videoRef.current) {
      if (videoRef.current.paused) {
        sound.playClick();
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      onClick={() => onCopyClick(item)}
      onMouseEnter={() => sound.playHover()}
      className="group relative rounded-2xl bg-[#090912] border border-white/10 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer select-none"
    >
      {/* 1. Media Stage (Video / GIF / Image) */}
      <div
        className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer shrink-0"
        onClick={toggleVideoPlayback}
      >
        {isImage ? (
          <img
            src={item.videoUrl || item.poster || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80'}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={item.poster}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Video Scrim Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/90 text-black shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-black" />
            <span>FREE</span>
          </span>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 backdrop-blur-md border border-white/20 text-amber-400">
            {item.clientValue}
          </span>
        </div>

        {/* Floating Bottom Left Badge & Play Toggle */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-xs z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-white/70 text-[10px] font-mono">
            {item.fpsBadge || '60 FPS WEBGL'}
          </span>

          {!isImage && (
            <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 pointer-events-auto">
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </div>
          )}
        </div>
      </div>

      {/* 2. Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-mono">
            <span className="text-emerald-400 font-bold">{num}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/50 text-[11px] uppercase tracking-wider truncate">{item.category}</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs text-white/60 mt-1.5 line-clamp-2 font-sans leading-relaxed">
            {item.subtitle || item.description}
          </p>

          {/* Tested Models Tags */}
          {item.testedModels && item.testedModels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {item.testedModels.slice(0, 2).map((model) => (
                <span
                  key={model}
                  className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[10px] font-mono text-white/50"
                >
                  {model}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Card Bottom Actions */}
        <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-white/10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspectClick(item);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-1.5"
            title="Inspect specs and architecture"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Inspect</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopyClick(item);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Free</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const VaultEditorialLedger: React.FC<VaultEditorialLedgerProps> = ({ onUnlockClick }) => {
  const [allPrompts, setAllPrompts] = useState<VaultItem[]>(() => getAllVaultPrompts());
  const [inspectItem, setInspectItem] = useState<VaultItem | null>(null);
  const [leadTargetPrompt, setLeadTargetPrompt] = useState<VaultItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All Free');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Debounced search tracking for Meta Pixel + Analytics
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) return;
    const t = setTimeout(() => {
      trackSearch(searchQuery.trim(), activeCategory);
    }, 1200);
    return () => clearTimeout(t);
  }, [searchQuery, activeCategory]);

  // Filter strictly to FREE prompts only — paid prompts are kept locked in paid vault
  const freePrompts = useMemo(() => {
    return allPrompts.filter((item) => isPromptFree(item) && !item.isDeleted);
  }, [allPrompts]);

  const filteredItems = useMemo(() => {
    return freePrompts.filter((item) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'All Free' ||
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

  const handlePromptClick = (item: VaultItem) => {
    sound.playClick();
    setLeadTargetPrompt(item);
  };

  const handleInspectClick = (item: VaultItem) => {
    sound.playSweep();
    trackPromptInspect(item.id, item.title);
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
              <span>FREE PRODUCTION PROMPTS • CLICK TO COPY &amp; ACCESS PORTAL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Free Prompts &amp; <span className="accent-text-gradient font-display italic font-normal">Blueprints</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/60 max-w-md font-sans">
            Try our production-verified 3D WebGL prompts for free. Click any prompt below to copy the full code syntax and launch into the Member Portal.
          </p>
        </motion.div>

        {/* Live Search, Category Filters and View Toggle Toolbar */}
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

          {/* Right Toolbar: View Mode + Counter */}
          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
            {/* View Switcher (Grid vs List) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setViewMode('grid');
                }}
                className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Visual Card Grid with Video/Image Previews"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setViewMode('list');
                }}
                className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Detailed Rows with Thumbnails"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rows</span>
              </button>
            </div>

            {/* Free Prompts Counter Badge */}
            <div className="flex items-center gap-2 text-xs font-mono text-white/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                <strong className="text-emerald-400 font-bold">{filteredItems.length} Free Prompts</strong> Live
              </span>
            </div>
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

        {/* 1. VISUAL CARD GRID VIEW (Default — Video / GIF / Image previews for every prompt) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-16 text-center text-white/40 text-sm font-mono">
                No free prompt blueprints match "{searchQuery}". Try selecting "All Free".
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <FreePromptCard
                  key={item.id}
                  item={item}
                  index={index}
                  onCopyClick={handlePromptClick}
                  onInspectClick={handleInspectClick}
                />
              ))
            )}
          </div>
        )}

        {/* 2. COMPACT LIST VIEW (With rich video / GIF / image thumbnails on each row) */}
        {viewMode === 'list' && (
          <div className="divide-y divide-white/10 border-y border-white/10">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center text-white/40 text-sm font-mono">
                No free prompt blueprints match "{searchQuery}". Try selecting "All Free".
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const num = String(index + 1).padStart(2, '0');
                const isImage = isMediaImage(item.videoUrl);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, delay: (index % 6) * 0.04 }}
                    onClick={() => handlePromptClick(item)}
                    onMouseEnter={() => sound.playHover()}
                    className="group py-5 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] px-4 sm:px-6 -mx-4 rounded-2xl transition-all border border-transparent hover:border-emerald-500/20"
                  >
                    {/* Media Thumbnail + Number + Info */}
                    <div className="flex items-start md:items-center gap-4 sm:gap-6 min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-mono text-emerald-400/60 group-hover:text-emerald-400 font-bold transition-colors mt-2 md:mt-0">
                        {num}
                      </span>

                      {/* Video / GIF / Image Thumbnail */}
                      <div className="w-24 sm:w-36 aspect-video rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {isImage ? (
                          <img
                            src={item.videoUrl || item.poster || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80'}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <video
                            src={item.videoUrl}
                            poster={item.poster}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-white/70">
                          {isImage ? 'WEBP' : 'MP4'}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {item.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>FREE</span>
                          </span>
                        </div>
                        <p className="text-xs text-white/60 mt-1 font-sans line-clamp-1 max-w-xl">
                          {item.subtitle || item.description}
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectClick(item);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-mono transition-all flex items-center gap-1.5"
                          title="Inspect blueprint specifications"
                        >
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden sm:inline">Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptClick(item);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
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
        )}

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
