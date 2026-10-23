import React from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { ProviderDiagnostic } from '../types/product.ts';

interface ProviderDiagnosticsModalProps {
  diagnostics: ProviderDiagnostic[];
  onClose: () => void;
}

export const ProviderDiagnosticsModal: React.FC<ProviderDiagnosticsModalProps> = ({
  diagnostics,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Data Providers & API Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Authorized provider integrations, authentication methods, and configuration status
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
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
            <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Compliance & Anti-Scraping Guarantee</span>
            </div>
            PriceProof respects platforms' terms of service. We do not use unauthorized screen scraping,
            fabricated live results, or spoofed bot headers. All live data is fetched through authorized REST APIs
            or verified publisher feeds.
          </div>

          <div className="space-y-3">
            {diagnostics.map((provider) => {
              const isActive = provider.status === 'ACTIVE';
              const isDemo = provider.status === 'DEMO';
              const requiresAuth = provider.status === 'REQUIRES_AUTH';

              return (
                <div
                  key={provider.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{provider.name}</h3>
                        {isActive && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            ACTIVE LIVE
                          </span>
                        )}
                        {isDemo && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            DEMO SIMULATION
                          </span>
                        )}
                        {requiresAuth && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            REQUIRES CREDENTIALS
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{provider.description}</p>
                    </div>

                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>API Docs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Authentication & Env Vars */}
                  <div className="text-xs space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex items-start gap-2 text-slate-400">
                      <Key className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" />
                      <span>
                        <strong className="text-slate-300">Auth Method:</strong> {provider.authMethod}
                      </span>
                    </div>

                    {provider.requiredEnvVars.length > 0 && (
                      <div className="pl-5">
                        <div className="text-slate-400 font-semibold mb-1">Required Environment Variables:</div>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                          {provider.requiredEnvVars.map((v, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pl-5 text-[11px] text-slate-400">
                      <strong>Supported Regions:</strong> {provider.supportedRegions.join(', ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
