/**
 * PriceProof — Editorial Store-Comparison & Price-Truth Web App (India / INR)
 * Reveals the true final payable price and return/refund reality across Indian stores.
 */

import React, { useState, useEffect } from 'react';
import { GlobalNav, AppView } from './components/editorial/GlobalNav.tsx';
import { HomeView } from './components/editorial/HomeView.tsx';
import { CategoryListingView } from './components/editorial/CategoryListingView.tsx';
import { ProductComparisonView } from './components/editorial/ProductComparisonView.tsx';
import { PriceProofChatbot } from './components/PriceProofChatbot.tsx';
import { ProviderDiagnosticsModal } from './components/ProviderDiagnosticsModal.tsx';
import {
  CATALOG_PRODUCTS,
  UserPricePreferences,
} from './data/indianCatalog.ts';
import { ProviderDiagnostic } from './types/product.ts';

interface SavedPriceAlert {
  productId: string;
  productName: string;
  targetPrice: number;
}

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const [activeProductId, setActiveProductId] = useState<string>(CATALOG_PRODUCTS[0].id);

  // User personalisation preferences (persisted live across all pages)
  const [prefs, setPrefs] = useState<UserPricePreferences>({
    pincode: '400001',
    bankCard: 'HDFC',
    includeCodFee: false,
    applyAllCoupons: true,
    paymentMode: 'FULL',
  });

  // Saved price alerts
  const [priceAlerts, setPriceAlerts] = useState<SavedPriceAlert[]>([]);

  // Global overlays
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ProviderDiagnostic[]>([]);

  useEffect(() => {
    fetch('/api/providers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.providers) setDiagnostics(data.providers);
      })
      .catch(() => {
        // Silently ignore if diagnostics endpoint is unavailable
      });
  }, []);

  const handleUpdatePrefs = (patch: Partial<UserPricePreferences>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  };

  const navigateHome = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateCategory = (categoryId: string, searchQuery = '') => {
    setActiveCategoryId(categoryId);
    setCategorySearchQuery(searchQuery);
    setView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectProduct = (productId: string) => {
    setActiveProductId(productId);
    setView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetPriceAlert = (productId: string, productName: string, targetPrice: number) => {
    setPriceAlerts((prev) => {
      const without = prev.filter((a) => a.productId !== productId);
      return [...without, { productId, productName, targetPrice }];
    });
  };

  const handleRemoveAlert = (productId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.productId !== productId));
  };

  const activeProduct =
    CATALOG_PRODUCTS.find((p) => p.id === activeProductId) || CATALOG_PRODUCTS[0];
  const activeAlert = priceAlerts.find((a) => a.productId === activeProduct.id);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#241E14] flex flex-col">
      {/* Slim Cozy Yellow & White Top Nav */}
      <GlobalNav
        currentView={view}
        onNavigateHome={navigateHome}
        onNavigateCategory={navigateCategory}
        onSelectProduct={selectProduct}
        onOpenAiAssistant={() => setIsChatOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        prefs={prefs}
        priceAlerts={priceAlerts}
        onRemoveAlert={handleRemoveAlert}
      />

      {/* Active Page View */}
      <main className="flex-1">
        {view === 'home' && (
          <HomeView
            prefs={prefs}
            onSelectProduct={selectProduct}
            onSelectCategory={(catId, q) => navigateCategory(catId, q)}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
            onOpenAiAssistant={() => setIsChatOpen(true)}
          />
        )}

        {view === 'category' && (
          <CategoryListingView
            initialCategoryId={activeCategoryId}
            initialSearchQuery={categorySearchQuery}
            prefs={prefs}
            onSelectProduct={selectProduct}
            onNavigateHome={navigateHome}
          />
        )}

        {view === 'product' && (
          <ProductComparisonView
            key={activeProduct.id}
            product={activeProduct}
            prefs={prefs}
            onUpdatePrefs={handleUpdatePrefs}
            onNavigateHome={navigateHome}
            onNavigateCategory={(catId) => navigateCategory(catId)}
            existingAlertPrice={activeAlert?.targetPrice}
            onSetPriceAlert={handleSetPriceAlert}
          />
        )}
      </main>

      {/* Cozy Butter-Yellow & White Footer */}
      <footer
        className={`bg-[#FFF8DF] text-[#241E14] border-t border-[#E6D496] ${
          view === 'product' ? 'pb-20' : ''
        }`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-11">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-9 border-b border-[#EFE3B8]">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F5B800]" aria-hidden="true" />
                <span className="text-base font-bold tracking-[-0.03em] text-[#241E14]">
                  PRICEPROOF
                </span>
              </div>
              <p className="text-sm text-[#5C5240] max-w-sm leading-relaxed">
                Independent true-price and return-policy audits across Indian online stores. We
                never take sponsored placements or hide checkout surcharges.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <div className="mono-eyebrow text-[#855400]">EXPLORE</div>
              <ul className="space-y-2 text-sm text-[#5C5240]">
                <li>
                  <button
                    type="button"
                    onClick={navigateHome}
                    className="hover:text-[#9A6700] transition-colors cursor-pointer"
                  >
                    Home &amp; Biggest Gaps
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateCategory('all')}
                    className="hover:text-[#9A6700] transition-colors cursor-pointer"
                  >
                    All Audited Categories
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateCategory('stores')}
                    className="hover:text-[#9A6700] transition-colors cursor-pointer"
                  >
                    Indian Store Audits
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => selectProduct('macbook-pro-16-m4')}
                    className="hover:text-[#9A6700] transition-colors cursor-pointer"
                  >
                    Featured Comparison (MacBook Pro)
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-2.5">
              <div className="mono-eyebrow text-[#855400]">TRANSPARENCY &amp; TOOLS</div>
              <ul className="space-y-2 text-sm text-[#5C5240]">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsDiagnosticsOpen(true)}
                    className="hover:text-[#9A6700] transition-colors cursor-pointer"
                  >
                    Data Sources &amp; Provider Diagnostics
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="hover:text-[#9A6700] transition-colors cursor-pointer"
                  >
                    ✦ Ask PriceProof AI Advisor
                  </button>
                </li>
                <li className="text-xs text-[#857861] pt-1">
                  Currency: INR (₹) · Press{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#FEF0B8] border border-[#E6D496] text-[#241E14] font-mono text-[10px]">
                    /
                  </kbd>{' '}
                  anywhere to search.
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.09em] text-[#857861]">
            <span>© {new Date().getFullYear()} PRICEPROOF INDIA · PRICE-TRUTH &amp; POLICY COMPARISON</span>
            <span className="text-[#855400] font-semibold">
              ■ ZERO SPONSORED RANKINGS · INR AUDITED
            </span>
          </div>
        </div>
      </footer>

      {/* Provider Diagnostics Modal */}
      {isDiagnosticsOpen && (
        <ProviderDiagnosticsModal
          diagnostics={diagnostics}
          onClose={() => setIsDiagnosticsOpen(false)}
        />
      )}

      {/* Editorial AI Shopping Assistant Drawer */}
      <PriceProofChatbot
        isOpen={isChatOpen}
        onToggleOpen={() => setIsChatOpen((o) => !o)}
        activeProduct={view === 'product' ? activeProduct : null}
        prefs={prefs}
        hasBottomActionBar={view === 'product'}
      />
    </div>
  );
}
