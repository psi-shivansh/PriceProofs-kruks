import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Scale, Check, Clock } from 'lucide-react';

export const EducationalSection: React.FC = () => {
  const traps = [
    {
      title: 'The Delivery Fee Mirage',
      desc: 'Sellers show a lower sticker price on search engines, only to tack on ₹500–₹1,500 in mandatory ground shipping at final checkout.',
      badge: 'Sticker Trap',
    },
    {
      title: 'Hidden Handling & Processing Levies',
      desc: 'Mandatory platform convenience fees, warehouse packaging, and recycling charges quietly appended to your receipt.',
      badge: 'Convenience Trap',
    },
    {
      title: 'Return Shipping & Restocking Penalties',
      desc: 'Advertising "30-day returns", but burying a 15% restocking fee or making the customer pay return freight for open boxes.',
      badge: 'Refund Trap',
    },
    {
      title: 'Conditional Payment Traps',
      desc: 'Discounts that only apply if you open a specific store credit card or subscribe to a paid ₹999/year annual membership.',
      badge: 'Membership Trap',
    },
  ];

  return (
    <section id="why-real-cost" className="my-16 pt-10 border-t border-slate-800">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Why PriceProof Matters
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
          The 4 Hidden Fee Traps of Modern E-Commerce
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
          Online retailers deliberately fragment prices to appear cheaper on algorithmic comparisons.
          PriceProof aggregates all known costs into a single, verified total.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {traps.map((trap, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {trap.badge}
              </span>
            </div>
            <h3 className="font-bold text-white text-base">{trap.title}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{trap.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl bg-slate-950 border border-emerald-500/20 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-xs">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Scale className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold text-white">Our Price Transparency Formula</h4>
          <p className="text-slate-400 mt-0.5">
            <strong>Real Total Cost</strong> = Base Sticker Price + Mandatory Delivery + Platform Fees -
            Unconditional Coupons. Unknown charges are flagged with partial estimates rather than treated as $0.
          </p>
        </div>
      </div>
    </section>
  );
};
