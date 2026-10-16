import React, { useState, useEffect } from 'react';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StudioTheater } from './components/StudioTheater';
import { ClientTransformations } from './components/ClientTransformations';
import { VaultEditorialLedger } from './components/VaultEditorialLedger';
import { CssSphereGallery } from './components/CssSphereGallery';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { ParallaxExplorations } from './components/ParallaxExplorations';
import { RoiCalculator } from './components/RoiCalculator';
import { PricingSection, PricingTier, Currency, TIERS } from './components/PricingSection';
import { CheckoutModal } from './components/CheckoutModal';
import { LeadMagnetModal } from './components/LeadMagnetModal';
import { StickyFunnelBar } from './components/StickyFunnelBar';
import { LiveSalesToasts } from './components/LiveSalesToasts';
import { SocialProofFaq } from './components/SocialProofFaq';
import { Footer } from './components/Footer';
import { CustomMagneticCursor } from './components/CustomMagneticCursor';
import { AgencyMarquee } from './components/AgencyMarquee';
import { initAntiScraperShield } from './lib/security';
import { AdminConsole } from './components/AdminConsole';
import { ClientPortal } from './components/ClientPortal';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isLeadMagnetOpen, setIsLeadMagnetOpen] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(TIERS[3]); // Default to Lifetime VIP (₹2,999)
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('INR');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return window.location.hash === '#admin' || window.location.pathname === '/admin';
  });
  const [isPortalMode, setIsPortalMode] = useState<boolean>(() => {
    return window.location.hash === '#portal' || window.location.pathname === '/portal';
  });

  useEffect(() => {
    // Prevent browser auto-scroll restoration on refresh so page always starts cleanly at the top
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    initAntiScraperShield();

    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === '#admin' || window.location.pathname === '/admin');
      setIsPortalMode(window.location.hash === '#portal' || window.location.pathname === '/portal');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Automatic popup in 12 seconds (10-15s window) if user is just browsing and has no active intent to checkout yet
  useEffect(() => {
    if (isCheckoutOpen || isAdminMode || isPortalMode) return;

    // Check if visitor has already seen or closed the automatic lead magnet in this session
    const alreadyTriggered = sessionStorage.getItem('vineb_lead_magnet_auto_shown');
    if (alreadyTriggered) return;

    const timer = setTimeout(() => {
      if (!isCheckoutOpen && !isAdminMode && !isPortalMode) {
        setIsLeadMagnetOpen(true);
        sessionStorage.setItem('vineb_lead_magnet_auto_shown', 'true');
      }
    }, 12000); // 12 seconds (within 10-15s range)

    return () => clearTimeout(timer);
  }, [isCheckoutOpen, isAdminMode, isPortalMode]);

  const handleOpenCheckout = (tier?: PricingTier, currency?: Currency) => {
    if (tier) setSelectedTier(tier);
    if (currency) setCurrentCurrency(currency);
    setIsCheckoutOpen(true);
  };

  const handleScrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleScrollToTheater = () => {
    const el = document.getElementById('theater');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      handleScrollToPricing();
    }
  };

  if (isAdminMode) {
    return (
      <AdminConsole
        onBackToSite={() => {
          window.location.hash = '';
          setIsAdminMode(false);
        }}
      />
    );
  }

  if (isPortalMode) {
    return (
      <>
        <ClientPortal
          onBackToSite={() => {
            window.location.hash = '';
            setIsPortalMode(false);
          }}
          onUpgradeClick={(tierId) => {
            const targetTier =
              (tierId && TIERS.find((t) => t.id === tierId)) ||
              TIERS.find((t) => t.id === 'lifetime') ||
              TIERS[3];
            setSelectedTier(targetTier);
            setIsCheckoutOpen(true);
          }}
        />
        <CheckoutModal
          isOpen={isCheckoutOpen}
          tier={selectedTier}
          currency={currentCurrency}
          onClose={() => setIsCheckoutOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-[#f4f4f7] selection:bg-blue-600/40 selection:text-white overflow-x-hidden">
      {/* Non-Neon Custom Magnetic Cursor */}
      <CustomMagneticCursor />

      {/* 000 -> 100 Cinematic Preloader */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      {/* Floating Glass Pill Navbar */}
      <Navbar
        onUnlockClick={handleScrollToPricing}
        onLeadMagnetClick={() => setIsLeadMagnetOpen(true)}
      />

      {/* 1. Cyberpunk Dual-Layer Cursor Spotlight Hero */}
      <Hero
        onUnlockClick={handleScrollToPricing}
        onTerminalClick={handleScrollToTheater}
      />

      {/* 1.5 'Trusted by 2,400+ Agencies' Platform Authority Marquee (Webflow, Framer, Spline, Three.js) */}
      <AgencyMarquee />

      {/* 2. Panoramic Cinema Studio Theater (Replaces Generic Cards) */}
      <div id="theater">
        <StudioTheater onUnlockClick={handleScrollToPricing} />
      </div>

      {/* 2.5 Real-World Client Transformations (Apple, Monopo, Wise, Resend, LaunchDarkly, Auros, Dala) */}
      <ClientTransformations onUnlockClick={handleScrollToPricing} />

      {/* 3. Luxury Editorial Deliverable Ledger (No Cluttered Cards) */}
      <VaultEditorialLedger onUnlockClick={handleScrollToPricing} />

      {/* 4. Pure CSS 3D Rotating Spatial Vault Carousel (Zero Three.js) */}
      <CssSphereGallery onUnlockClick={handleScrollToPricing} />

      {/* 5. Strategic Advantage Comparison Matrix */}
      <ComparisonMatrix />

      {/* 6. Awwwards Parallax Explorations & Infinite Marquee */}
      <ParallaxExplorations onUnlockClick={handleScrollToPricing} />

      {/* 7. Interactive Agency ROI Profit Calculator */}
      <RoiCalculator onUnlockClick={handleScrollToPricing} />

      {/* 8. High-Converting Urgency Pricing (USD/EUR/INR + Flash Countdown) */}
      <PricingSection onSelectTier={handleOpenCheckout} />

      {/* 9. Social Proof Wall of Love, 30-Day Guarantee & Interactive FAQ */}
      <SocialProofFaq onUnlockClick={handleScrollToPricing} />

      {/* 10. Cinematic Obsidian Footer */}
      <Footer onAdminClick={() => { window.location.hash = '#admin'; setIsAdminMode(true); }} />

      {/* Sticky Bottom Urgency Funnel Bar */}
      <StickyFunnelBar onUnlockClick={handleScrollToPricing} />

      {/* Verified Live Agency Activity Notifications */}
      <LiveSalesToasts />

      {/* Free Sample Lead Capture Magnet Modal */}
      <LeadMagnetModal
        isOpen={isLeadMagnetOpen}
        onClose={() => setIsLeadMagnetOpen(false)}
        onSuccessRedirect={handleScrollToPricing}
      />

      {/* 1-Click Order Bump Checkout Modal ($37 Bump + Instant Fulfillment) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        tier={selectedTier}
        currency={currentCurrency}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
