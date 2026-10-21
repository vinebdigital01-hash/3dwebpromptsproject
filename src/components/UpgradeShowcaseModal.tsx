import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  FolderGit2,
  Clock,
  ShieldCheck,
  Infinity,
} from 'lucide-react';
import { TierId } from './PricingSection';
import { sound } from '../lib/audioEngine';
import { getAdminSettings } from '../lib/adminSettings';
import {
  recordUpgradeModalView,
  recordUpgradeTierSelection,
  recordUpgradeCtaClick,
  recordUpgradeModalDismiss,
} from '../lib/leadTracker';

export interface UpgradeOption {
  id: TierId;
  name: string;
  badge: string;
  tagline: string;
  priceINR: number;
  durationLabel: string;
  quotaLabel: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  accent: 'blue' | 'emerald' | 'amber' | 'gold';
  highlightPerks: string[];
}

export function getUpgradeOptions(): UpgradeOption[] {
  const settings = getAdminSettings();
  const pricing = settings.pricing || {
    day_1: 49,
    month_1: 299,
    month_6: 699,
    lifetime: 2999,
  };

  return [
    {
      id: 'day_pass',
      name: '1-Day Sprint Pass',
      badge: 'ENTRY SPRINT',
      tagline: 'Ideal for rush test builds and single prompt deployment today.',
      priceINR: pricing.day_1 || 49,
      durationLabel: '24 Hours (1 Day)',
      quotaLabel: '1 Copy / Day',
      accent: 'blue',
      highlightPerks: [
        '1 copy daily (Any prompt in 500+ vault)',
        'Full Commercial + Reseller License',
        'Claude 3.7 & Cursor instant copy syntax',
        'Three.js & WebGL component boilerplates',
      ],
    },
    {
      id: 'month_1',
      name: '1-Month Pro Access',
      badge: 'BUDGET FRIENDLY',
      tagline: 'Perfect for active freelancers shipping weekly client work.',
      priceINR: pricing.month_1 || 299,
      durationLabel: '30 Days Validity',
      quotaLabel: '3 Copies / Day',
      accent: 'emerald',
      highlightPerks: [
        '3 copies daily (90 copies/month)',
        'Full 500+ prompt catalog unlocked',
        'Commercial License to charge clients $5k+',
        'Standard Claude 3.7 & Cursor calibration',
      ],
    },
    {
      id: 'month_6',
      name: '6-Month Studio Growth',
      badge: 'MOST POPULAR',
      tagline: 'High volume for active freelancers & boutique digital studios.',
      priceINR: pricing.month_6 || 699,
      durationLabel: '180 Days (6 Months)',
      quotaLabel: '15 Copies / Day',
      isPopular: true,
      accent: 'amber',
      highlightPerks: [
        '15 copies daily (2,700 copies total)',
        'All 500+ Prompts + 50+ PDF guides',
        'Outbound client acquisition pitch scripts',
        'Priority Discord assistance channel',
      ],
    },
    {
      id: 'lifetime',
      name: 'Lifetime VIP All-Access',
      badge: 'BEST VALUE // UNRESTRICTED',
      tagline: 'The ultimate powerhouse. Zero daily limits and perpetual license.',
      priceINR: pricing.lifetime || 2999,
      durationLabel: 'Lifetime (Never Expires)',
      quotaLabel: 'UNLIMITED COPIES',
      isRecommended: true,
      accent: 'gold',
      highlightPerks: [
        'Unlimited prompt copies (Zero daily caps)',
        'Next.js 15 + R19 starter repositories (.zip & npx)',
        '12+ Awwwards GLSL liquid & caustics shaders',
        'Weekly new 3D architectures pushed forever',
        'Direct WhatsApp 1-on-1 Three.js prompt helpdesk',
      ],
    },
  ];
}

interface PerkTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  headline: string;
  details: string;
  codePreview?: string;
  bullet: string;
}

const PERK_TABS: PerkTab[] = [
  {
    id: 'quota',
    label: 'Daily Quotas',
    icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    headline: 'Say Goodbye to Copy Limits',
    details:
      'Free trial includes 1 lifetime free copy. Paid passes unlock 1 copy/day (₹49 1-Day Pass), 3 copies/day (1-Month), 15 copies/day (6-Month), or infinite unmetered copies (Lifetime VIP).',
    bullet: 'No more waiting 24 hours to copy another prompt for client projects.',
  },
  {
    id: 'boilerplates',
    label: 'Starter Repos',
    icon: <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />,
    headline: 'Pre-Wired Next.js 15 & Three.js Canvas Engines',
    details:
      'Skip 20+ hours of setup. Instant access to full GitHub repositories pre-configured with React Three Fiber, Drei helpers, and Rapier 3D physics.',
    codePreview: 'npx degit vinebdigital/apex3d-starter my-spatial-app',
    bullet: '1-command terminal scaffolding ready for immediate npm run dev.',
  },
  {
    id: 'shaders',
    label: 'GLSL Shaders',
    icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    headline: '12+ Custom Awwwards-Grade Liquid & Caustic Shaders',
    details:
      'Simplex Noise liquid wave displacement, kinetic chromatic aberration on mouse velocity, and glass caustics calibrated for strict 60 FPS WebGL.',
    bullet: 'Bespoke vertex & fragment shaders included in 6-Month & Lifetime tiers.',
  },
  {
    id: 'commercial',
    label: 'Commercial Rights',
    icon: <Award className="w-3.5 h-3.5 text-emerald-400" />,
    headline: '100% White-Label Commercial Studio License',
    details:
      'Deliver spatial 3D websites to unlimited commercial clients and bill $5,000 to $20,000 per project. Zero royalties and no attribution required.',
    bullet: 'Includes official commercial invoice & MSME certificate for 100% business expense deduction.',
  },
];

export interface UpgradeShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (selectedTierId: TierId) => void;
  currentTierName?: string;
  triggerReason?: 'quota_exceeded' | 'manual';
  activeCustomerIdentifier?: string;
}

export const UpgradeShowcaseModal: React.FC<UpgradeShowcaseModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  currentTierName = 'Free Trial Member',
  triggerReason = 'quota_exceeded',
  activeCustomerIdentifier,
}) => {
  const upgradeOptions = useMemo(() => getUpgradeOptions(), []);
  const [selectedTierId, setSelectedTierId] = useState<TierId>('lifetime');
  const [activePerkTab, setActivePerkTab] = useState<string>('quota');

  useEffect(() => {
    if (!isOpen) return;

    if (activeCustomerIdentifier) {
      recordUpgradeModalView(activeCustomerIdentifier, triggerReason);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeCustomerIdentifier) {
          recordUpgradeModalDismiss(activeCustomerIdentifier, selectedTierId);
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeCustomerIdentifier, triggerReason]);

  if (!isOpen) return null;

  const selectedTier =
    upgradeOptions.find((o) => o.id === selectedTierId) || upgradeOptions[0];

  const handleSelectTier = (id: TierId) => {
    sound.playClick();
    setSelectedTierId(id);
    if (activeCustomerIdentifier) {
      recordUpgradeTierSelection(activeCustomerIdentifier, id);
    }
  };

  const handleUpgradeSubmit = () => {
    sound.playSuccess();
    if (activeCustomerIdentifier) {
      recordUpgradeCtaClick(activeCustomerIdentifier, selectedTierId);
    }
    onUpgrade(selectedTierId);
  };

  const handleDismiss = () => {
    sound.playClick();
    if (activeCustomerIdentifier) {
      recordUpgradeModalDismiss(activeCustomerIdentifier, selectedTierId);
    }
    onClose();
  };

  const currentPerk = PERK_TABS.find((p) => p.id === activePerkTab) || PERK_TABS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden">
      {/* Click Outside Backdrop */}
      <div className="fixed inset-0" onClick={handleDismiss} />

      {/* Main Container - Constrained to 92vh with Sticky Header & Sticky Footer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="relative z-10 w-full max-w-6xl max-h-[94vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-[#08080f] border border-amber-500/25 text-white shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(245,158,11,0.12)] flex flex-col overflow-hidden"
      >
        {/* Subtle Ambient Top Accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent shrink-0" />

        {/* 1. STICKY HEADER */}
        <div className="px-5 sm:px-7 py-3.5 sm:py-4 border-b border-white/[0.08] bg-[#07070c] flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                WORKSTATION UPGRADE ENCLAVE
              </span>

              {triggerReason === 'quota_exceeded' ? (
                <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Daily Copy Limit Reached
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  Active: {currentTierName}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Select Your Access Plan
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Commercial License Ribbon */}
            <div className="hidden sm:flex flex-col items-end text-right px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <span className="text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>COMMERCIAL LICENSE INCLUDED</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-400">
                Charge clients $5,000+ per site
              </span>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 sm:p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. SCROLLABLE BODY CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-3.5 sm:py-4 space-y-4 no-scrollbar">
          
          {/* Subtitle Directive */}
          <div className="text-xs text-zinc-300 leading-relaxed">
            Choose the access pass that fits your workflow — from quick <strong>₹{upgradeOptions[0]?.priceINR || 49} 1-Day Sprint</strong> access to full <strong>Lifetime VIP Unlimited</strong>:
          </div>

          {/* ALL 4 COMPARISON TIER CARDS (Including ₹49 1-Day Pass) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {upgradeOptions.map((tier) => {
              const isSelected = selectedTierId === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => handleSelectTier(tier.id)}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? tier.id === 'lifetime'
                        ? 'bg-[#100f07] border-2 border-amber-400 shadow-[0_8px_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                        : tier.id === 'month_6'
                        ? 'bg-[#120c06] border-2 border-amber-500 shadow-[0_8px_30px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
                        : tier.id === 'month_1'
                        ? 'bg-[#08120e] border-2 border-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/50'
                        : 'bg-[#0a0d14] border-2 border-blue-400 shadow-[0_8px_30px_rgba(59,130,246,0.2)] ring-1 ring-blue-400/50'
                      : 'bg-[#09090e] border border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0c0c14]'
                  }`}
                >
                  {/* Top Badge & Radio */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        tier.isRecommended
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : tier.isPopular
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : tier.id === 'month_1'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {tier.badge}
                    </span>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? tier.id === 'lifetime' || tier.id === 'month_6'
                            ? 'border-amber-400 bg-amber-400 text-black'
                            : tier.id === 'month_1'
                            ? 'border-emerald-400 bg-emerald-400 text-black'
                            : 'border-blue-400 bg-blue-400 text-black'
                          : 'border-white/20 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {tier.name}
                    </h3>

                    {/* Pricing */}
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                        ₹{tier.priceINR}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        / {tier.durationLabel}
                      </span>
                    </div>

                    {/* Quota Metric Badge */}
                    <div className="mt-2 py-1 px-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                      {tier.id === 'lifetime' ? (
                        <Infinity className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{tier.quotaLabel}</span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                      {tier.tagline}
                    </p>

                    {/* Features List */}
                    <div className="mt-3 space-y-1.5 pt-3 border-t border-white/[0.06]">
                      {tier.highlightPerks.map((perk, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select Pill Indicator */}
                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                        isSelected
                          ? tier.id === 'lifetime' || tier.id === 'month_6'
                            ? 'bg-amber-400 text-black'
                            : tier.id === 'month_1'
                            ? 'bg-emerald-400 text-black'
                            : 'bg-blue-400 text-white'
                          : 'bg-white/[0.05] text-zinc-400 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. COMPACT PERK PREVIEW BAR */}
          <div className="p-3 rounded-xl bg-[#06060a] border border-white/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono mb-2">
              <span className="text-zinc-500 uppercase tracking-wider">PRODUCTION ASSETS UNLOCKED:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {PERK_TABS.map((tab) => {
                  const isActive = activePerkTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        sound.playClick();
                        setActivePerkTab(tab.id);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-white/10 text-white border border-white/20 font-bold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 leading-snug flex items-center justify-between gap-3">
              <span>
                <strong className="text-white font-sans">{currentPerk.headline}:</strong>{' '}
                {currentPerk.details}
              </span>
              {currentPerk.codePreview && (
                <span className="text-[9px] font-mono text-amber-300/80 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06] shrink-0 hidden md:inline-block">
                  {currentPerk.codePreview}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* 3. STICKY FOOTER ACTION MATRIX (ALWAYS VISIBLE) */}
        <div className="shrink-0 px-5 sm:px-7 py-3 sm:py-4 border-t border-white/[0.08] bg-[#060609] flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
          {/* Left: Summary of Selected Plan */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500">SELECTED:</span>
            <span className="text-white font-bold">{selectedTier.name}</span>
            <span className="text-amber-300 font-bold text-sm">₹{selectedTier.priceINR}</span>
            <span className="text-zinc-400 text-[10px] hidden sm:inline-block">
              ({selectedTier.durationLabel} · {selectedTier.quotaLabel})
            </span>
          </div>

          {/* Right: CTA Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs font-mono transition-colors border border-white/[0.06] cursor-pointer"
            >
              Dismiss
            </button>

            <button
              onClick={handleUpgradeSubmit}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg active:scale-[0.98] flex items-center gap-2 cursor-pointer ${
                selectedTier.id === 'lifetime'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black shadow-amber-500/25'
                  : selectedTier.id === 'month_6'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/20'
                  : selectedTier.id === 'day_pass'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-white/10'
              }`}
            >
              <span>Get {selectedTier.name} (₹{selectedTier.priceINR})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
