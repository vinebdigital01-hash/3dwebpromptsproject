import React from 'react';
import { sound } from '../lib/audioEngine';

interface FooterProps {
  onAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="relative bg-[#030305] border-t border-white/10 pt-16 pb-32 sm:pb-28 px-6 sm:px-10 lg:px-16 text-white/50 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/5">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="flex items-center gap-2 text-white font-bold tracking-tight text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            <span>APEX 3D VAULT</span>
          </div>
          <p className="text-white/40 max-w-sm">
            The premier prompt architecture and WebGL system for high-ticket design agencies worldwide.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/60">
          <a
            href="#catalog"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
          >
            Vault Catalog
          </a>
          <a
            href="#theater"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
          >
            3D Cinema
          </a>
          <a
            href="#calculator"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
          >
            ROI Simulator
          </a>
          <a
            href="#pricing"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
          >
            FAQ
          </a>
          <a
            href="mailto:support@vinebdigital.store"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
          <a
            href="tel:8287578025"
            onClick={() => sound.playClick()}
            className="hover:text-blue-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <span>📞 Call: +91 8287578025</span>
          </a>
          <a
            href="https://wa.me/919717466626"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <span>💬 Call/WhatsApp: +91 9717466626</span>
          </a>
          <button
            onClick={() => {
              sound.playClick();
              window.location.hash = '#portal';
            }}
            className="hover:text-emerald-400 font-mono text-[11px] transition-colors text-white/50 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>🔐 Member Login</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              if (onAdminClick) onAdminClick();
              else window.location.hash = '#admin';
            }}
            className="hover:text-blue-400 font-mono text-[11px] transition-colors text-white/35 flex items-center gap-1"
          >
            <span>🔒 Admin</span>
          </button>
        </div>
      </div>

      {/* Legal & Status Row */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
        <div>
          © {new Date().getFullYear()} APEX3D Systems Inc. All rights reserved. Built for Claude 3.7 & Cursor.
        </div>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-mono text-blue-300">WebGL Engine v4.2 • 60 FPS Locked</span>
        </div>
      </div>
    </footer>
  );
};
