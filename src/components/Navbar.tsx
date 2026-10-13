import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, ArrowUpRight } from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface NavbarProps {
  onUnlockClick: () => void;
  onLeadMagnetClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onUnlockClick, onLeadMagnetClick }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real-time active agents currently viewing ticker (fluctuates organically between 80 and 150)
  const [activeAgents, setActiveAgents] = useState(() => {
    return Math.floor(Math.random() * (128 - 104 + 1)) + 104;
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextTick = () => {
      // Human-like organic fluctuation delay (every 3.2s to 6.2s)
      const nextDelay = Math.floor(Math.random() * 3000) + 3200;
      timeoutId = setTimeout(() => {
        setActiveAgents((prev) => {
          let delta = Math.floor(Math.random() * 7) - 3; // -3, -2, -1, 0, +1, +2, +3

          // Boundary correction to keep natural social proof
          if (prev <= 88) {
            delta = Math.floor(Math.random() * 3) + 1; // +1 to +3
          } else if (prev >= 142) {
            delta = -(Math.floor(Math.random() * 3) + 1); // -3 to -1
          }

          // Strict clamping between 80 and 150
          return Math.max(80, Math.min(150, prev + delta));
        });

        scheduleNextTick();
      }, nextDelay);
    };

    scheduleNextTick();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleAudioToggle = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
  };

  const navLinks = [
    { label: '3D Cinema', href: '#theater' },
    { label: 'Client Work', href: '#transformations' },
    { label: 'Vault Catalog', href: '#catalog' },
    { label: 'ROI Calculator', href: '#calculator' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Wall of Love', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (href: string) => {
    sound.playClick();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 sm:pt-4 md:pt-5 px-2 sm:px-4 transition-all duration-300">
        <div
          className={`w-full max-w-[calc(100vw-1rem)] sm:max-w-fit flex items-center justify-between gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 ${
            isScrolled
              ? 'bg-[#0a0a10]/95 backdrop-blur-xl border-white/15 shadow-2xl shadow-black/80'
              : 'bg-black/75 backdrop-blur-md border-white/10'
          }`}
        >
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sound.playClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 sm:gap-2.5 pl-1 pr-1.5 py-1 group shrink-0"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm shadow-blue-500/30">
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white"
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-white whitespace-nowrap">
              APEX<span className="text-blue-400">3D</span>
            </span>
          </a>

          {/* Real-Time 'Active Agents Currently Viewing' Social Proof Ticker */}
          <div
            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/[0.08] hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-mono select-none transition-all shadow-sm shrink-0"
            title="Real-time active agents currently viewing prompt architecture"
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-400"></span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-white tracking-tight tabular-nums text-[10px] sm:text-xs">
                {activeAgents}
              </span>
              <span className="text-emerald-300/80 hidden xl:inline">active agents viewing</span>
              <span className="text-emerald-300/80 hidden sm:inline xl:hidden">viewing</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 mx-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                onMouseEnter={() => sound.playHover()}
                className="px-3 py-1.5 text-xs text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-all whitespace-nowrap font-sans"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Cluster: Audio Button + Lead Magnet + CTA + Mobile Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              title={isMuted ? 'Unmute Audio FX' : 'Mute Audio FX'}
              className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              )}
            </button>

            {/* Free Sample Prompt Lead Magnet */}
            <button
              onClick={() => {
                sound.playClick();
                onLeadMagnetClick();
              }}
              className="hidden md:inline-flex px-3 py-1.5 rounded-full text-xs font-mono text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all"
            >
              Free Prompt (.PDF)
            </button>

            {/* Unlock Access CTA (Bright Royal Blue & Indigo Button) */}
            <button
              onClick={() => {
                sound.playSuccess();
                onUnlockClick();
              }}
              onMouseEnter={() => sound.playHover()}
              className="group relative inline-flex items-center gap-1 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-sm overflow-hidden"
            >
              <span className="hidden sm:inline">Unlock Access</span>
              <span className="sm:hidden font-bold">Unlock</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="lg:hidden p-1.5 sm:p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl lg:hidden flex flex-col justify-center px-8 py-20 animate-role-fade-in">
          <div className="flex flex-col gap-5 text-center">
            {/* Live Active Agents Ticker Banner */}
            <div className="inline-flex items-center justify-center gap-2 py-1.5 px-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-300 mx-auto mb-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>
                <strong className="text-white tabular-nums">{activeAgents}</strong> active agents currently viewing
              </span>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="text-2xl font-display italic text-white/80 hover:text-white py-2 border-b border-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-6 space-y-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onUnlockClick();
                }}
                className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg active:scale-95"
              >
                Unlock The Vault — From ₹49
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLeadMagnetClick();
                }}
                className="w-full py-3 rounded-full text-xs font-mono text-white/70 border border-white/20"
              >
                Get Free Sample Prompt (.PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
