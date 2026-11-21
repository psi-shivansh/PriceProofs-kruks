import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ImageOff } from 'lucide-react';
import { formatINR } from '../../core/formatters.ts';

/**
 * Animated INR price counter for live recalculations.
 */
export const AnimatedINR: React.FC<{
  value: number;
  className?: string;
}> = ({ value, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      prevValueRef.current = end;
      setDisplayValue(end);
      return;
    }

    const duration = 260;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = end;
        setDisplayValue(end);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <span className={`tabular-price ${className}`}>{formatINR(displayValue)}</span>;
};

/**
 * Cozy Yellow & White Status / Metadata Badge
 */
export const EditorialBadge: React.FC<{
  variant: 'dark' | 'green' | 'green-outline' | 'amber' | 'red' | 'light';
  withGreenSquare?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ variant, withGreenSquare = false, children, className = '' }) => {
  const styles: Record<typeof variant, string> = {
    dark: 'bg-[#241E14] text-[#FFFDF7] border border-[#241E14]',
    green: 'bg-[#F5B800] text-[#241E14] border border-[#DDA300]',
    'green-outline': 'bg-[#FFF8DF] text-[#855400] border border-[#E5C666]',
    amber: 'bg-[#FEF3C7] text-[#92400E] border border-[#D99B00]/50',
    red: 'bg-[#FEE2E2] text-[#991B1B] border border-[#B91C1C]/35',
    light: 'bg-[#FFFDF7] text-[#5C5240] border border-[#EFE3B8]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap shrink-0 ${styles[variant]} ${className}`}
    >
      {withGreenSquare && (
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-1.5 rounded-[2px] bg-[#EAB308] shrink-0"
        />
      )}
      {children}
    </span>
  );
};

/**
 * Cozy Honey-Gold Mono Action Link
 */
export const MonoLink: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  tone?: 'green' | 'dark' | 'white';
  className?: string;
}> = ({ children, onClick, href, external = false, tone = 'green', className = '' }) => {
  const toneClasses = {
    green: 'text-[#9A6700] hover:text-[#241E14]',
    dark: 'text-[#241E14] hover:text-[#9A6700]',
    white: 'text-[#FFFDF7] hover:text-[#FDE047]',
  }[tone];

  const baseClass = `inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.09em] underline-offset-4 hover:underline transition-colors cursor-pointer whitespace-nowrap shrink-0 ${toneClasses} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={baseClass}
      >
        <span>{children}</span>
        {external ? <ArrowUpRight className="w-3.5 h-3.5" /> : <span aria-hidden="true">→</span>}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClass}>
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </button>
  );
};

/**
 * Editorial Section Header with warm honey-gold accent
 */
export const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  rightSlot?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, dark = false, rightSlot }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
    <div className="max-w-2xl">
      <div
        className={`mono-eyebrow flex items-center gap-2 mb-2 ${
          dark ? 'text-[#855400]' : 'text-[#855400]'
        }`}
      >
        <span className="inline-block w-2 h-2 rounded-[2px] bg-[#F5B800]" aria-hidden="true" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.025em] leading-[1.14] [text-wrap:balance] text-[#241E14]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-[15px] leading-relaxed max-w-xl text-[#5C5240]">
          {subtitle}
        </p>
      )}
    </div>
    {rightSlot && <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>}
  </div>
);

/**
 * Cozy White Arrow Buttons with warm yellow hover
 */
export const CarouselArrows: React.FC<{
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
}> = ({ onPrev, onNext, prevLabel = 'Previous', nextLabel = 'Next' }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={onPrev}
      aria-label={prevLabel}
      className="w-9 h-9 bg-white text-[#241E14] border border-[#D9C37B] rounded-lg flex items-center justify-center hover:bg-[#F5B800] hover:border-[#F5B800] transition-all duration-150 cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
    <button
      type="button"
      onClick={onNext}
      aria-label={nextLabel}
      className="w-9 h-9 bg-white text-[#241E14] border border-[#D9C37B] rounded-lg flex items-center justify-center hover:bg-[#F5B800] hover:border-[#F5B800] transition-all duration-150 cursor-pointer"
    >
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

/**
 * Resilient Studio Image with warm cream fallback
 */
export const StudioImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}> = ({ src, alt, className = 'w-full h-full object-cover', containerClassName = '' }) => {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`bg-[#FFF8DF] flex flex-col items-center justify-center gap-2 text-[#5C5240] p-4 ${containerClassName}`}
      >
        <ImageOff className="w-6 h-6 opacity-50" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-center">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
};

/**
 * Store Monogram Mark
 */
export const StoreMonogram: React.FC<{
  shortCode: string;
  bg: string;
  text: string;
  size?: 'sm' | 'md';
}> = ({ shortCode, bg, text, size = 'md' }) => (
  <span
    style={{ backgroundColor: bg, color: text }}
    className={`inline-flex items-center justify-center font-mono font-bold uppercase tracking-tight rounded-md shrink-0 ${
      size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-[11px]'
    }`}
  >
    {shortCode}
  </span>
);
