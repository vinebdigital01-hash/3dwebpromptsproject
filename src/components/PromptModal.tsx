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
      {/* Click outside backdrop with lightweight, hardware-accelerated blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Plate - Centered, performant GPU transform */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#090914] border border-white/15 p-6 sm:p-8 text-white z-10 shadow-2xl shadow-black max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/10 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {item.category}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                Client Invoice Value: {item.clientValue}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/90">
                {item.tokens} Tokens
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white">
              {item.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1 font-sans">
              {item.subtitle}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with smooth scrolling */}
        <div className="py-6 space-y-6 overflow-y-auto pr-2">
          {/* Key Deliverables & Features */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Production Architecture & Shaders Included</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.keyFeatures.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-white/80 bg-white/[0.02] p-3 rounded-xl border border-white/5 font-sans"
                >
                  <span className="text-blue-400 font-mono">0{i + 1}.</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tested AI Models */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/40 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Calibrated For:</span>
            </span>
            {item.testedModels.map((m) => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-white/90"
              >
                {m}
              </span>
            ))}
          </div>

          {/* Teaser Prompt with Gated Lock Scrim */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Master One-Shot Prompt System</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsLeadModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-mono transition-all active:scale-95 shadow-sm"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Prompt Syntax</span>
                </button>
                <span className="text-[11px] font-mono text-amber-300">🔒 Architecture Encrypted</span>
              </div>
            </div>

            <div className="relative bg-[#050508] border border-white/10 rounded-2xl p-4 sm:p-5 font-mono text-xs text-white/85 leading-relaxed overflow-hidden max-h-[220px]">
              <pre className="whitespace-pre-wrap select-none opacity-50">
                {item.promptArchitecture.slice(0, 320)}
                {'\n\n[🔒 2,500+ TOKENS OF VERIFIED PRODUCTION ARCHITECTURE LOCKED...]'}
              </pre>

              {/* Glassmorphic Gated Shield */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-2 shadow-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Full Prompt Architecture Reserved For Vault Members
                </h4>
                <p className="text-xs text-white/50 max-w-sm font-sans mb-3">
                  Unlock all 500+ copy-paste production prompts, weekly updates, and commercial license.
                </p>
                <button
                  onClick={handleUnlock}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>Unlock Prompt — View Pricing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-white/40 font-mono">
            Included in 1-Day Sprint (₹49), 1-Mo (₹299), 6-Mo (₹699) & Lifetime VIP (₹2,999)
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Close Preview
            </button>
            <button
              onClick={handleUnlock}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Master Prompt ({item.clientValue} Value)</span>
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
