import React, { useState } from 'react';
import { X, Download, CheckCircle, Mail, Sparkles } from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadMagnetModal: React.FC<LeadMagnetModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    setDownloaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-role-fade-in select-none">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md glass-panel rounded-3xl bg-[#090914] border border-white/20 p-6 sm:p-8 text-white z-10 shadow-2xl shadow-black">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!downloaded ? (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-mono mb-4 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>100% FREE SAMPLE PROMPT</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Get the Free Hazmat 3D Starter Prompt
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mb-6 font-sans">
              Test our prompt architecture in Claude 3.7 or Cursor immediately. We will email you the full code plus our 50-page AI Design System guide.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 font-sans">
                  Your Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@studio.design"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Free Prompt (.PDF + Code)</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Check Your Inbox!
            </h3>
            <p className="text-xs text-white/60 font-sans">
              We dispatched the Hazmat 3D prompt and 50 AI Tokens PDF to <strong>{email}</strong>.
            </p>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-2.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all mt-4"
            >
              Continue Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
