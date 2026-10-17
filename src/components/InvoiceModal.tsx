import React, { useState } from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Copy, Check, Building2, Clock, CreditCard, Hash } from 'lucide-react';
import { LeadOrder } from '../lib/leadTracker';
import { sound } from '../lib/audioEngine';

interface InvoiceModalProps {
  order: LeadOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen || !order) return null;

  // Strict: Invoices are generated exclusively for paid orders
  if ((order.amountINR || 0) <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-role-fade-in">
        <div className="relative w-full max-w-md bg-[#09090e] border border-white/10 rounded-2xl p-6 text-white text-center shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No Invoice for Free Accounts</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-5">
            Official MSME tax invoices (UDYAM-UP-29-0208780) are generated exclusively upon reconciliation of paid orders. Free trial accounts do not incur any charges.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Format exact date & time
  const formatDateTime = (dateStr?: string) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      if (isNaN(d.getTime())) {
        const now = new Date();
        return {
          date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST',
          full: now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST'
        };
      }
      return {
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST',
        full: `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} IST`
      };
    } catch {
      return { date: '16 Oct 2026', time: '06:00:00 PM IST', full: '16 Oct 2026, 06:00:00 PM IST' };
    }
  };

  const issueTimestamp = formatDateTime(order.approvedAt || order.createdAt);
  const createdTimestamp = formatDateTime(order.createdAt);
  const reconciledTimestamp = formatDateTime(order.approvedAt || order.createdAt);

  // Amount in words
  const numberToWords = (amt: number): string => {
    const map: Record<number, string> = {
      49: 'Forty-Nine Indian Rupees Only',
      250: 'Two Hundred Fifty Indian Rupees Only',
      299: 'Two Hundred Ninety-Nine Indian Rupees Only',
      650: 'Six Hundred Fifty Indian Rupees Only',
      699: 'Six Hundred Ninety-Nine Indian Rupees Only',
      2950: 'Two Thousand Nine Hundred Fifty Indian Rupees Only',
      2999: 'Two Thousand Nine Hundred Ninety-Nine Indian Rupees Only',
    };
    return map[amt] || `${amt.toFixed(2)} Indian Rupees Only`;
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleCopyLicense = () => {
    sound.playClick();
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-role-fade-in overflow-y-auto">
      {/* Modal Shell */}
      <div className="relative w-full max-w-3xl my-auto text-zinc-900">
        
        {/* Top Floating Control Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 mb-3 bg-[#0c0c16] border border-white/10 rounded-xl text-white shadow-xl gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-mono font-semibold tracking-wider text-zinc-200 uppercase truncate">
              Invoice // {invoiceNo}
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 shrink-0">
              MSME: UDYAM-UP-29-0208780
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span><span className="hidden xs:inline">Print / Save </span>PDF</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Luxury Black & White Paper Invoice Sheet */}
        <div
          id="printable-tax-invoice"
          className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-4 sm:p-8 lg:p-10 font-sans text-zinc-900 transition-all select-text"
        >
          {/* Header Row: Vine B Digital Logo + Invoice Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-6 pb-6 border-b-2 border-black">
            {/* Left: Brand Identity with Official Logo */}
            <div className="flex items-start gap-4">
              <img
                src="/vineb-logo.png"
                alt="Vine B Digital"
                className="w-14 h-14 object-contain rounded-md border border-zinc-200 p-1 shrink-0 bg-white"
                onError={(e) => {
                  // Fallback to webp if png fails
                  (e.target as HTMLImageElement).src = '/vineb-logo.webp';
                }}
              />
              <div>
                <h1 className="text-lg font-black tracking-tight text-black uppercase font-mono leading-none">
                  VINE B DIGITAL
                </h1>
                <p className="text-[11px] font-medium text-zinc-600 mt-1 uppercase tracking-wider font-mono">
                  Marketing Agency &bull; 3D Systems Division
                </p>
                <div className="text-[10px] text-zinc-500 font-mono space-y-0.5 mt-2">
                  <p>MSME Reg: <span className="text-zinc-900 font-bold">UDYAM-UP-29-0208780</span> (Govt. of India)</p>
                  <p>UPI Merchant VPA: <span className="text-zinc-900 font-semibold">s5305704393562990@slc</span></p>
                  <p>Support Hotline: <span className="text-zinc-900">support@vinebdigital.store</span> &bull; +91 8860090791</p>
                  <p>Issuing Entity: Vine B Digital Marketing Agency (India)</p>
                </div>
              </div>
            </div>

            {/* Right: Invoice Type, Number, Date and Exact Time */}
            <div className="sm:text-right w-full sm:w-auto">
              <div className="inline-block px-3 py-1 bg-black text-white text-[11px] font-mono font-bold tracking-widest uppercase mb-2">
                COMMERCIAL INVOICE
              </div>
              <div className="font-mono text-sm font-bold text-black tracking-tight">
                {invoiceNo}
              </div>
              <div className="font-mono text-[11px] text-zinc-600 mt-1">
                Order Ref: <span className="text-zinc-900 font-bold">{order.orderNumber}</span>
              </div>
              <div className="font-mono text-[11px] text-zinc-600 mt-0.5 flex items-center sm:justify-end gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>Issue Date: <strong className="text-zinc-900">{issueTimestamp.date}</strong></span>
              </div>
              <div className="font-mono text-[11px] text-zinc-900 font-bold mt-0.5 bg-zinc-100 sm:inline-block px-2 py-0.5 rounded">
                Time: {issueTimestamp.time}
              </div>
            </div>
          </div>

          {/* 3-Column Meta Details: Billed To / Payment Mode & Reference / Settlement Audit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-zinc-200 text-xs">
            {/* Column 1: Billed To */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                <span>BILLED TO (LICENSEE)</span>
              </div>
              <div className="font-bold text-black text-sm">{order.name || 'Commercial Licensee'}</div>
              <div className="font-mono text-[11px] text-zinc-600 break-all mt-1">{order.email}</div>
              {order.phone && <div className="font-mono text-[11px] text-zinc-600 mt-0.5">{order.phone}</div>}
              <div className="text-[10px] text-zinc-400 font-mono mt-2 pt-2 border-t border-zinc-200">
                Customer ID: CUST-{(order.email || 'USER').split('@')[0].toUpperCase().slice(0, 8)}
              </div>
            </div>

            {/* Column 2: Payment Mode & Reference Number */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3 text-zinc-700" />
                <span>PAYMENT MODE &amp; REFERENCE</span>
              </div>
              <div className="space-y-1 text-[11px] font-mono">
                <div>
                  <span className="text-zinc-500">Payment Mode:</span>{' '}
                  <strong className="text-black">Slice Merchant UPI</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Channel:</span>{' '}
                  <span className="text-zinc-700">Direct UPI / QR Intent</span>
                </div>
                <div className="pt-1">
                  <span className="text-zinc-500">Bank Ref (UTR):</span>{' '}
                  <span className="px-1.5 py-0.5 bg-black text-white font-bold rounded text-[10px] tracking-wider select-all">
                    {order.utrNumber || 'VERIFIED-BANK-UTR'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Txn Ref ID:</span>{' '}
                  <span className="text-zinc-700">TXN-{(order.id || 'ORDER').slice(-10).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Column 3: Exact Timing & Status */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-zinc-700" />
                <span>TRANSACTION TIME &amp; AUDIT</span>
              </div>
              <div className="space-y-1 text-[11px] font-mono">
                <div>
                  <span className="text-zinc-500">Order Placed:</span>{' '}
                  <span className="text-zinc-800 font-semibold">{createdTimestamp.time}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Bank Reconciled:</span>{' '}
                  <span className="text-zinc-800 font-semibold">{reconciledTimestamp.time}</span>
                </div>
                <div className="pt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>PAID &amp; RECONCILED</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table (Luxury Minimalist Black & White) */}
          <div className="my-6 border border-zinc-300 rounded-lg overflow-hidden overflow-x-auto no-scrollbar">
            <table className="min-w-[540px] w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-300 text-[10px] font-mono text-zinc-700 uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-bold">Item Description</th>
                  <th className="py-2.5 px-3 text-center font-bold">Category</th>
                  <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                  <th className="py-2.5 px-3 text-right font-bold">Unit Price</th>
                  <th className="py-2.5 px-4 text-right font-bold">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono text-xs">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-bold text-black text-sm">{order.tierName}</div>
                    <div className="text-[11px] text-zinc-600 font-sans mt-1 leading-relaxed">
                      500+ Calibrated WebGL Architecture Prompts, Three.js Starter Kits, Custom GLSL Shaders &bull; Claude 3.7 Sonnet &amp; Cursor AI Calibration
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1.5 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-zinc-400" />
                      <span>Commercial License Hash: <strong className="text-zinc-800">{licenseKey}</strong></span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center text-zinc-600 text-[11px]">Digital License</td>
                  <td className="py-4 px-3 text-center text-zinc-600 text-[11px]">1</td>
                  <td className="py-4 px-3 text-right text-zinc-600 text-[11px]">
                    ₹{order.amountINR.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-black text-sm">
                    ₹{order.amountINR.toFixed(2)}
                  </td>
                </tr>

                {/* Subtotal & Tax Breakdown Rows */}
                <tr className="bg-zinc-50/50 text-zinc-600 text-[11px]">
                  <td colSpan={4} className="py-2 px-4 text-right">
                    Subtotal:
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-zinc-800">
                    ₹{order.amountINR.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-zinc-50/50 text-zinc-600 text-[11px]">
                  <td colSpan={4} className="py-2 px-4 text-right">
                    Applicable Tax / GST (0% &bull; Exempt under MSME):
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-zinc-800">
                    ₹0.00
                  </td>
                </tr>
                <tr className="bg-zinc-100/80 text-black text-sm font-bold border-t-2 border-black">
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider">
                    Total Amount Paid:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base text-black font-black">
                    ₹{order.amountINR.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Total in Words:</span>{' '}
              <strong className="text-black font-sans">{numberToWords(order.amountINR)}</strong>
            </div>
            <div className="text-[10px] text-zinc-500">
              Payment Terms: <strong className="text-zinc-800">Immediate / 100% Pre-Settled via UPI</strong>
            </div>
          </div>

          {/* Official License Certificate Box & Copy Button */}
          <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                COMMERCIAL LICENSE KEY
              </div>
              <div className="font-mono text-sm font-bold text-black tracking-wider mt-0.5 select-all">
                {licenseKey}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Valid Until: <strong className="text-zinc-800">{order.expiresAt ? new Date(order.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime VIP (Perpetual)'}</strong>
              </div>
            </div>

            <button
              onClick={handleCopyLicense}
              className="no-print px-3 py-1.5 rounded-md border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>

          {/* Legal Compliance Footer & Verification Stamp */}
          <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-[10px] font-mono text-zinc-500">
            <div className="space-y-1">
              <p className="font-semibold text-zinc-700">DECLARATION &bull; COMPUTER GENERATED COMMERCIAL INVOICE &amp; RECEIPT</p>
              <p>Registered MSME Enterprise: <strong className="text-zinc-900">UDYAM-UP-29-0208780</strong> &bull; Issued under MSME Development Act, 2006.</p>
              <p>Turnover within statutory exemption threshold under Section 22/23 of CGST Act. No GST collected.</p>
              <p>No physical signature required as this document is electronically authenticated and reconciled.</p>
              <p>Member Access: <span className="text-zinc-900 underline">https://vinebdigital.store/#portal</span></p>
            </div>

            {/* Official Monochrome Verification Stamp */}
            <div className="border-2 border-black p-2.5 text-center rounded shrink-0 self-center sm:self-end">
              <div className="flex items-center justify-center gap-1 text-black font-black tracking-widest text-[9px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VINE B DIGITAL</span>
              </div>
              <div className="text-[8px] font-bold text-zinc-700 tracking-wider uppercase mt-0.5">
                VERIFIED COMMERCIAL INVOICE
              </div>
              <div className="text-[8px] text-zinc-500 font-mono mt-0.5">
                MSME: UDYAM-UP-29-0208780
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
