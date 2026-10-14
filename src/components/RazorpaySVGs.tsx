import React from 'react';

/**
 * Authentic Razorpay slanted razor logo symbol
 */
export const RazorpayLogo: React.FC<{ className?: string }> = ({ className = 'h-4' }) => (
  <svg viewBox="0 0 112 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Official Razorpay slanted razor icon */}
    <path
      d="M19.46 0L0 28H10.13L24.84 6.83L19.46 0Z"
      fill="#0c2340"
      className="dark:fill-white"
    />
    <path
      d="M27.81 0L12.9 21.43L18.28 28H28.41L43.27 6.83L37.89 0H27.81Z"
      fill="#0b5cff"
    />
    {/* Razorpay Wordmark */}
    <text
      x="46"
      y="20"
      fill="currentColor"
      fontFamily="Inter, -apple-system, sans-serif"
      fontWeight="700"
      fontSize="16"
      letterSpacing="-0.5px"
    >
      Razorpay
    </text>
  </svg>
);

/**
 * Screenshot 1: Isometric shopping bags with % starburst discount tag & gift box
 */
export const RazorpayBagsIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e1e24" />
        <stop offset="100%" stopColor="#0a0a0c" />
      </linearGradient>
      <linearGradient id="bagGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E575" />
        <stop offset="100%" stopColor="#00B050" />
      </linearGradient>
      <linearGradient id="bagBlackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#25252b" />
        <stop offset="100%" stopColor="#131317" />
      </linearGradient>
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
      </filter>
    </defs>

    {/* Angled Perspective Dark Floor */}
    <path d="M0 60 L320 20 L320 180 L0 180 Z" fill="url(#groundGrad)" />

    {/* Shadows */}
    <ellipse cx="140" cy="145" rx="55" ry="12" fill="#050507" opacity="0.6" />
    <ellipse cx="225" cy="138" rx="40" ry="10" fill="#050507" opacity="0.5" />
    <ellipse cx="80" cy="150" rx="35" ry="9" fill="#050507" opacity="0.4" />

    {/* Left Bag Handles */}
    <path
      d="M75 90 C 75 70, 95 70, 95 90"
      stroke="#888899"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M85 88 C 85 72, 105 72, 105 88"
      stroke="#ffffff"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />

    {/* Left Dark Shopping Bag (Isometric) */}
    <g filter="url(#dropShadow)">
      {/* Front Face */}
      <polygon points="65,95 110,85 110,150 65,155" fill="url(#bagBlackGrad)" stroke="#383842" strokeWidth="1" />
      {/* Side Face */}
      <polygon points="110,85 130,78 130,142 110,150" fill="#18181e" stroke="#383842" strokeWidth="1" />
      {/* Top Fold */}
      <polygon points="65,95 85,88 130,78 110,85" fill="#30303a" />
      {/* Green Tag on Front Face */}
      <polygon points="80,105 92,102 96,118 84,121" fill="#00E575" />
      <circle cx="86" cy="107" r="1.5" fill="#131317" />
    </g>

    {/* Center Prominent Green Shopping Bag */}
    <g filter="url(#dropShadow)">
      {/* Front Face */}
      <polygon points="120,70 175,58 175,135 120,145" fill="url(#bagGreenGrad)" />
      {/* Side Face (Darker Green) */}
      <polygon points="175,58 200,52 200,125 175,135" fill="#008f42" />
      {/* Top Opening */}
      <polygon points="120,70 145,64 200,52 175,58" fill="#00C460" />

      {/* Handles */}
      <path
        d="M135 65 C 135 45, 160 45, 160 60"
        stroke="#121216"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M148 63 C 148 48, 172 48, 172 58"
        stroke="#25252b"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
    </g>

    {/* Right Gift Box */}
    <g filter="url(#dropShadow)">
      {/* Front Face */}
      <polygon points="200,105 240,95 240,140 200,148" fill="#202026" stroke="#33333d" strokeWidth="1" />
      {/* Side Face */}
      <polygon points="240,95 270,88 270,132 240,140" fill="#141419" stroke="#33333d" strokeWidth="1" />
      {/* Top Face */}
      <polygon points="200,105 230,98 270,88 240,95" fill="#30303a" />

      {/* Green Ribbon (Vertical) */}
      <polygon points="218,101 224,99 224,144 218,146" fill="#00E575" />
      <polygon points="248,93 254,92 254,136 248,138" fill="#00B050" />
      <polygon points="213,102 219,101 259,91 253,92" fill="#00E575" />

      {/* Ribbon Bow on top */}
      <ellipse cx="233" cy="95" rx="5" ry="3" fill="#00E575" transform="rotate(-15 233 95)" />
      <ellipse cx="240" cy="94" rx="5" ry="3" fill="#00C460" transform="rotate(20 240 94)" />
    </g>

    {/* Floating Green 8-Point Starburst with % Discount Tag */}
    <g filter="url(#dropShadow)">
      <path
        d="M 215 50 
           L 220 54 L 227 52 L 227 59 L 234 62 L 230 68 L 235 73 L 228 76 
           L 227 83 L 220 81 L 215 86 L 211 80 L 204 81 L 204 74 L 198 70 
           L 202 65 L 198 59 L 205 57 L 206 50 L 212 53 Z"
        fill="#00E575"
        stroke="#00B050"
        strokeWidth="1.5"
      />
      {/* Percent symbol */}
      <text
        x="216"
        y="72"
        fill="#052912"
        fontFamily="Inter, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="15"
        textAnchor="middle"
      >
        %
      </text>
    </g>
  </svg>
);

/**
 * Screenshot 2: Open Door with EXIT sign and footsteps
 */
export const ExitDoorIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="doorFrameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#71717a" />
        <stop offset="100%" stopColor="#3f3f46" />
      </linearGradient>
      <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f4f4f5" />
        <stop offset="100%" stopColor="#d4d4d8" />
      </linearGradient>
    </defs>

    {/* Soft Floor Shadow */}
    <ellipse cx="80" cy="115" rx="55" ry="12" fill="#e4e4e7" />

    {/* Door Frame Opening (Dark void inside) */}
    <polygon points="55,30 105,30 105,115 55,115" fill="#e2e8f0" stroke="url(#doorFrameGrad)" strokeWidth="3" />

    {/* RED EXIT SIGN OVERHEAD */}
    <rect x="64" y="16" width="32" height="13" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
    <text
      x="80"
      y="26"
      fill="#ffffff"
      fontFamily="Inter, -apple-system, sans-serif"
      fontWeight="800"
      fontSize="8"
      letterSpacing="0.5px"
      textAnchor="middle"
    >
      EXIT
    </text>

    {/* Open Left Door Pane (Swinging outward) */}
    <polygon points="55,30 40,40 40,122 55,115" fill="url(#doorGrad)" stroke="#a1a1aa" strokeWidth="1.5" />
    {/* Door handle / latch */}
    <circle cx="44" cy="80" r="1.5" fill="#71717a" />

    {/* Open Right Door Pane (Swinging outward) */}
    <polygon points="105,30 120,40 120,122 105,115" fill="url(#doorGrad)" stroke="#a1a1aa" strokeWidth="1.5" />
    {/* Door handle / latch */}
    <circle cx="116" cy="80" r="1.5" fill="#71717a" />

    {/* Footsteps leading outward */}
    {/* Step 1 (near door) */}
    <ellipse cx="76" cy="100" rx="2.5" ry="5" fill="#52525b" transform="rotate(-15 76 100)" />
    <ellipse cx="84" cy="106" rx="2.5" ry="5" fill="#52525b" transform="rotate(10 84 106)" />

    {/* Step 2 (middle) */}
    <ellipse cx="78" cy="114" rx="3" ry="5.5" fill="#3f3f46" transform="rotate(-10 78 114)" />
    <ellipse cx="88" cy="120" rx="3" ry="5.5" fill="#27272a" transform="rotate(15 88 120)" />

    {/* Step 3 (forward) */}
    <ellipse cx="82" cy="128" rx="3.5" ry="6" fill="#18181b" transform="rotate(-5 82 128)" />
  </svg>
);

/**
 * Authentic UPI App Brand Icons
 */
export const GooglePayIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#4285F4" d="M43.6 20.1H42V20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
    <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 14 24 14c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
    <path fill="#FBBC05" d="M24 44c5.2 0 10-1.9 13.5-5.3l-6.3-5.2C29.2 35 26.8 36 24 36c-5.3 0-9.7-2.8-11.3-8l-6.5 5C9.6 39.5 16.2 44 24 44z" />
    <path fill="#EA4335" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.4-2.3 4.5-4.2 5.9l6.3 5.2c4.1-3.8 6.6-9.4 6.6-15.2 0-1.3-.1-2.7-.4-3.9z" />
  </svg>
);

export const PhonePeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 40 40" className={className}>
    <circle cx="20" cy="20" r="20" fill="#5F259F" />
    <text
      x="20"
      y="27"
      fill="#ffffff"
      fontFamily="Inter, sans-serif"
      fontWeight="800"
      fontSize="20"
      textAnchor="middle"
    >
      पे
    </text>
  </svg>
);

export const PaytmIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-5' }) => (
  <svg viewBox="0 0 56 20" className={className}>
    <rect width="56" height="20" rx="4" fill="#002E6E" />
    <text
      x="28"
      y="14"
      fill="#00BAF2"
      fontFamily="Inter, sans-serif"
      fontWeight="900"
      fontSize="11"
      letterSpacing="-0.5px"
      textAnchor="middle"
    >
      Paytm
    </text>
  </svg>
);

export const BhimIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="15" fill="#008080" />
    <path d="M11 9 L17 16 L11 23" fill="none" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 9 L21 16 L15 23" fill="none" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CredIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#121212" />
    {/* Clean CRED minimal geometric emblem */}
    <path
      d="M10 9 H22 V23 H10 Z M13 12 V20 H19 V12 Z"
      fill="#ffffff"
    />
  </svg>
);

export const PaytmCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#002970" />
    <text
      x="16"
      y="20"
      fill="#00b9f5"
      fontFamily="Inter, -apple-system, sans-serif"
      fontWeight="900"
      fontSize="8"
      letterSpacing="-0.3px"
      textAnchor="middle"
    >
      pay
    </text>
  </svg>
);

export const PopIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#E61E50" />
    <text
      x="16"
      y="21"
      fill="#ffffff"
      fontFamily="Inter, -apple-system, sans-serif"
      fontWeight="900"
      fontSize="10"
      textAnchor="middle"
    >
      pop
    </text>
  </svg>
);

export const NaviIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#2E0854" />
    <text
      x="16"
      y="21"
      fill="#00E575"
      fontFamily="Inter, -apple-system, sans-serif"
      fontWeight="900"
      fontSize="9"
      textAnchor="middle"
    >
      navi
    </text>
  </svg>
);

export const CardLogosGroup: React.FC = () => (
  <div className="flex items-center gap-1.5">
    {/* Visa */}
    <span className="text-[10px] font-black italic text-[#1A1F71] tracking-tighter">VISA</span>
    {/* Mastercard */}
    <svg viewBox="0 0 28 18" className="w-5 h-3.5">
      <circle cx="10" cy="9" r="7" fill="#EB001B" />
      <circle cx="18" cy="9" r="7" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
    {/* RuPay */}
    <span className="text-[9px] font-black text-[#097938]">RuPay</span>
  </div>
);

export const BankLogosGroup: React.FC = () => (
  <div className="flex items-center gap-1">
    {/* Bank 1: HDFC Blue */}
    <div className="w-3.5 h-3.5 rounded-sm bg-[#004C8F] flex items-center justify-center text-[7px] text-white font-bold">
      H
    </div>
    {/* Bank 2: SBI Blue */}
    <div className="w-3.5 h-3.5 rounded-full bg-[#0074B7] flex items-center justify-center text-[7px] text-white font-bold">
      S
    </div>
    {/* Bank 3: ICICI Orange */}
    <div className="w-3.5 h-3.5 rounded-sm bg-[#B02A30] flex items-center justify-center text-[7px] text-white font-bold">
      I
    </div>
    {/* Bank 4: Axis Maroon */}
    <div className="w-3.5 h-3.5 rounded-sm bg-[#97144D] flex items-center justify-center text-[7px] text-white font-bold">
      A
    </div>
  </div>
);

export const WalletLogosGroup: React.FC = () => (
  <div className="flex items-center gap-1">
    <div className="w-3.5 h-3.5 rounded-full bg-[#0082CA] flex items-center justify-center text-[7px] text-white font-bold">
      M
    </div>
    <div className="w-3.5 h-3.5 rounded-full bg-[#ED1C24] flex items-center justify-center text-[7px] text-white font-bold">
      A
    </div>
    <div className="w-3.5 h-3.5 rounded-full bg-[#FF9900] flex items-center justify-center text-[7px] text-black font-bold">
      a
    </div>
  </div>
);
