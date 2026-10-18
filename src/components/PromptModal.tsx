import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Terminal, Layers, Cpu, ArrowRight, Copy } from 'lucide-react';
import { VaultItem } from '../data/vaultCatalog';
import { sound } from '../lib/audioEngine';
import { CopyPromptLeadModal } from './CopyPromptLeadModal';

interface PromptModalProps {
  item: VaultItem | null;
  onClose: () => void;
  onUnlockClick: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ item, onClose, onUnlockClick }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!item) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  if (!item || !mounted) return null;

  const handleUnlock = () => {
    sound.playSweep();
    onClose();
    onUnlockClick();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Click outside backdrop with hardware-accelerated blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Plate - Raycast/Linear-grade Obsidian Inspector Surface */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#08080c] border border-white/10 text-white z-10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Subtle Top Ambient Refraction Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

        {/* IDE Window Chrome Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-white/[0.015] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">
              apex3d://vault/{item.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}/{item.id || 'prompt'}.glsl
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Metadata Section */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-white/5 shrink-0">
          <div className="flex flex-wrap items-center gap-2 mb-2.5 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {item.category}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              Contract Value: <strong className="text-amber-400 font-bold">{item.clientValue}</strong>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              {item.tokens} Tokens
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {item.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans leading-relaxed">
            {item.subtitle}
          </p>
        </div>

        {/* Content Body with smooth scrolling */}
        <div className="px-6 sm:px-8 py-6 space-y-6 overflow-y-auto">
          {/* Key Deliverables & Features */}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-3">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>ARCHITECTURAL SPECIFICATION & SHADERS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.keyFeatures.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80 font-sans"
                >
                  <span className="text-blue-400 font-mono text-[11px] shrink-0 font-medium">0{i + 1}.</span>
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tested AI Models */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Calibrated Runtime:</span>
            </span>
            {item.testedModels.map((m) => (
              <span
                key={m}
                className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]"
              >
                {m}
              </span>
            ))}
          </div>

          {/* Teaser Prompt with Gated Lock Scrim */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>MASTER ONE-SHOT PROMPT SPECIFICATION</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsLeadModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono transition-all active:scale-[0.99]"
                >
                  <Copy className="w-3 h-3 text-blue-400" />
                  <span>Copy Prompt Syntax</span>
                </button>
                <span className="text-[11px] font-mono text-zinc-400">Encrypted</span>
              </div>
            </div>

            <div className="relative bg-[#050508] border border-zinc-800 rounded-xl p-4 sm:p-5 font-mono text-xs text-zinc-400 leading-relaxed overflow-hidden max-h-[220px]">
              <pre className="whitespace-pre-wrap select-none opacity-40 font-mono">
                {item.promptArchitecture.slice(0, 140)}
                {'\n\n................................................................................'}
                {'\n[🔒 ARCHITECTURE LOCKED: 2,500+ TOKENS OF VERIFIED PRODUCTION CODE]'}
                {'\n................................................................................'}
              </pre>

              {/* Glassmorphic Gated Shield */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/85 to-transparent flex flex-col items-center justify-center p-6 text-center">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-2 shadow-lg">
                  <Lock className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Complete Architecture Reserved For Vault Licensees
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm font-sans mb-3.5 leading-relaxed">
                  Gain one-click access to all 500+ production prompts with verified Claude 3.7 & Cursor calibration and commercial rights.
                </p>
                <button
                  onClick={handleUnlock}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-[0_4px_16px_rgba(37,99,235,0.35)] active:scale-[0.99]"
                >
                  <span>Unlock Vault Pass — Starting @ ₹49</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 sm:px-8 py-4 border-t border-white/10 bg-white/[0.015] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="text-[11px] text-zinc-500 font-mono">
            Access included across 1-Day Sprint (₹49), 1-Mo (₹299), 6-Mo (₹699) & Lifetime VIP
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              Close Inspector
            </button>
            <button
              onClick={handleUnlock}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.99]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Master Prompt ({item.clientValue})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copy Prompt Syntax Lead Capture Verification Modal */}
      <CopyPromptLeadModal
        isOpen={isLeadModalOpen}
        promptSnippet={item.promptArchitecture}
        clientTitle={item.title}
        onClose={() => setIsLeadModalOpen(false)}
        onSuccessRedirect={() => {
          setIsLeadModalOpen(false);
          onClose();
          onUnlockClick();
        }}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};
