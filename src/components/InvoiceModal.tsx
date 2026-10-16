import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Download, Building2 } from 'lucide-react';
import { LeadOrder } from '../lib/leadTracker';
import { sound } from '../lib/audioEngine';

interface InvoiceModalProps {
  order: LeadOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const invoiceNo = order.invoiceNumber || `INV-2026-${order.orderNumber.replace(/\D/g, '').slice(-4) || '8941'}`;
  const licenseKey = order.licenseKey || 'LIC-VIP-84K2-91Q7';
  const issueDate = order.approvedAt ? new Date(order.approvedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const baseAmount = Math.round((order.amountINR / 1.18) * 100) / 100;
  const gstAmount = Math.round((order.amountINR - baseAmount) * 100) / 100;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-role-fade-in overflow-y-auto">
      {/* Container with print-specific styling */}
      <div className="relative w-full max-w-2xl bg-[#090912] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e0e1a]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/80">
              Tax Invoice // {invoiceNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-tax-invoice" className="p-6 sm:p-8 space-y-6 text-xs font-sans">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                <h2 className="text-lg font-bold tracking-tight text-white">APEX3D DIGITAL SYSTEMS</h2>
              </div>
              <p className="text-[11px] text-white/50">A Division of Vine B Digital Marketing Agency</p>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">UPI Merchant VPA: s5305704393562990@slc</p>
              <p className="text-[10px] text-white/40 font-mono">Support: support@vinebdigital.store</p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[11px] mb-1">
                TAX INVOICE
              </span>
              <div className="font-mono text-[11px] text-white/80 font-bold">{invoiceNo}</div>
              <div className="font-mono text-[10px] text-white/50 mt-0.5">Date: {issueDate}</div>
              <div className="font-mono text-[10px] text-blue-400 mt-0.5">Order Ref: {order.orderNumber}</div>
            </div>
          </div>

          {/* Bill To & Verification Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px]">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-sans font-bold mb-1">
                Billed To (Licensee)
              </div>
              <div className="font-semibold text-white text-xs">{order.name || 'Commercial Licensee'}</div>
              <div className="text-white/60 mt-0.5">{order.email}</div>
              {order.phone && <div className="text-white/60">{order.phone}</div>}
            </div>

            <div className="sm:text-right">
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-sans font-bold mb-1">
                Payment Verification
              </div>
              <div className="text-emerald-400 font-semibold flex sm:justify-end items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>UPI Bank Reconciled</span>
              </div>
              <div className="text-white/60 mt-0.5">Bank UTR: {order.utrNumber || '419082716354'}</div>
              <div className="text-white/40 text-[10px]">Method: Direct UPI Merchant Intent</div>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[10px] font-mono text-white/60 uppercase">
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-3 text-center">SAC Code</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{order.tierName}</div>
                    <div className="text-[10px] text-white/50 font-sans mt-0.5">
                      500+ Calibrated WebGL Architecture Prompts, Three.js Starter Kits, Commercial License ({licenseKey})
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-white/60">998313</td>
                  <td className="py-3 px-3 text-right text-white/60">1</td>
                  <td className="py-3 px-4 text-right font-semibold text-white">
                    ₹{baseAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="text-white/60 text-[10px]">
                  <td colSpan={3} className="py-2 px-4 text-right">
                    Applicable GST (18% Integrated Tax)
                  </td>
                  <td className="py-2 px-4 text-right">₹{gstAmount.toFixed(2)}</td>
                </tr>
                <tr className="bg-white/[0.03] text-xs font-bold text-white">
                  <td colSpan={3} className="py-3 px-4 text-right uppercase">
                    Total Amount Paid:
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-mono text-sm">
                    ₹{order.amountINR.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Commercial License Hash & Security Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-[10px] text-white/40 space-y-1 text-center sm:text-left">
              <p>Commercial License Key: <strong className="text-white/80 font-mono">{licenseKey}</strong></p>
              <p>Access Portal: <strong className="text-blue-400 font-mono">https://vinebdigital.store/#portal</strong></p>
              <p>This is a computer-generated tax invoice. No signature required.</p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PAID & VERIFIED</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
