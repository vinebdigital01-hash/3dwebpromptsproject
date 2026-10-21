import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface NavbarProps {
  onUnlockClick: () => void;
  onLeadMagnetClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onUnlockClick, onLeadMagnetClick }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAudioToggle = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
  };

  // Top 3 primary links shown on iPad landscape (1024px) & desktop
  const baseLinks = [
    { label: '3D Cinema', href: '#theater' },
    { label: 'Client Work', href: '#transformations' },
    { label: 'Vault', href: '#catalog' },
  ];

  // Secondary links: shown in main bar on desktop (xl >= 1280px), moved to "More" on iPad landscape (1024-1279px)
  const secondaryLinks = [
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  // Extended links always in "More"
  const extendedLinks = [
    { label: 'ROI Calculator', href: '#calculator' },
    { label: 'Wall of Love', href: '#testimonials' },
  ];

  const allMobileLinks = [...baseLinks, ...secondaryLinks, ...extendedLinks];

  const handleLinkClick = (href: string) => {
    try {
      sound.playClick();
    } catch {}
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 
        Rule 0: One container max-width 1280px, margin: auto, padding-inline: clamp(20px, 4vw, 48px).
        Position fixed, top 16px, height 64px (56px mobile), same container width.
        Background: dark see-through (rgba(10,12,20,0.6)) + blur(16px) + 1px border at 8% white.
        On Scroll: becomes solid rgba(10,12,20,0.95) + blur(24px) so content never shows through.
      */}
      <header className="fixed top-4 inset-x-0 mx-auto z-50 w-full max-w-[1280px] px-[clamp(20px,4vw,48px)] pointer-events-none pt-[env(safe-area-inset-top,0px)]">
        <nav
          className={`pointer-events-auto w-full h-14 sm:h-16 rounded-full border border-white/[0.08] px-3 sm:px-5 lg:px-6 flex items-center justify-between transition-all duration-300 ${
            isScrolled
              ? 'bg-[#0a0c14]/95 backdrop-blur-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.85)] border-white/15'
              : 'bg-[#0a0c14]/60 backdrop-blur-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          }`}
          aria-label="Main Navigation"
        >
          {/* LEFT: Logo + "APEX3D" (min-h-[44px] tap target, lines up flush with left padding) */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              try { sound.playClick(); } catch {}
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group shrink-0 min-h-[44px] min-w-[44px] py-1"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm shadow-blue-500/30">
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
              </svg>
            </div>
            <span className="font-heading font-semibold text-[15px] tracking-tight text-white whitespace-nowrap">
              APEX<span className="text-blue-400">3D</span>
            </span>
          </a>

          {/* CENTER: Desktop & iPad Landscape Links (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {/* 3 links on iPad landscape (1024-1279px), all 5 on desktop (>=1280px) */}
            {baseLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                onMouseEnter={() => {
                  try { sound.playHover(); } catch {}
                }}
                className="text-[14px] font-body font-medium text-white/70 hover:text-white transition-colors duration-200 py-1 relative group whitespace-nowrap"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-400 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </a>
            ))}

            {/* Pricing & FAQ: In bar on desktop (xl), moved to More on lg */}
            {secondaryLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                onMouseEnter={() => {
                  try { sound.playHover(); } catch {}
                }}
                className="hidden xl:inline-block text-[14px] font-body font-medium text-white/70 hover:text-white transition-colors duration-200 py-1 relative group whitespace-nowrap"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-400 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </a>
            ))}

            {/* "More" Dropdown */}
            <div
              ref={moreRef}
              className="relative"
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="text-[14px] font-body font-medium text-white/70 hover:text-white transition-colors duration-200 py-1 flex items-center gap-1 whitespace-nowrap cursor-pointer relative group min-h-[44px]"
                aria-expanded={isMoreOpen}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMoreOpen ? 'rotate-180 text-white' : 'text-white/60'
                  }`}
                />
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-400 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </button>

              {/* Dropdown Card */}
              {isMoreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-44 rounded-2xl bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-1.5 flex flex-col gap-0.5 animate-role-fade-in">
                    {/* On lg screens (iPad landscape), include Pricing & FAQ here */}
                    <div className="xl:hidden flex flex-col gap-0.5 border-b border-white/10 pb-1 mb-1">
                      {secondaryLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(link.href);
                          }}
                          className="px-3 py-2 text-[13px] font-body font-medium text-white/75 hover:text-white hover:bg-white/10 rounded-xl transition-all whitespace-nowrap text-left"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>

                    {extendedLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(link.href);
                        }}
                        className="px-3 py-2 text-[13px] font-body font-medium text-white/75 hover:text-white hover:bg-white/10 rounded-xl transition-all whitespace-nowrap text-left"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Action Buttons (Single Line Guaranteed, min 44px tap targets) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap flex-nowrap">
            {/* Sound Icon Button (Desktop >= 1024px) */}
            <button
              type="button"
              onClick={handleAudioToggle}
              title={isMuted ? 'Unmute Audio FX' : 'Mute Audio FX'}
              className="hidden lg:flex w-9 h-9 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] rounded-full items-center justify-center text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Toggle sound fx"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/40" />
              ) : (
                <Volume2 className="w-4 h-4 text-blue-400" />
              )}
            </button>

            {/* Quiet Outline "Free PDF" Button (Desktop >= 1024px) */}
            <button
              type="button"
              onClick={() => {
                try { sound.playClick(); } catch {}
                onLeadMagnetClick();
              }}
              onMouseEnter={() => {
                try { sound.playHover(); } catch {}
              }}
              className="hidden lg:flex h-9 sm:h-10 min-h-[44px] px-3.5 sm:px-4 rounded-full text-[13px] font-body font-medium text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 transition-all cursor-pointer whitespace-nowrap items-center shrink-0"
            >
              Free PDF
            </button>

            {/* Main CTA: "Unlock ₹49 →" (Always visible, responsive sizing) */}
            <button
              type="button"
              onClick={() => {
                try { sound.playSuccess(); } catch {}
                onUnlockClick();
              }}
              onMouseEnter={() => {
                try { sound.playHover(); } catch {}
              }}
              className="h-9 sm:h-10 min-h-[44px] px-3 sm:px-4.5 rounded-full text-[12px] sm:text-[13px] font-body font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_18px_rgba(37,99,235,0.4)] transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0"
            >
              <span>Unlock ₹49</span>
              <span className="text-white/80">→</span>
            </button>

            {/* Mobile & Tablet (< 1024px) Menu Hamburger */}
            <button
              type="button"
              onClick={() => {
                try { sound.playClick(); } catch {}
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="lg:hidden w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer shrink-0 ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* FULL-SCREEN SLIDE-IN PANEL FOR MOBILE & TABLETS (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050508]/96 backdrop-blur-2xl lg:hidden flex flex-col justify-between p-6 sm:p-8 animate-role-fade-in pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
          {/* Header inside slide-in */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/40 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                >
                  <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
                </svg>
              </div>
              <span className="font-heading font-semibold text-lg text-white">
                APEX<span className="text-blue-400">3D</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound toggle in mobile drawer */}
              <button
                type="button"
                onClick={handleAudioToggle}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 bg-white/5 border border-white/10 min-w-[44px] min-h-[44px]"
                aria-label="Toggle sound"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white/40" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/5 border border-white/10 min-w-[44px] min-h-[44px]"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Links list */}
          <div className="flex flex-col gap-2 my-auto py-6 overflow-y-auto">
            {allMobileLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="text-xl sm:text-2xl font-heading font-semibold text-white/80 hover:text-white py-2.5 border-b border-white/5 transition-colors flex items-center justify-between min-h-[44px]"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
              </a>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onUnlockClick();
              }}
              className="w-full h-13 min-h-[48px] rounded-full font-body font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Vault · ₹49</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLeadMagnetClick();
              }}
              className="w-full h-12 min-h-[44px] rounded-full font-body font-medium text-sm text-white/80 bg-white/[0.04] border border-white/15 transition-all flex items-center justify-center"
            >
              Free PDF (30+ Prompts)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
