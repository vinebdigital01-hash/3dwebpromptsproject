import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Flame, ArrowRight, ShieldCheck, Award, Zap, Infinity } from 'lucide-react';
import { sound } from '../lib/audioEngine';

export type Currency = 'INR' | 'USD' | 'EUR';

export type TierId = 'day_pass' | 'month_1' | 'month_6' | 'lifetime';

export interface PricingTier {
  id: TierId;
  name: string;
  tagline: string;
  durationLabel: string;
  copiesPerDay: string;
  hasLifetimeUpdates: boolean;
  priceINR: number;
  priceUSD: number;
  priceEUR: number;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  ctaLabel: string;
  accent: 'cobalt' | 'emerald' | 'amber' | 'gold';
}

export const TIERS: PricingTier[] = [
  {
    id: 'day_pass',
    name: '1-Day Sprint Pass',
    tagline: 'Ideal for rush test builds and single prompt deployment.',
    durationLabel: '1 Day (24 Hours)',
    copiesPerDay: '1 Copy / Day',
    hasLifetimeUpdates: false,
    priceINR: 49,
    priceUSD: 1,
    priceEUR: 1,
    accent: 'cobalt',
    features: [
      '1/day prompt copies (Any prompt in 500+ vault)',
      'Personal License included',
      'Commercial License included (Charge clients $5k+)',
      'Reseller License included',
      'Instant copy-paste syntax for Claude 3.7 & Cursor',
      'Three.js & WebGL component boilerplates',
      'Instant dashboard access'
    ],
    ctaLabel: 'Get 1-Day Pass'
  },
  {
    id: 'month_1',
    name: '1-Month Pro Access',
    tagline: 'Perfect for active freelancers shipping weekly client work.',
    durationLabel: '1 Month (30 Days)',
    copiesPerDay: '3 Copies / Day',
    hasLifetimeUpdates: true,
    priceINR: 299,
    priceUSD: 4,
    priceEUR: 3.5,
    accent: 'emerald',
    features: [
      '3/day prompt copies (Any prompt in 500+ vault)',
      'Instant access to full 500+ prompt repository',
      'Lifetime updates included forever',
      'Personal + Commercial + Reseller License included',
      'Continuous weekly new prompt drops',
      'Outbound pitch templates & deck access'
    ],
    ctaLabel: 'Start 1-Month Plan'
  },
  {
    id: 'month_6',
    name: '6-Month Studio Growth',
    tagline: 'High volume for agencies delivering high-margin 3D sites.',
    durationLabel: '6 Months (180 Days)',
    copiesPerDay: '15 Copies / Day',
    hasLifetimeUpdates: true,
    priceINR: 699,
    priceUSD: 9,
    priceEUR: 8,
    popular: true,
    accent: 'amber',
    features: [
      '15/day prompt copies (Any prompt in 500+ vault)',
      'Lifetime updates included forever',
      'Personal + Commercial + Reseller License included',
      'All 500+ Master Prompts + 50+ Master PDF Guides',
      'Outbound Client Acquisition Scripts (Email/LinkedIn/Loom)',
      'Priority Discord assistance'
    ],
    ctaLabel: 'Claim 6-Month Plan'
  },
  {
    id: 'lifetime',
    name: 'Lifetime VIP All-Access',
    tagline: 'The ultimate agency powerhouse. Unlimited copies forever.',
    durationLabel: 'Lifetime (One-Time)',
    copiesPerDay: 'Unlimited Copies',
    hasLifetimeUpdates: true,
    priceINR: 2999,
    priceUSD: 36,
    priceEUR: 33,
    bestValue: true,
    accent: 'gold',
    features: [
      'Unlimited prompt copies (All 500+ prompts unlocked)',
      'Lifetime updates included forever (All weekly drops)',
      'Personal + Commercial + Reseller License in all',
      'Full 500+ Master Prompt Vault + Direct GitHub Mirrors',
      '2,000 AI-Readable Web Design Systems repository',
      'All 50+ Master PDF Guides + Outbound Pitch Decks',
      'Private VIP Agency Discord & Mastermind Community',
      'Direct 1-on-1 shader debugging support'
    ],
    ctaLabel: 'Claim Lifetime Access'
  }
];

interface PricingSectionProps {
  onSelectTier: (tier: PricingTier, currency: Currency) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectTier }) => {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 15 });

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

  const formatPrice = (tier: PricingTier) => {
    if (currency === 'INR') return `₹${tier.priceINR.toLocaleString('en-IN')}`;
    if (currency === 'USD') return `$${tier.priceUSD}`;
    return `€${tier.priceEUR}`;
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-[#050508] border-t border-white/5">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Flash Urgency Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto mb-8 p-3.5 sm:p-4 rounded-xl bg-[#140f07] border-2 border-amber-600/40 flex items-center justify-center gap-3 text-amber-200 text-xs sm:text-sm font-mono shadow-md shadow-black/40"
        >
          <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span className="text-center font-medium">
            FLASH SALE: Lifetime Access Increases to ₹5,999 in{' '}
            <strong className="text-white font-bold tracking-wider font-mono">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </strong>
          </span>
        </motion.div>

        {/* Section Heading & Currency Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>TRANSPARENT VALUE-BASED PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            Choose Your <span className="accent-text-gradient font-display italic font-normal">Vault Pass</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-white/60 mb-6 font-sans">
            Every plan includes instant dashboard access, verified Claude 3.7 & Cursor calibration, and complete licensing rights.
          </p>

          {/* Unified Triple License Guarantee Callout */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-amber-950/30 border border-blue-500/30 mb-8 max-w-2xl mx-auto text-left flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Personal + Commercial + Reseller License Included in All Plans</span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/70 mt-1 leading-relaxed font-sans">
                Deploy on your portfolio, charge paying clients $5,000–$15,000+, or package and resell turnkey 3D deliverables with 100% margin retention. No royalties, ever.
              </p>
            </div>
          </div>

          {/* Currency Toggle (Segmented Control) */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            {(['INR', 'USD', 'EUR'] as Currency[]).map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  sound.playClick();
                  setCurrency(curr);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  currency === curr
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {curr === 'INR' && 'INR (₹)'}
                {curr === 'USD' && 'USD ($)'}
                {curr === 'EUR' && 'EUR (€)'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 4 Tiers Grid (Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {TIERS.map((tier, idx) => {
            const isPopular = tier.popular;
            const isBestValue = tier.bestValue;

            // Tailored border styles per accent
            const borderStyle =
              tier.accent === 'gold'
                ? 'border-2 border-amber-500/80 hover:border-amber-400 bg-[#0e0c08]'
                : tier.accent === 'amber'
                ? 'border-2 border-amber-600/70 hover:border-amber-400/90 bg-[#0e0b06]'
                : tier.accent === 'emerald'
                ? 'border-2 border-emerald-700/60 hover:border-emerald-500 bg-[#060e09]'
                : 'border-2 border-blue-900/60 hover:border-blue-600 bg-[#070a14]';

            const buttonStyle =
              tier.accent === 'gold'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold shadow-amber-950/40'
                : tier.accent === 'amber'
                ? 'bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-amber-950/40'
                : tier.accent === 'emerald'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-emerald-950/40'
                : 'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-blue-950/40';

            const checkColor =
              tier.accent === 'gold'
                ? 'text-amber-400'
                : tier.accent === 'amber'
                ? 'text-amber-300'
                : tier.accent === 'emerald'
                ? 'text-emerald-400'
                : 'text-blue-400';

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl shadow-black/50 hover:-translate-y-1 ${borderStyle} ${
                  isPopular || isBestValue ? 'xl:-translate-y-2' : ''
                }`}
              >
                {/* Floating Badges */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-amber-600 text-amber-50 text-[10px] font-bold font-mono tracking-wider border border-amber-400/40 shadow-md whitespace-nowrap">
                    MOST POPULAR • 15/DAY
                  </div>
                )}
                {isBestValue && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-extrabold font-mono tracking-wider shadow-md whitespace-nowrap">
                    ★ ULTIMATE VIP • UNLIMITED
                  </div>
                )}

                <div>
                  {/* Tier Title & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-white tracking-tight">{tier.name}</h3>
                    {(isPopular || isBestValue) && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>

                  <div className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-white/70 mb-3">
                    {tier.durationLabel}
                  </div>

                  <p className="text-xs text-white/60 mb-5 leading-relaxed font-sans min-h-[34px]">
                    {tier.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="flex items-baseline gap-1.5 mb-4 pb-4 border-b border-white/10">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      {formatPrice(tier)}
                    </span>
                    <span className="text-[11px] font-mono text-white/50">
                      / {tier.id === 'day_pass' ? 'day' : tier.id === 'month_1' ? '1 mo' : tier.id === 'month_6' ? '6 mo' : 'lifetime'}
                    </span>
                  </div>

                  {/* Highlights Callout Badges */}
                  <div className="space-y-1.5 mb-5">
                    {/* Quota Badge */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono font-semibold">
                      {tier.id === 'lifetime' ? (
                        <Infinity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                      <span>{tier.copiesPerDay}</span>
                    </div>

                    {/* Updates Badge */}
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono ${
                      tier.hasLifetimeUpdates
                        ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold'
                        : 'bg-white/5 border border-white/10 text-white/50'
                    }`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{tier.hasLifetimeUpdates ? 'Lifetime updates included' : 'Current vault calibration'}</span>
                    </div>

                    {/* All Licenses Included Badge */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-mono font-medium">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>Personal + Commercial + Reseller</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-7">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-white/80 font-sans leading-snug">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${checkColor}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA & Guarantees */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      onSelectTier(tier, currency);
                    }}
                    onMouseEnter={() => sound.playHover()}
                    className={`w-full py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${buttonStyle}`}
                  >
                    <span>{tier.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center mt-2.5 text-[10px] text-white/40 font-mono flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Instant delivery • All sales final</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
