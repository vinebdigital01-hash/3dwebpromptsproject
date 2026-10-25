import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowUpRight, Zap, Award, Compass, Play } from 'lucide-react';
import { sound } from '../lib/audioEngine';
import { isMediaImage } from '../lib/mediaUtils';

interface ParallaxExplorationsProps {
  onUnlockClick: () => void;
}

const SHOWCASES = [
  {
    title: 'Anchor AI Autonomous Platform',
    subtitle: 'Real-Time Vector Streaming Telemetry',
    category: 'Autonomous Agents',
    metric: '$38,500 Invoiced',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Alethia Neural Reasoning Engine',
    subtitle: 'Hyper-Dimensional Vector Lattice HUD',
    category: 'Cognitive AI',
    metric: '$44,000 Invoiced',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/alethia-video.mp4',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Geno Trace Bio-Computation',
    subtitle: 'Spatial DNA Helix Molecular Raymarching',
    category: 'Life Sciences',
    metric: '$48,000 Invoiced',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Geno%20Trace.mp4',
    poster: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Wise Global Kinetic Flow',
    subtitle: 'Responsive Multi-Currency FX Engine',
    category: 'FinTech Motion',
    metric: '$16,500 Invoiced',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4',
    poster: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Resend Developer Dark System',
    subtitle: 'Obsidian Hairline Shimmer Architecture',
    category: 'Developer Platform',
    metric: '$14,000 Invoiced',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'LaunchDarkly Enterprise Matrix',
    subtitle: 'Dynamic Feature Toggle Shaders',
    category: 'Enterprise SaaS',
    metric: '$17,500 Invoiced',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/8b7c1764-b8c0-4d71-9b7e-6bd84bce04ad.mp4',
    poster: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80',
  },
];

export const ParallaxExplorations: React.FC<ParallaxExplorationsProps> = ({ onUnlockClick }) => {
  return (
    <section className="relative py-24 sm:py-32 bg-[#050508] overflow-hidden border-t border-white/5 select-none will-change-transform transform-gpu">
      {/* Infinite Marquee Ticker */}
      <div className="relative w-full overflow-hidden border-y border-white/10 py-4 bg-white/[0.015] mb-20">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-4 text-xs sm:text-sm font-mono tracking-widest text-white/50">
              <span className="text-white font-bold">DEPLOYING THE 3D WEB</span>
              <span className="text-amber-400">★</span>
              <span>ZERO CODE GLSL</span>
              <span className="text-amber-400">★</span>
              <span className="text-blue-400 font-bold">$10,000 CLIENT RETENTION</span>
              <span className="text-amber-400">★</span>
              <span>60 FPS OPTIMIZED MOTION</span>
              <span className="text-amber-400">★</span>
              <span>REFERO & MOTIONSITES BENCHMARK</span>
              <span className="text-white/30">/</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-300 mb-4">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>MORE LIVE PRODUCTION REELS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Tactile Interactions That <span className="accent-text-gradient font-display italic font-normal">Close 5-Figure Deals</span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 font-sans">
            Every reel below is built with prompt architectures included in your vault pass. Hover or click any reel to inspect.
          </p>
        </motion.div>

        {/* 6 Video Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOWCASES.map((item, idx) => (
            <ShowcaseCard
              key={item.title}
              item={item}
              idx={idx}
              onUnlockClick={onUnlockClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ShowcaseCard: React.FC<{
  item: typeof SHOWCASES[0];
  idx: number;
  onUnlockClick: () => void;
}> = ({ item, idx, onUnlockClick }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const isImage = isMediaImage(item.videoUrl);

  // Auto-play when user scrolls to this video, auto-stop when scrolled away
  React.useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl || isImage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            if (videoRef.current && videoRef.current.paused) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => setIsPlaying(true))
                  .catch(() => {});
              }
            }
          } else if (!entry.isIntersecting) {
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: [0.1, 0.4] }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [isImage]);

  const handleMouseEnter = () => {
    sound.playHover();
    if (!isImage && videoRef.current && videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: idx * 0.06 }}
      onClick={() => {
        sound.playSweep();
        onUnlockClick();
      }}
      onMouseEnter={handleMouseEnter}
      className="group rounded-2xl p-4 bg-[#0a0a14] border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* Video / Image Player Box */}
      <div
        data-cursor="play"
        className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black border border-white/10"
      >
        {isImage ? (
          <img
            src={item.videoUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            <img
              src={item.poster}
              alt={item.title}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isPlaying ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <video
              ref={videoRef}
              src={item.videoUrl}
              poster={item.poster}
              loop
              muted
              playsInline
              preload="none"
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 group-hover:scale-110 group-hover:bg-blue-600 transition-all shadow-lg">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
            )}
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-white/90">
          {item.category}
        </div>
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[11px] font-mono font-bold">
          {item.metric}
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-white/50 mt-1 font-sans line-clamp-1">
          {item.subtitle}
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40 group-hover:text-white transition-colors">
        <span>Unlock Architecture</span>
        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.div>
  );
};
