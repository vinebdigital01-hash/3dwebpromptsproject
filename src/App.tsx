import React, { useState } from 'react';
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

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isLeadMagnetOpen, setIsLeadMagnetOpen] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(TIERS[3]); // Default to Lifetime VIP (₹2,999)
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('INR');

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
      <Footer />

      {/* Sticky Bottom Urgency Funnel Bar */}
      <StickyFunnelBar onUnlockClick={handleScrollToPricing} />

      {/* Verified Live Agency Activity Notifications */}
      <LiveSalesToasts />

      {/* Free Sample Lead Capture Magnet Modal */}
      <LeadMagnetModal
        isOpen={isLeadMagnetOpen}
        onClose={() => setIsLeadMagnetOpen(false)}
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
