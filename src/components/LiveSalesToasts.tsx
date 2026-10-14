import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';

interface NotificationItem {
  name: string;
  location: string;
  flag: string;
  action: string;
  time: string;
  planTag: string;
}

// Curated authentic Indian and Pakistani agency owners & designers
const INDIAN_PAKISTANI_FEED: NotificationItem[] = [
  { name: 'Aarav Sharma', location: 'Mumbai, IN', flag: '🇮🇳', action: 'unlocked Lifetime VIP (₹2,999)', time: 'Just now', planTag: 'Lifetime VIP' },
  { name: 'Hamza Tariq', location: 'Lahore, PK', flag: '🇵🇰', action: 'claimed 6-Month Studio Plan (₹699)', time: '1m ago', planTag: '6-Month Plan' },
  { name: 'Rohan Mehta', location: 'Bengaluru, IN', flag: '🇮🇳', action: 'started 1-Month Pro Plan (₹299)', time: '2m ago', planTag: '1-Month Pro' },
  { name: 'Zaid Khan', location: 'Karachi, PK', flag: '🇵🇰', action: 'unlocked Lifetime VIP with Reseller Rights', time: '3m ago', planTag: 'Lifetime VIP' },
  { name: 'Priya Patel', location: 'Ahmedabad, IN', flag: '🇮🇳', action: 'claimed 1-Day Sprint Pass (₹49)', time: '5m ago', planTag: 'Day Pass' },
  { name: 'Usman Farooq', location: 'Islamabad, PK', flag: '🇵🇰', action: 'billed $14,000 using 3D Watchmaker prompt', time: '7m ago', planTag: 'Agency Close' },
  { name: 'Aditya Verma', location: 'Delhi NCR, IN', flag: '🇮🇳', action: 'unlocked Lifetime VIP (₹2,999)', time: '9m ago', planTag: 'Lifetime VIP' },
  { name: 'Bilal Ahmed', location: 'Rawalpindi, PK', flag: '🇵🇰', action: 'claimed 6-Month Plan (15 copies/day)', time: '11m ago', planTag: '6-Month Plan' },
  { name: 'Ananya Iyer', location: 'Chennai, IN', flag: '🇮🇳', action: 'started 1-Month Pro Plan (₹299)', time: '14m ago', planTag: '1-Month Pro' },
  { name: 'Daniyal Sheikh', location: 'Faisalabad, PK', flag: '🇵🇰', action: 'unlocked 1-Day Pass (₹49)', time: '16m ago', planTag: 'Day Pass' },
  { name: 'Kabir Sen', location: 'Kolkata, IN', flag: '🇮🇳', action: 'closed ₹2,40,000 client with 3D Cyber Hazmat', time: '19m ago', planTag: 'Agency Close' },
  { name: 'Ayesha Siddiqui', location: 'Lahore, PK', flag: '🇵🇰', action: 'unlocked Lifetime VIP (₹2,999)', time: '22m ago', planTag: 'Lifetime VIP' },
  { name: 'Vikram Joshi', location: 'Pune, IN', flag: '🇮🇳', action: 'claimed 6-Month Studio Plan (₹699)', time: '25m ago', planTag: '6-Month Plan' },
  { name: 'Saad Rehman', location: 'Peshawar, PK', flag: '🇵🇰', action: 'unlocked Lifetime VIP with Unlimited Copies', time: '28m ago', planTag: 'Lifetime VIP' },
  { name: 'Sneha Reddy', location: 'Hyderabad, IN', flag: '🇮🇳', action: 'started 1-Month Pro Plan (₹299)', time: '32m ago', planTag: '1-Month Pro' },
  { name: 'Haris Malik', location: 'Multan, PK', flag: '🇵🇰', action: 'claimed 1-Day Sprint Pass (₹49)', time: '35m ago', planTag: 'Day Pass' },
  { name: 'Devansh Malhotra', location: 'Chandigarh, IN', flag: '🇮🇳', action: 'unlocked Lifetime VIP (₹2,999)', time: '38m ago', planTag: 'Lifetime VIP' },
  { name: 'Mustafa Ali', location: 'Sialkot, PK', flag: '🇵🇰', action: 'billed $11,500 using Dental 3D Clinic prompt', time: '41m ago', planTag: 'Agency Close' },
  { name: 'Ishaan Nair', location: 'Kochi, IN', flag: '🇮🇳', action: 'claimed 6-Month Studio Plan (₹699)', time: '45m ago', planTag: '6-Month Plan' },
  { name: 'Zainab Bukhari', location: 'Karachi, PK', flag: '🇵🇰', action: 'unlocked Lifetime VIP with Reseller License', time: '49m ago', planTag: 'Lifetime VIP' },
  { name: 'Arjun Kapoor', location: 'Jaipur, IN', flag: '🇮🇳', action: 'started 1-Month Pro Plan (₹299)', time: '53m ago', planTag: '1-Month Pro' },
  { name: 'Shahzaib Chaudhry', location: 'Gujranwala, PK', flag: '🇵🇰', action: 'claimed 1-Day Sprint Pass (₹49)', time: '57m ago', planTag: 'Day Pass' },
];

export const LiveSalesToasts: React.FC = () => {
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPastHero, setIsPastHero] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Start from a random customer so it never always shows the same first name
  const notificationIndexRef = useRef<number>(Math.floor(Math.random() * INDIAN_PAKISTANI_FEED.length));
  const shownCountInBatchRef = useRef<number>(0);
  const batchTargetRef = useRef<number>(3); // Shows 3 or 4 notifications then spins loader

  // 1. Detect if user is past Hero section
  useEffect(() => {
    const handleScrollOrResize = () => {
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // Considered scrolled past hero when hero bottom has scrolled out of view or scrollY > 480
        const past = rect.bottom <= 90 || window.scrollY > 480;
        setIsPastHero(past);
      } else {
        setIsPastHero(window.scrollY > 480);
      }
    };

    handleScrollOrResize();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  // 2. Manage toast cycle only when scrolled past Hero
  useEffect(() => {
    // If user is in Hero section or dismissed, don't show any toasts
    if (!isPastHero || isDismissed) {
      setCurrentNotification(null);
      setIsLoading(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      if (isPaused) {
        timeoutId = setTimeout(runCycle, 1000);
        return;
      }

      // Check if we reached 3 or 4 notifications in current batch
      if (shownCountInBatchRef.current >= batchTargetRef.current) {
        // Trigger Loading Spinner state
        setCurrentNotification(null);
        setIsLoading(true);

        // Spinner runs for 2.2 seconds then fetches new batch
        timeoutId = setTimeout(() => {
          setIsLoading(false);
          shownCountInBatchRef.current = 0;
          // Randomly set next target to 3 or 4
          batchTargetRef.current = Math.random() > 0.5 ? 4 : 3;

          // Advance to next notification
          const nextItem = INDIAN_PAKISTANI_FEED[notificationIndexRef.current % INDIAN_PAKISTANI_FEED.length];
          notificationIndexRef.current += 1;
          setCurrentNotification(nextItem);
          shownCountInBatchRef.current += 1;

          // Show this notification for 4.5 seconds
          timeoutId = setTimeout(hideAndNext, 4500);
        }, 2200);
        return;
      }

      // Normal cycle: show next notification
      const nextItem = INDIAN_PAKISTANI_FEED[notificationIndexRef.current % INDIAN_PAKISTANI_FEED.length];
      notificationIndexRef.current += 1;
      setCurrentNotification(nextItem);
      shownCountInBatchRef.current += 1;

      // Show notification for 4.5 seconds
      timeoutId = setTimeout(hideAndNext, 4500);
    };

    const hideAndNext = () => {
      // Hide notification briefly for 1.4 seconds before showing next
      setCurrentNotification(null);
      timeoutId = setTimeout(runCycle, 1400);
    };

    // Delay start 1.2 seconds after leaving hero so it feels organic
    timeoutId = setTimeout(runCycle, 1200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPastHero, isDismissed, isPaused]);

  // If in Hero section or dismissed, render nothing
  if (!isPastHero || isDismissed) {
    return null;
  }

  return (
    <div
      className="fixed bottom-[calc(110px+env(safe-area-inset-bottom,0px))] sm:bottom-[86px] md:bottom-24 left-3 sm:left-6 z-30 select-none pointer-events-none max-w-[calc(100vw-1.5rem)] sm:max-w-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        {/* State 1: Loading Spinner after 3 or 4 toasts */}
        {isLoading && (
          <motion.div
            key="feed-spinner"
            initial={{ opacity: 0, y: 15, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-3 sm:p-3.5 rounded-2xl glass-panel bg-[#090914]/95 border border-blue-500/30 shadow-2xl shadow-blue-500/10 flex items-center gap-3 backdrop-blur-xl pointer-events-auto"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            </div>

            <div className="text-[11px] sm:text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Syncing live order network</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
              </div>
              <div className="text-white/50 text-[10px] sm:text-[11px] font-mono mt-0.5">
                Fetching verified orders from South Asia...
              </div>
            </div>
          </motion.div>
        )}

        {/* State 2: Active Indian & Pakistani Order Toast */}
        {!isLoading && currentNotification && (
          <motion.div
            key={`${currentNotification.name}-${currentNotification.action}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            className="p-3 sm:p-3.5 rounded-2xl glass-panel bg-[#090914]/95 border border-white/15 hover:border-blue-500/40 shadow-2xl flex items-center gap-3 backdrop-blur-xl transition-colors cursor-default pointer-events-auto"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="text-[11px] sm:text-xs min-w-0 pr-1 flex-1">
              <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{currentNotification.name}</span>
                <span className="text-[11px] shrink-0" title={currentNotification.location}>
                  {currentNotification.flag}
                </span>
                <span className="text-white/40 font-normal text-[10px] shrink-0">
                  {currentNotification.location}
                </span>
              </div>
              <div className="text-white/80 line-clamp-1 mt-0.5 text-[11px] font-sans">
                {currentNotification.action}
              </div>
            </div>

            <div className="ml-auto shrink-0 flex flex-col items-end text-right gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-blue-300">
                  {currentNotification.planTag}
                </span>
                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentNotification(null);
                  }}
                  className="text-white/30 hover:text-white/80 p-0.5 rounded transition-colors"
                  title="Dismiss"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[9px] font-mono text-white/40">
                {currentNotification.time}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
