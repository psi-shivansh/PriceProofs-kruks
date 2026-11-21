import React from 'react';
import { X, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { ProviderDiagnostic } from '../types/product.ts';
import { EditorialBadge } from './editorial/Primitives.tsx';

interface ProviderDiagnosticsModalProps {
  diagnostics: ProviderDiagnostic[];
  onClose: () => void;
}

export const ProviderDiagnosticsModal: React.FC<ProviderDiagnosticsModalProps> = ({
  diagnostics,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241E14]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Data sources and provider diagnostics"
    >
      <div className="relative w-full max-w-3xl bg-white border border-[#E6D496] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cozy Sunbeam Header */}
        <div className="px-5 py-4 bg-[#FEF0B8] text-[#241E14] border-b border-[#E6D496] flex items-start justify-between gap-4">
          <div>
            <div className="mono-eyebrow text-[#855400]">
              ■ VERIFICATION &amp; DATA ATTRIBUTION
            </div>
            <h2 className="text-lg font-bold text-[#241E14] mt-0.5">
              Data Providers &amp; Authorized Feeds
            </h2>
            <p className="text-xs text-[#5C5240] mt-0.5">
              Transparent disclosure of live APIs, audited reference catalogs, and partner credentials
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close diagnostics"
            className="w-8 h-8 rounded-lg bg-white border border-[#E6D496] text-[#241E14] flex items-center justify-center hover:bg-[#F5B800] hover:border-[#F5B800] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 bg-[#FFFDF7]">
          <div className="p-4 bg-[#FFF8DF] border border-[#EFE3B8] rounded-xl text-xs text-[#5C5240]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#241E14] mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9A6700]" />
              <span>COMPLIANCE &amp; ZERO-SCRAPING GUARANTEE</span>
            </div>
            PriceProof respects platform terms of service. Live store feeds require authorised
            affiliate or partner API credentials configured on the server; curated Indian store fee
            &amp; return audits are clearly separated and timestamped.
          </div>

          <div className="space-y-3">
            {diagnostics.map((provider) => {
              const isActive = provider.status === 'ACTIVE';
              const isDemo = provider.status === 'DEMO';
              const requiresAuth = provider.status === 'REQUIRES_AUTH';

              return (
                <div
                  key={provider.id}
                  className="p-4 bg-white border border-[#EFE3B8] rounded-xl space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#241E14] text-sm">{provider.name}</h3>
                        {isActive && (
                          <EditorialBadge variant="green-outline" withGreenSquare>
                            ACTIVE LIVE
                          </EditorialBadge>
                        )}
                        {isDemo && <EditorialBadge variant="light">AUDITED DEMO</EditorialBadge>}
                        {requiresAuth && (
                          <EditorialBadge variant="amber">REQUIRES CREDENTIALS</EditorialBadge>
                        )}
                      </div>
                      <p className="text-xs text-[#5C5240] mt-1">{provider.description}</p>
                    </div>

                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A6700] hover:text-[#241E14] hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      <span>API DOCS</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="text-xs space-y-1.5 pt-2.5 border-t border-[#EFE3B8]">
                    <div className="flex items-start gap-2 text-[#5C5240]">
                      <Key className="w-3.5 h-3.5 mt-0.5 text-[#857861] shrink-0" />
                      <span>
                        <strong className="text-[#241E14]">Auth Method:</strong>{' '}
                        {provider.authMethod}
                      </span>
                    </div>

                    {provider.requiredEnvVars.length > 0 && (
                      <div className="pl-5">
                        <div className="text-[#5C5240] font-semibold mb-1">
                          Required Server Environment Variables:
                        </div>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                          {provider.requiredEnvVars.map((v, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-[#FFF8DF] border border-[#EFE3B8] text-[#92400E]"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pl-5 text-[11px] text-[#857861]">
                      <strong className="text-[#241E14]">Supported Regions:</strong>{' '}
                      {provider.supportedRegions.join(', ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#EFE3B8] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#F5B800] hover:bg-[#EAB308] text-[#241E14] font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
