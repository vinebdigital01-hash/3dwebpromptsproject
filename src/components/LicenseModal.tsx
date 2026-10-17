import React from 'react';
import { X, Printer, Award, Shield, CheckCircle2 } from 'lucide-react';
import { LeadOrder } from '../lib/leadTracker';
import { sound } from '../lib/audioEngine';

interface LicenseModalProps {
  order: LeadOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  // Strict: Licenses are issued exclusively for paid passholders
  if ((order.amountINR || 0) <= 0 || !order.licenseKey) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-role-fade-in">
        <div className="relative w-full max-w-md bg-[#09090e] border border-amber-500/30 rounded-2xl p-6 text-white text-center shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No Commercial License for Free Accounts</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-5">
            Commercial Deployment License Certificates granting worldwide client delivery rights are issued exclusively to verified paid passholders (₹49+).
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const licenseKey = order.licenseKey;
  const issueDate = order.approvedAt
    ? new Date(order.approvedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const validityText = order.expiresAt
    ? `Valid until ${new Date(order.expiresAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`
    : 'Perpetual / Lifetime Commercial License';

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-role-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090912] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-[#0d0d18] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 truncate max-w-[140px] xs:max-w-[220px] sm:max-w-none">
              License // {licenseKey}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span><span className="hidden xs:inline">Print </span>Certificate</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Guilloche Aesthetic) */}
        <div id="printable-commercial-license" className="p-4 sm:p-8 lg:p-10 relative">
          {/* Subtle Ambient Background Watermark */}
          <div className="absolute inset-4 rounded-xl border-2 border-dashed border-amber-500/20 pointer-events-none" />

          <div className="relative z-10 text-center space-y-4">
            
            {/* Seal Icon */}
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-600/30 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>

            <div>
              <div className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase">
                APEX3D ARCHITECTURAL COMPUTING LAB
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide mt-1">
                COMMERCIAL LICENSE CERTIFICATE
              </h1>
              <p className="text-[11px] text-white/50 mt-1 font-mono">
                Official Grant of Global Commercial Production & Deployment Rights
              </p>
            </div>

            {/* Licensee Notice */}
            <div className="py-4 px-6 rounded-xl bg-white/[0.02] border border-white/5 max-w-lg mx-auto">
              <div className="text-[10px] uppercase font-mono text-white/40 mb-1">
                This document certifies that
              </div>
              <div className="text-base font-bold text-white tracking-tight">
                {order.name || 'Commercial Licensee'}
              </div>
              <div className="text-xs text-white/60 font-mono mt-0.5">{order.email}</div>
              <div className="text-[11px] text-white/70 font-sans mt-2">
                is granted a registered commercial license for the{' '}
                <strong className="text-amber-300 font-semibold">{order.tierName}</strong>.
              </div>
            </div>

            {/* Terms of Grant */}
            <div className="text-left max-w-lg mx-auto p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/70 space-y-2">
              <div className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authorized Commercial Scope:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-white/60 text-[10px] font-mono leading-relaxed">
                <li>Deploy generated 3D WebGL components for unlimited commercial client projects.</li>
                <li>Bundle compiled Three.js & GLSL shaders into proprietary commercial web applications.</li>
                <li>Retain 100% agency revenue and client SOW billings without royalties or revenue splits.</li>
                <li>Access to official calibrated Claude 3.7 & Cursor Agent prompt blueprints.</li>
              </ul>
            </div>

            {/* Meta Footer */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-left font-mono text-[10px] text-white/50 max-w-lg mx-auto border-t border-white/10">
              <div>
                <span className="text-white/30 block">LICENSE ID</span>
                <span className="text-white/90 font-bold">{licenseKey}</span>
              </div>
              <div>
                <span className="text-white/30 block">ISSUE DATE</span>
                <span className="text-white/90">{issueDate}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-white/30 block">VALIDITY</span>
                <span className="text-amber-300 font-semibold">{validityText}</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-white/30 pt-2">
              Cryptographically signed by APEX3D Systems · Verification at vinebdigital.store/#portal
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
