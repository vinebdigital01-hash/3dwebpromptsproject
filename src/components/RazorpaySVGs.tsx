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
 * Authentic UPI App Brand Icons (100% Vector, Pure Transparent, No White Boxes)
 */

export const GooglePayIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(0, 5)">
      <path
        d="M232.5 42.17C207.25 27.59 174.97 36.25 160.37 61.5L123.59 125.22C112.95 143.62 126.65 150.05 141.93 159.21L177.32 179.64C189.31 186.55 204.62 182.45 211.53 170.48L249.34 105C262.05 82.99 254.51 54.87 232.5 42.17Z"
        fill="#EA4335"
      />
      <path
        d="M190.88 68.54L155.49 48.11C135.95 37.27 124.89 36.55 116.87 49.3L64.67 139.7C50.09 164.94 58.77 197.21 84 211.76C106.01 224.46 134.13 216.92 146.83 194.92L200.03 102.76C206.97 90.78 202.87 75.46 190.88 68.54Z"
        fill="#FBBC04"
      />
      <path
        d="M197.7 22.07L172.84 7.71C145.34-8.16 110.18 1.25 94.31 28.75L46.98 110.72C39.99 122.82 44.14 138.3 56.23 145.28L84.07 161.35C97.82 169.29 115.39 164.58 123.34 150.83L177.41 57.18C188.61 37.78 213.41 31.14 232.81 42.34L197.7 22.07Z"
        fill="#34A853"
      />
      <path
        d="M101.03 52.2L74.16 36.72C62.18 29.82 46.87 33.91 39.95 45.87L7.71 101.58C-8.16 129 1.25 164.08 28.75 179.9L49.21 191.69L74.02 205.98L84.79 212.18C65.67 199.38 59.6 173.74 71.29 153.55L79.64 139.13L110.21 86.3C117.11 74.38 113 59.1 101.03 52.2Z"
        fill="#4285F4"
      />
    </g>
  </svg>
);

export const PhonePeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="24" cy="24" r="23" fill="#5F259F" />
    <path
      d="M20.4 19.88h5.9v9.38c-.8.4-1.87.54-2.68.54-2.14 0-3.22-1.07-3.22-3.48v-6.44zm14.48-2.14a1.77 1.77 0 0 0-1.74-1.74h-3.22l-7.37-8.44c-.67-.8-1.74-1.07-2.81-.8l-2.55.8c-.4.14-.54.67-.27.94l8.04 7.64h-12.2c-.4 0-.67.27-.67.67v1.34c0 .94.8 1.74 1.74 1.74h1.88v6.43c0 4.83 2.55 7.64 6.84 7.64 1.34 0 2.41-.13 3.75-.67v4.29c0 1.21.94 2.14 2.14 2.14h1.88a.86.86 0 0 0 .8-.8v-23.03h3.08c.4 0 .67-.27.67-.67v-1.34z"
      fill="#FFFFFF"
    />
  </svg>
);

export const PaytmIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-4' }) => (
  <svg viewBox="0 0 32 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g fill="#002970">
      <path d="M1.29 2.75c-.16 0-.29.13-.29.29v7.4c0 .16.12.28.27.29h1.36c.16 0 .3-.13.3-.3v-2.07h1.28c.97 0 1.75-.78 1.75-1.75v-1.92c0-.97-.79-1.75-1.75-1.75H1.29zm1.65 1.97h.85c.17 0 .31.14.31.32v1.04c0 .17-.14.31-.31.32h-.85V4.72z" />
      <path d="M7.58 2.76c-.16 0-.29.13-.29.28v1.28c0 .17.14.3.31.3h1.76c.15.02.26.14.27.29v.17c-.01.15-.12.26-.26.28h-.88c-1.03 0-1.87.84-1.87 1.87v1.59c0 .98.79 1.77 1.77 1.77h2.42c.42 0 .76-.33.77-.75V4.65c0-1.03-.84-1.87-1.87-1.87-.1 0-.21.01-.31.03H7.58zm1.2 4.43h.55c.17 0 .3.14.31.3v1.17c-.05.12-.16.2-.29.2h-.56c-.17 0-.3-.13-.31-.3V7.49c0-.17.14-.3.3-.3z" />
      <path d="M12.58 2.75c-.16 0-.3.14-.3.3v3.09c0 1.06.86 1.91 1.91 1.91h.85c.16.02.28.15.28.32 0 .16-.12.29-.27.31h-1.98c-.16 0-.3.14-.3.3v1.36c0 .17.13.3.3.3h2.19c1.06 0 1.91-.86 1.91-1.92V3.05c0-.16-.13-.3-.3-.3h-1.33c-.17 0-.3.14-.3.3v2.82c0 .17-.14.31-.31.31h-.56c-.18 0-.32-.14-.32-.32V3.05c0-.16-.13-.3-.3-.3h-.67z" />
    </g>
    <g fill="#00BAF2">
      <path d="M20.81 1.21c-.85.24-.68 1.44-2.23 1.54h-.15c-.13.03-.23.15-.23.29v1.36c0 .17.13.3.3.3h.8v5.78c0 .16.13.29.29.29h1.33c.16 0 .29-.13.29-.3V4.7h.75c.16 0 .3-.13.3-.3V3.04c0-.17-.14-.3-.3-.3h-.76V1.48c0-.15-.12-.27-.27-.27h-.07z" />
      <path d="M26.09 2.67c-.5 0-.96.19-1.3.5V3.02c-.01-.16-.14-.28-.3-.28h-1.33c-.17 0-.3.14-.3.3v7.4c0 .17.13.3.3.3h1.33c.15 0 .28-.11.29-.26V5.17c0-.26.21-.48.47-.49h.24c.11.01.21.05.28.11.11.1.18.24.18.4v5.28h1.34c.16 0 .29-.13.29-.29V4.87c0-.17.09-.32.22-.41.07-.05.15-.08.24-.09h.25c.26.02.46.24.46.5v5.57h1.34c.16 0 .3-.14.3-.3V4.47c0-.22-.04-.44-.11-.64-.27-.8-1.01-1.36-1.88-1.36h-.02c-.57 0-1.08.24-1.44.62-.36-.38-.87-.62-1.44-.62z" />
    </g>
  </svg>
);

export const CredIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 32 37"
    fill="none"
    stroke="#0f172a"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M5 5.5h22a2 2 0 0 1 2 2v16.5l-13 10L3 24V7.5a2 2 0 0 1 2-2z" />
    <path d="M11 10.5h12v4.5" />
    <path d="M7 14.5h10" />
    <path d="M7 14.5v7.5l9 6.5 7-5.5v-4" />
    <path d="M12.5 19v2.5l3.5 2.5 3.5-2.5V19" />
  </svg>
);

export const AmazonPayIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-4' }) => (
  <svg viewBox="0 0 46 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g fill="#131921">
      <path d="M8.2 2.5c-2.3 0-3.9 1.6-3.9 3.8v7.2h2.2V11c.5.8 1.4 1.3 2.5 1.3 2.3 0 4-1.8 4-4.9s-1.7-4.9-4.8-4.9zm-.3 7.8c-1.5 0-2.6-1.2-2.6-3 0-1.8 1.1-3 2.6-3 1.5 0 2.6 1.2 2.6 3 0 1.8-1.1 3-2.6 3z" />
      <path d="M19.1 5.3c-.6-.5-1.5-.8-2.6-.8-2.5 0-4 1.5-4 3.5 0 2.1 1.4 3.4 3.5 3.4 1 0 1.9-.3 2.5-.9v.7h2.1V5.7c0-2.2-1.4-3.4-3.8-3.4-1.5 0-2.8.5-3.6 1.3l1 1.4c.6-.6 1.4-.9 2.5-.9 1.3 0 2 .6 2 1.8v.3zm-.1 3.5c0 1.1-.9 1.9-2.1 1.9-1 0-1.7-.6-1.7-1.6 0-1 .7-1.6 2-1.6.7 0 1.3.1 1.8.4v.9z" />
      <path d="M23.1 4.7l2.8 7.3-1.6 3.8h2.3l4.7-11.1h-2.3l-2.8 7.2-2.3-7.2h-2.4z" />
    </g>
    {/* Amazon Smile curved arrow */}
    <path
      d="M3.5 15.5c7.8 4.2 18.2 4.4 26.2.2.4-.2.9.2.6.6-7.4 5.2-19.1 5.3-27.4.4-.3-.2 0-.8.6-1.2z"
      fill="#FF9900"
    />
    <path
      d="M31.2 14.8c.4-.5 1.7-.3 2.4-.1.3.1.3.3.1.5-.9.9-2.3 2.2-3.4 2.8-.2.1-.4 0-.3-.2.3-.9 1-2.4 1.2-3z"
      fill="#FF9900"
    />
  </svg>
);

export const BhimIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="15" fill="#008080" />
    <path d="M11 9 L17 16 L11 23" fill="none" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 9 L21 16 L15 23" fill="none" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PaytmCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <PaytmIcon className={className} />
);

export const PopIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <AmazonPayIcon className={className} />
);

export const NaviIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <CredIcon className={className} />
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
