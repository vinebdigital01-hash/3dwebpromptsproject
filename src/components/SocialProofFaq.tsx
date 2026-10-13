import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ChevronDown, MessageSquare, ArrowRight, Award } from 'lucide-react';
import { TESTIMONIALS, FAQS } from '../data/vaultCatalog';
import { sound } from '../lib/audioEngine';

interface SocialProofFaqProps {
  onUnlockClick: () => void;
}

export const SocialProofFaq: React.FC<SocialProofFaqProps> = ({ onUnlockClick }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    sound.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#050508] border-t border-white/5 will-change-transform transform-gpu">
      {/* Mesh Glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[500px] bg-white/[0.02] rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Digital Asset Terms & Finality Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mx-auto mb-20 p-8 sm:p-10 rounded-3xl glass-panel bg-[#090914]/90 border border-blue-500/30 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="w-16 h-16 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
            DIGITAL ASSET PROVISIONING POLICY
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-3">
            Instant Digital Delivery • All Sales Final
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed font-sans">
            Because APEX 3D provides immediate, irreversible access to proprietary production prompts, WebGL shader source code, and commercial agency systems upon checkout, all sales of this digital product are strictly final and non-refundable. Review our interactive 3D previews and live transformation metrics before ordering.
          </p>
        </motion.div>

        {/* Wall of Love Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-300 mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>WALL OF LOVE & AGENCY PROOF</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Proven Results From <span className="accent-text-gradient font-display italic font-normal">850+ Studio Owners</span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 font-sans">
            Real designers and creative agencies using APEX 3D prompts to close five-figure retainers.
          </p>
        </motion.div>

        {/* Testimonials Grid (6 cards) with staggered whileInView */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              onMouseEnter={() => sound.playHover()}
              className="glass-panel rounded-2xl p-6 sm:p-7 bg-[#090912]/80 border border-white/10 hover:border-blue-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 text-sm">★★★★★</div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold">
                    {t.revenue}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic mb-6 font-sans">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-white/50">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          id="faq"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto pt-10"
        >
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-300">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h3 className="text-2xl sm:text-4xl font-bold text-white mt-1">
              Everything You Need to Know
            </h3>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl glass-panel bg-[#090912]/80 border transition-all overflow-hidden ${
                    isOpen ? 'border-blue-500/40 shadow-lg shadow-blue-500/5' : 'border-white/10'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-white hover:text-white/80 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-blue-400' : 'text-white/40'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 pt-3 animate-role-fade-in font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Pre-Footer CTA Strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55 }}
          className="mt-24 p-8 sm:p-12 rounded-3xl glass-panel bg-gradient-to-r from-[#0d0d1e] via-[#090916] to-[#121224] border border-blue-500/30 text-center relative overflow-hidden shadow-2xl shadow-blue-500/5"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h3 className="text-2xl sm:text-4xl font-bold text-white">
              Ready to Stop Building Boring 2D Websites?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-sans">
              Join 2,400+ designers and digital agencies deploying world-class 3D web experiences with a single prompt.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  sound.playSuccess();
                  onUnlockClick();
                }}
                onMouseEnter={() => sound.playHover()}
                className="px-8 py-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-md inline-flex items-center gap-2"
              >
                <span>Unlock The Complete Vault Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
