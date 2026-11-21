import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Menu, Bell, CreditCard, MapPin, ArrowUpRight } from 'lucide-react';
import {
  CATALOG_PRODUCTS,
  CatalogProduct,
  MEGA_MENU_CATEGORIES,
  SEARCH_PLACEHOLDERS,
  UserPricePreferences,
  getProductSpread,
} from '../../data/indianCatalog.ts';
import { formatINR } from '../../core/formatters.ts';
import { MonoLink } from './Primitives.tsx';

export type AppView = 'home' | 'category' | 'product';

interface GlobalNavProps {
  currentView: AppView;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string, searchQuery?: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenAiAssistant: () => void;
  onOpenDiagnostics: () => void;
  prefs: UserPricePreferences;
  priceAlerts: Array<{ productId: string; productName: string; targetPrice: number }>;
  onRemoveAlert: (productId: string) => void;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({
  currentView,
  onNavigateHome,
  onNavigateCategory,
  onSelectProduct,
  onOpenAiAssistant,
  onOpenDiagnostics,
  prefs,
  priceAlerts,
  onRemoveAlert,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCatId, setActiveMegaCatId] = useState(MEGA_MENU_CATEGORIES[0].id);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Typewriter rotating placeholder
  const [placeholderText, setPlaceholderText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsProfileOpen(false);
        setIsSearchFocused(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
        setIsProfileOpen(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setPlaceholderText(SEARCH_PLACEHOLDERS[0]);
      return;
    }

    const currentPhrase = SEARCH_PLACEHOLDERS[phraseIndex];
    const delay = isDeleting ? 24 : charIndex === currentPhrase.length ? 2100 : 48;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        setCharIndex((c) => c + 1);
        setPlaceholderText(currentPhrase.slice(0, charIndex + 1));
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex > 0) {
        setCharIndex((c) => c - 1);
        setPlaceholderText(currentPhrase.slice(0, charIndex - 1));
      } else {
        setIsDeleting(false);
        setPhraseIndex((p) => (p + 1) % SEARCH_PLACEHOLDERS.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  const matchingProducts: CatalogProduct[] = searchValue.trim()
    ? CATALOG_PRODUCTS.filter((p) => {
        const q = searchValue.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.listings.some((l) => l.storeName.toLowerCase().includes(q))
        );
      })
    : CATALOG_PRODUCTS.slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) {
      onNavigateCategory('all');
      return;
    }
    if (matchingProducts.length === 1) {
      onSelectProduct(matchingProducts[0].id);
    } else {
      onNavigateCategory('all', trimmed);
    }
    setIsSearchFocused(false);
  };

  const activeMegaCategory =
    MEGA_MENU_CATEGORIES.find((c) => c.id === activeMegaCatId) || MEGA_MENU_CATEGORIES[0];

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md text-[#241E14] border-t-[3px] border-t-[#F5B800] border-b border-[#EFE3B8]"
    >
      {/* Slim compact top bar (h-12 = 48px) */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3 lg:gap-5">
        {/* Left: Compact Wordmark */}
        <button
          type="button"
          onClick={() => {
            setIsMegaMenuOpen(false);
            onNavigateHome();
          }}
          className="flex items-center gap-2 text-left shrink-0 cursor-pointer group"
        >
          <span
            className="w-2.5 h-2.5 rounded-[3px] bg-[#F5B800] group-hover:scale-110 transition-transform shrink-0"
            aria-hidden="true"
          />
          <span className="text-[15px] font-bold tracking-[-0.025em] text-[#241E14] whitespace-nowrap">
            PriceProof
          </span>
        </button>

        {/* Center: Compact Search Bar with Tactile Warm Yellow Hover Effect */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
            <Search className="w-3.5 h-3.5 text-[#857861] group-hover:text-[#9A6700] group-focus-within:text-[#9A6700] absolute left-3 pointer-events-none transition-colors duration-200" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onFocus={() => {
                setIsSearchFocused(true);
                setIsMegaMenuOpen(false);
              }}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={placeholderText || SEARCH_PLACEHOLDERS[0]}
              aria-label="Search products, stores, or return policies"
              className="w-full h-8 pl-8 pr-10 bg-white text-[#241E14] placeholder-[#857861] text-[12px] rounded-full border border-[#E6D496] hover:border-[#EAB308] hover:shadow-[0_4px_14px_-3px_rgba(234,179,8,0.28)] hover:-translate-y-[0.5px] focus:border-[#D99B00] focus:shadow-[0_0_0_3px_rgba(245,184,0,0.2)] outline-none transition-all duration-200"
            />
            {searchValue ? (
              <button
                type="button"
                onClick={() => setSearchValue('')}
                aria-label="Clear search"
                className="absolute right-2.5 p-0.5 text-[#857861] hover:text-[#241E14] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 px-1.5 py-0.5 font-mono text-[9px] text-[#855400] bg-[#FFF8DF] border border-[#EFE3B8] rounded pointer-events-none">
                /
              </kbd>
            )}
          </form>

          {/* Search dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-[38px] bg-white text-[#241E14] border border-[#E6D496] rounded-xl shadow-[0_14px_32px_-8px_rgba(36,30,20,0.14)] overflow-hidden z-50">
              <div className="px-3.5 py-2 bg-[#FFF8DF] border-b border-[#EFE3B8] flex items-center justify-between">
                <span className="mono-eyebrow text-[#855400] text-[10px]">
                  {searchValue.trim() ? 'MATCHING AUDITS' : 'POPULAR TRUE-PRICE AUDITS'}
                </span>
                <span className="font-mono text-[9px] text-[#857861]">ENTER TO SEARCH</span>
              </div>
              <div className="divide-y divide-[#F5ECCB]">
                {matchingProducts.map((product) => {
                  const spread = getProductSpread(product, prefs);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        onSelectProduct(product.id);
                        setIsSearchFocused(false);
                        setSearchValue('');
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-[#FFFDF4] transition-colors text-left cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#241E14] truncate">
                          {product.shortName}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#857861]">
                          {product.categoryName} · BEST ON {spread.lowest.listing.storeName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-[12.5px] font-bold text-[#241E14] tabular-price">
                          {formatINR(spread.lowest.finalPayablePrice)}
                        </p>
                        <p className="font-mono text-[9px] font-semibold text-[#9A6700]">TRUE FINAL</p>
                      </div>
                    </button>
                  );
                })}
                {searchValue.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateCategory('all', searchValue.trim());
                      setIsSearchFocused(false);
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between bg-[#FFF8DF] hover:bg-[#FEF0B8] transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#241E14]">
                      SEARCH LIVE STORES FOR &ldquo;{searchValue.trim()}&rdquo;
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#9A6700]" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Compact Links, Ask AI, Live status, Profile */}
        <nav className="hidden lg:flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsMegaMenuOpen(false);
              onNavigateHome();
            }}
            className={`text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-[#9A6700] ${
              currentView === 'home' ? 'text-[#241E14] font-semibold' : 'text-[#5C5240]'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMegaMenuOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            aria-expanded={isMegaMenuOpen}
            className={`inline-flex items-center gap-1 text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-[#9A6700] ${
              isMegaMenuOpen || currentView === 'category'
                ? 'text-[#241E14] font-semibold'
                : 'text-[#5C5240]'
            }`}
          >
            <span>Categories</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-150 ${
                isMegaMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMegaMenuOpen(false);
              onNavigateCategory('stores');
            }}
            className="text-[12px] font-medium text-[#5C5240] hover:text-[#9A6700] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Stores
          </button>

          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="px-2.5 py-1 rounded-full bg-[#FEF0B8] hover:bg-[#F5B800] text-[#241E14] text-[11.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            ✦ Ask AI
          </button>

          <button
            type="button"
            onClick={onOpenDiagnostics}
            title="Inspect live provider feeds and verification timestamps"
            className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#855400] hover:text-[#241E14] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-[2px] bg-[#EAB308]" aria-hidden="true" />
            <span>LIVE</span>
          </button>

          {/* Compact Profile Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen((p) => !p);
                setIsMegaMenuOpen(false);
              }}
              aria-label="Account preferences and saved price alerts"
              className="relative w-7 h-7 bg-[#FFF8DF] border border-[#D9C37B] hover:border-[#241E14] text-[#241E14] font-mono text-[10px] font-bold flex items-center justify-center rounded-full cursor-pointer transition-colors"
            >
              SM
              {priceAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#F5B800] text-[#241E14] font-mono text-[8px] font-bold flex items-center justify-center">
                  {priceAlerts.length}
                </span>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-9 w-80 bg-white text-[#241E14] border border-[#E6D496] rounded-xl shadow-[0_14px_32px_-8px_rgba(36,30,20,0.14)] overflow-hidden z-50">
                <div className="px-4 py-3 bg-[#FFF8DF] border-b border-[#EFE3B8] flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-[#241E14]">Buyer Profile</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#855400]">
                      INDIA (INR) · PERSONALIZED PRICING
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="p-1 text-[#5C5240] hover:text-[#241E14] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="px-4 py-3 border-b border-[#F5ECCB] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#5C5240]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9A6700]" /> Active Pincode
                    </span>
                    <span className="font-mono font-semibold text-[#241E14]">{prefs.pincode}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5C5240]">
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#9A6700]" /> Selected Card
                    </span>
                    <span className="font-mono font-semibold text-[#241E14]">
                      {prefs.bankCard === 'NONE' ? 'None selected' : prefs.bankCard}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className="mono-eyebrow text-[#855400] flex items-center gap-1.5 mb-2">
                    <Bell className="w-3 h-3 text-[#D99B00]" />
                    <span>SAVED PRICE ALERTS ({priceAlerts.length})</span>
                  </div>
                  {priceAlerts.length === 0 ? (
                    <p className="text-xs text-[#857861] leading-relaxed">
                      No price alerts yet. Click &ldquo;Set price alert&rdquo; on any product page
                      to track drops.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {priceAlerts.map((alert) => (
                        <div
                          key={alert.productId}
                          className="flex items-center justify-between gap-2 py-1.5 border-b border-[#F5ECCB] last:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProduct(alert.productId);
                              setIsProfileOpen(false);
                            }}
                            className="text-left min-w-0 cursor-pointer"
                          >
                            <p className="text-xs font-semibold text-[#241E14] truncate hover:text-[#9A6700]">
                              {alert.productName}
                            </p>
                            <p className="font-mono text-[10px] text-[#9A6700] tabular-price">
                              TARGET ≤ {formatINR(alert.targetPrice)}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveAlert(alert.productId)}
                            aria-label="Remove alert"
                            className="p-1 text-[#857861] hover:text-[#B91C1C] cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile compact actions */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="px-2.5 py-1 rounded-full bg-[#FEF0B8] text-[#241E14] font-mono text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
          >
            ✦ Ask AI
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Open navigation menu"
            className="w-8 h-8 rounded-lg border border-[#E6D496] bg-white flex items-center justify-center text-[#241E14] cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Desktop Mega-Menu (anchored cleanly at top-12) */}
      {isMegaMenuOpen && (
        <div className="hidden lg:block absolute left-0 right-0 top-12 bg-white text-[#241E14] border-b border-[#E6D496] shadow-[0_16px_36px_-12px_rgba(36,30,20,0.12)] z-50">
          <div className="max-w-[1380px] mx-auto grid grid-cols-12">
            <div className="col-span-3 border-r border-[#EFE3B8] bg-[#FFF8DF] py-5">
              <div className="px-6 mb-2.5 mono-eyebrow text-[#855400]">TOP CATEGORIES</div>
              {MEGA_MENU_CATEGORIES.map((cat) => {
                const active = cat.id === activeMegaCategory.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseEnter={() => setActiveMegaCatId(cat.id)}
                    onClick={() => setActiveMegaCatId(cat.id)}
                    className={`w-full px-6 py-2.5 flex items-center justify-between text-left text-[13.5px] font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-white text-[#241E14] border-y border-[#EFE3B8] -mr-px'
                        : 'text-[#5C5240] hover:text-[#241E14]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="font-mono text-xs text-[#9A6700]">{active ? '→' : ''}</span>
                  </button>
                );
              })}
            </div>

            <div className="col-span-9 flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-8 p-7">
                {activeMegaCategory.groups.map((group) => (
                  <div key={group.heading}>
                    <div className="mono-eyebrow text-[#241E14] pb-2 mb-3 border-b border-[#EFE3B8]">
                      {group.heading}
                    </div>
                    <ul className="space-y-2 mb-4">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              if (item.productId) {
                                onSelectProduct(item.productId);
                              } else {
                                onNavigateCategory(item.categoryId);
                              }
                            }}
                            className="text-[13px] text-[#5C5240] hover:text-[#9A6700] hover:underline underline-offset-4 text-left cursor-pointer"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <MonoLink
                      onClick={() => {
                        setIsMegaMenuOpen(false);
                        onNavigateCategory(group.items[0]?.categoryId || 'all');
                      }}
                    >
                      All {group.totalCount}
                    </MonoLink>
                  </div>
                ))}
              </div>

              <div className="px-7 py-3.5 border-t border-[#EFE3B8] bg-[#FFF8DF] flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#5C5240]">
                  <span className="inline-block w-1.5 h-1.5 rounded-[2px] bg-[#EAB308] mr-1.5 align-middle" />
                  13 INDIAN STORES AUDITED DAILY · FEES &amp; RETURN RULES VERIFIED
                </span>
                <MonoLink
                  tone="dark"
                  onClick={() => {
                    setIsMegaMenuOpen(false);
                    onNavigateCategory('all');
                  }}
                >
                  SEE THE FULL DIRECTORY
                </MonoLink>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFDF7] border-t border-[#EFE3B8] px-4 py-3.5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-[#857861] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={SEARCH_PLACEHOLDERS[0]}
              className="w-full h-9 pl-9 pr-3 bg-white border border-[#E6D496] rounded-full text-sm text-[#241E14] outline-none focus:border-[#EAB308]"
            />
          </form>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateHome();
              }}
              className="py-2 px-3 rounded-lg bg-white border border-[#EFE3B8] text-left font-mono text-[11px] uppercase tracking-wider text-[#241E14] cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateCategory('all');
              }}
              className="py-2 px-3 rounded-lg bg-white border border-[#EFE3B8] text-left font-mono text-[11px] uppercase tracking-wider text-[#241E14] cursor-pointer"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateCategory('stores');
              }}
              className="py-2 px-3 rounded-lg bg-white border border-[#EFE3B8] text-left font-mono text-[11px] uppercase tracking-wider text-[#241E14] cursor-pointer"
            >
              Stores Audit
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDiagnostics();
              }}
              className="py-2 px-3 rounded-lg bg-[#FFF8DF] border border-[#E6D496] text-left font-mono text-[11px] uppercase tracking-wider text-[#855400] cursor-pointer"
            >
              ■ Prices Live
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
