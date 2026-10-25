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
      '1/day prompt copies (Any prompt in 31+ flagship vault)',
      'Commercial License (Charge clients $5k–$25k)',
      'Reseller & Personal Rights included',
      'Agency Outbound Scripts & 3D Prompts PDF Guide',
      'Three.js & R3F Starter Boilerplates',
      'Instant copy-paste syntax for Claude 3.7 & Cursor',
      'Provisional Instant Access via UPI UTR'
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
