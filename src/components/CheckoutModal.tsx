import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Lock, CheckCircle2, Download, Sparkles, ArrowRight, Award, Zap, Database } from 'lucide-react';
import { PricingTier, Currency } from './PricingSection';
import { sound } from '../lib/audioEngine';

interface CheckoutModalProps {
  isOpen: boolean;
  tier: PricingTier | null;
  currency: Currency;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  tier,
  currency,
  onClose,
}) => {
  const [includeBump, setIncludeBump] = useState<boolean>(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || !tier) return null;

  // Bump prices aligned with the new price scale
  const bumpPrice = currency === 'INR' ? 99 : currency === 'USD' ? 2 : 2;
  const basePrice = currency === 'INR' ? tier.priceINR : currency === 'USD' ? tier.priceUSD : tier.priceEUR;
  const total = basePrice + (includeBump ? bumpPrice : 0);

  const formatCurrency = (amt: number) => {
    if (currency === 'INR') return `₹${amt.toLocaleString('en-IN')}`;
    if (currency === 'USD') return `$${amt}`;
    return `€${amt}`;
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSubmitted(true);
      sound.playSuccess();

      // Subtle 'Success Confetti' utilizing gold and sapphire hues for premium brand aesthetic
      try {
        const goldAndSapphireHues = [
          '#D4AF37', // Imperial Gold
          '#F59E0B', // Amber Gold
          '#FDE047', // Champagne Shimmer
          '#1E3A8A', // Deep Royal Sapphire
          '#2563EB', // Vivid Sapphire Blue
          '#3B82F6', // Cobalt Sapphire
          '#60A5FA', // Azure Glow
          '#E0E7FF', // Platinum Sparkle
        ];

        // Primary elegant burst
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.62 },
          colors: goldAndSapphireHues,
          gravity: 0.85,
          scalar: 0.9,
          ticks: 240,
          disableForReducedMotion: true,
        });

        // Delicate lateral accent cannons for cinematic depth
        setTimeout(() => {
          confetti({
            particleCount: 35,
            angle: 60,
            spread: 55,
            origin: { x: 0.15, y: 0.65 },
            colors: goldAndSapphireHues,
            gravity: 0.9,
            scalar: 0.8,
            ticks: 200,
            disableForReducedMotion: true,
          });
          confetti({
            particleCount: 35,
            angle: 120,
            spread: 55,
            origin: { x: 0.85, y: 0.65 },
            colors: goldAndSapphireHues,
            gravity: 0.9,
            scalar: 0.8,
            ticks: 200,
            disableForReducedMotion: true,
          });
        }, 180);
      } catch (err) {
        console.debug('Confetti suppressed:', err);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl animate-role-fade-in overflow-y-auto select-none">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl glass-panel rounded-3xl bg-[#0a0a14] border border-white/20 p-6 sm:p-8 text-white z-10 shadow-2xl shadow-black my-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-300 mb-1">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>256-BIT ENCRYPTED CHECKOUT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Complete Your <span className="accent-text-gradient font-display italic font-normal">{tier.name}</span>
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Instant access credentials and license certificate provisioned immediately.
              </p>
            </div>

            {/* Selected Plan Features & Licenses Summary Badge */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Selected Plan:</span>
                <span className="text-white font-bold">{tier.name} ({tier.durationLabel})</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Copy Allowance:</span>
                <span className="text-blue-300 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {tier.copiesPerDay}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Vault Database:</span>
                <span className="text-purple-300 font-semibold flex items-center gap-1">
                  <Database className="w-3 h-3 text-purple-400" />
                  Full 500+ Prompt Vault Access
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Updates:</span>
                <span className="text-emerald-400">
                  {tier.hasLifetimeUpdates ? 'Lifetime Updates Included' : '1-Day Sprint Calibration'}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Personal + Commercial + Reseller License Included</span>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Form Inputs */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Work / Agency Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@studio.design"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Studio or Brand Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Mercer Creative Lab"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              {/* Order Bump Checkbox */}
              <div
                onClick={() => {
                  sound.playClick();
                  setIncludeBump(!includeBump);
                }}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  includeBump
                    ? 'bg-white/10 border-white/40 shadow-md'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={includeBump}
                    onChange={(e) => {
                      e.stopPropagation();
                      setIncludeBump(e.target.checked);
                    }}
                    className="mt-1 w-4 h-4 rounded accent-white cursor-pointer"
                  />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>ONE-TIME UPGRADE: 500+ Spline & Three.js Shader Presets</span>
                    </span>
                    <p className="text-white/70 mt-1">
                      YES! Add the 500+ Spline, WebGL & Three.js 3D Shaders & Materials Pack for just{' '}
                      <strong className="text-white font-bold">{formatCurrency(bumpPrice)}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>{tier.name} ({tier.durationLabel}):</span>
                  <span className="font-mono text-white">{formatCurrency(basePrice)}</span>
                </div>
                {includeBump && (
                  <div className="flex justify-between text-white/60">
                    <span>500+ Shader Pack (Order Upgrade):</span>
                    <span className="font-mono text-white font-bold">+{formatCurrency(bumpPrice)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>Total Due Today:</span>
                  <span className="font-mono text-lg text-amber-400 font-bold">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Securing Access...</span>
                ) : (
                  <>
                    <span>Confirm Order ({formatCurrency(total)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Digital Asset Terms Notice */}
              <div className="text-[11px] font-mono text-center text-white/60 bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3">
                Digital product with immediate IP access • All sales strictly final (non-refundable)
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] font-mono text-white/40">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 100% Secure Checkout
                </span>
                <span>•</span>
                <span>Instant License Key</span>
                <span>•</span>
                <span className="text-white/60">Digital Product (All Sales Final)</span>
              </div>
            </form>
          </div>
        ) : (
          /* Instant Access Fulfilled View */
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-blue-300 tracking-widest uppercase">
                PAYMENT CONFIRMED • ACCESS UNLOCKED
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Welcome to the APEX3D Vault!
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-sm mx-auto">
                Your license has been registered to <strong>{email || 'your email'}</strong>. Your download links and credentials are live:
              </p>
            </div>

            {/* Generated License Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-white/50">
                <span>LICENSE KEY:</span>
                <span className="text-amber-400 font-bold">APX-LIC-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>SELECTED PLAN:</span>
                <span className="text-white font-semibold">{tier.name}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>DATABASE ACCESS:</span>
                <span className="text-blue-300 font-bold">500+ MASTER PROMPTS (UNLOCKED)</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>PROMPT COPIES:</span>
                <span className="text-amber-400 font-bold">{tier.copiesPerDay}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>PERSONAL LICENSE:</span>
                <span className="text-emerald-400">GRANTED & ACTIVE</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>COMMERCIAL LICENSE:</span>
                <span className="text-emerald-400">UNRESTRICTED (AGENCY)</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>RESELLER LICENSE:</span>
                <span className="text-emerald-400">INCLUDED & AUTHORIZED</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  sound.playSuccess();
                  window.open('#catalog', '_self');
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Open Member Vault (500+ Prompts Unlocked)</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full py-3 rounded-full text-xs font-medium text-white/60 hover:text-white transition-colors"
              >
                Return to Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
