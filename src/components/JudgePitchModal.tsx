import React, { useState } from 'react';
import {
  X,
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Terminal,
  Server,
  Layers,
  Flame,
} from 'lucide-react';

interface JudgePitchModalProps {
  onClose: () => void;
  onSelectDemoSearch: (query: string) => void;
}

export const JudgePitchModal: React.FC<JudgePitchModalProps> = ({
  onClose,
  onSelectDemoSearch,
}) => {
  const [copied, setCopied] = useState(false);
  const liveUrl = 'https://ais-pre-6hy3zzc3s7krcuwzbp3ics-766253094177.asia-northeast1.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Hackathon Presentation & Pitch Guide</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Judges Walkthrough
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Elevator pitch, killer demo walkthrough, live hosting URLs, and technical answers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Section 1: Live Hosted URL */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">Your Live Deployed URL (Ready for Judges!)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Cloud Run Active
              </span>
            </div>
            <p className="text-slate-400 mb-2.5">
              This web app is already hosted on Google Cloud Run and can be viewed directly on laptops and mobile phones without running local servers:
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200 text-xs">
              <span className="truncate flex-1 select-all">{liveUrl}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                title="Open live link in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Section 2: 30-Second Elevator Pitch */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>30-Second Pitch Script to Recite to Judges</span>
            </div>
            <blockquote className="p-3 rounded-xl bg-slate-900 border-l-2 border-emerald-500 text-slate-200 italic leading-relaxed">
              "E-commerce platforms trick consumers using deceptive 'sticker prices'—advertising an item for ₹26,990 on search engines, but adding ₹499 delivery, ₹149 handling, and ₹350 return shipping at checkout. <strong>PriceProof</strong> calculates the true out-of-pocket cost across sellers, detects deceptive sticker traps automatically, and gives buyers complete fee transparency."
            </blockquote>
          </div>

          {/* Section 3: Recommended 4-Step Live Demo */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Step-by-Step Demo Flow to Show</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => {
                  onSelectDemoSearch('wireless headphones');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                  <span>1. Show Sticker Trap Demo</span>
                  <span className="text-[10px] text-emerald-400">Click to Demo →</span>
                </div>
                <p className="text-slate-400 mt-1">
                  Search <em>"wireless headphones"</em>: Seller A looks cheaper (₹26,990), but Seller B (₹27,490) wins the real comparison because Seller B has free shipping and zero hidden fees!
                </p>
              </div>

              <div
                onClick={() => {
                  onSelectDemoSearch('gaming mouse');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                  <span>2. Gaming Mouse Comparison</span>
                  <span className="text-[10px] text-emerald-400">Click to Demo →</span>
                </div>
                <p className="text-slate-400 mt-1">
                  Search <em>"gaming mouse"</em>: Highlight the amber banner <strong>"Sticker Price Trap Detected"</strong> where ₹990 shipping turns a cheap mouse into the most expensive one.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">3. Fee Receipt & Policy Audit</div>
                <p className="text-slate-400 mt-1">
                  Click <strong>"Inspect All Fees & Terms"</strong> on any card to show the itemized financial receipt, restocking fee warnings, and 30-day return policy breakdown.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">4. Side-by-Side Matrix</div>
                <p className="text-slate-400 mt-1">
                  Check two or three offers and click <strong>"Compare Selected"</strong> to display the full comparison matrix across shipping, return fees, and warranty terms.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Answering "Can we call websites from the browser without API keys?" */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How to Answer Judges on "Can you scrape prices from the browser directly?"</span>
            </div>
            <div className="space-y-2 text-slate-300">
              <p>
                If judges ask why you don't directly scrape Amazon/Flipkart from client-side JavaScript in the browser:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>
                  <strong className="text-slate-200">Browser CORS Restriction:</strong> Browsers strictly block cross-origin requests (`fetch('amazon.in')`) via the Same-Origin Policy.
                </li>
                <li>
                  <strong className="text-slate-200">WAF & Anti-Bot Protection:</strong> Amazon and Flipkart employ sophisticated anti-bot systems (Cloudflare/Akamai/CAPTCHAs) that block unauthorized scrapers.
                </li>
                <li>
                  <strong className="text-slate-200">How PriceProof Solves It Reliably:</strong> We use a backend provider adapter architecture. For real-time live data without API keys, we integrate the <strong>Open E-Commerce API (DummyJSON)</strong>, which makes genuine, unblocked live HTTP requests and reports real network latency! For Amazon/Flipkart, official adapters are implemented with AWS SigV4 / Affiliate token support.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5: Alternative Hosting Options (Vercel, Render, Railway) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Alternative Free Hosting Platforms</span>
            </div>
            <p className="text-slate-400">
              If you also want to push to your GitHub and host on Render or Railway:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">Render.com (Free Web Service)</div>
                <div>Build: <code>npm run build</code></div>
                <div>Start: <code>npm run start</code></div>
                <div>Port: <code>3000</code> or auto</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1">Railway.app / Koyeb</div>
                <div>1-click Deploy from GitHub</div>
                <div>Command: <code>tsx server.ts</code></div>
                <div>Node version: 18+ or 20+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Good luck with your hackathon presentation!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Got it, Let's Present!
          </button>
        </div>
      </div>
    </div>
  );
};
