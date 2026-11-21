import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  RotateCcw,
  AlertCircle,
  Loader2,
  Square,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import {
  CatalogProduct,
  UserPricePreferences,
  computeProductOffers,
} from '../data/indianCatalog.ts';
import { formatINR } from '../core/formatters.ts';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
  error?: string;
}

interface PriceProofChatbotProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  activeProduct: CatalogProduct | null;
  prefs: UserPricePreferences;
  hasBottomActionBar: boolean;
}

function renderInlineFormatting(line: string): React.ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-[#241E14]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#5C5240]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-[#FFF8DF] border border-[#EFE3B8] text-[#241E14] font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let orderedBuffer: string[] = [];

  const flushBullets = (keyPrefix: number) => {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${keyPrefix}`} className="list-disc pl-4 space-y-1 my-1.5">
        {bulletBuffer.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInlineFormatting(item)}
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  const flushOrdered = (keyPrefix: number) => {
    if (orderedBuffer.length === 0) return;
    blocks.push(
      <ol key={`ol-${keyPrefix}`} className="list-decimal pl-4 space-y-1 my-1.5">
        {orderedBuffer.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInlineFormatting(item)}
          </li>
        ))}
      </ol>
    );
    orderedBuffer = [];
  };

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      flushOrdered(index);
      bulletBuffer.push(trimmed.replace(/^[-*•]\s+/, ''));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      flushBullets(index);
      orderedBuffer.push(trimmed.replace(/^\d+\.\s+/, ''));
    } else if (/^#{1,4}\s+/.test(trimmed)) {
      flushBullets(index);
      flushOrdered(index);
      const headingText = trimmed.replace(/^#{1,4}\s+/, '').replace(/^\*\*|\*\*$/g, '');
      blocks.push(
        <h4
          key={`h-${index}`}
          className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#855400] pt-1.5"
        >
          {renderInlineFormatting(headingText)}
        </h4>
      );
    } else {
      flushBullets(index);
      flushOrdered(index);
      if (trimmed.length === 0) {
        blocks.push(<div key={`gap-${index}`} className="h-1" />);
      } else {
        blocks.push(
          <p key={`p-${index}`} className="leading-relaxed">
            {renderInlineFormatting(rawLine)}
          </p>
        );
      }
    }
  });

  flushBullets(lines.length);
  flushOrdered(lines.length);
  return <div className="space-y-1">{blocks}</div>;
}

export const PriceProofChatbot: React.FC<PriceProofChatbotProps> = ({
  isOpen,
  onToggleOpen,
  activeProduct,
  prefs,
  hasBottomActionBar,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const quickPrompts = useMemo(() => {
    if (activeProduct) {
      return activeProduct.askQuestions.slice(0, 3);
    }
    return [
      'Hidden charges on Flipkart vs Amazon in India?',
      'Which Indian store has the best return policy for laptops?',
      'Is No-Cost EMI actually free after bank processing GST?',
    ];
  }, [activeProduct]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const buildOfferContext = () => {
    if (!activeProduct) return undefined;
    const computed = computeProductOffers(activeProduct, prefs, 'FINAL_PRICE');
    return {
      query: `${activeProduct.name} (Pincode ${prefs.pincode}, Card: ${prefs.bankCard}, COD: ${
        prefs.includeCodFee ? 'ON' : 'OFF'
      }, Mode: ${prefs.paymentMode})`,
      totalOffers: computed.length,
      offers: computed.map((o) => ({
        title: activeProduct.name,
        sellerName: o.listing.storeName,
        basePrice: o.listedPrice,
        knownTotal: o.finalPayablePrice,
        stickerDelta: o.deltaVsListed,
        deliveryLabel: o.deliveryFee === 0 ? 'Free (₹0)' : formatINR(o.deliveryFee),
        mandatoryFeesTotal: o.totalFees,
        mandatoryFeeNames: o.activeFeeLines.map((f) => f.label),
        returnWindowDays: o.listing.returnPolicy.windowDays,
        isFreeReturn: o.listing.returnPolicy.returnShippingSignal === 'good',
        returnShippingCharge: o.listing.returnPolicy.returnShippingSignal === 'good' ? 0 : 249,
        restockingFeePercentage: o.listing.returnPolicy.restockingFeePercent,
        warrantyMonths: 12,
        warrantyCoverage: activeProduct.warrantyNote,
        transparencyGrade:
          o.listing.trustScore >= 85 ? 'A' : o.listing.trustScore >= 75 ? 'B' : 'C',
        completeness: o.listing.returnPolicy.policyFound ? 'COMPLETE' : 'PARTIAL_ESTIMATE',
        isCheapestComparable: o.isBestPrice,
        isDeceptiveSticker: o.hiddenFeesCount > 0 && !o.isBestPrice,
        isLive: false,
        providerName: 'PriceProof Audited Indian Store Catalog',
        warnings: [
          o.listing.returnPolicy.plainEnglishSummary,
          ...(o.hiddenFeesCount > 0
            ? [`${o.hiddenFeesCount} hidden fees (+${formatINR(o.hiddenFeesTotal)})`]
            : []),
        ],
      })),
    };
  };

  const handleStopRequest = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsSending(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.isLoading ? { ...m, isLoading: false, error: 'Request cancelled.' } : m
      )
    );
  };

  const handleResetChat = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsSending(false);
    setMessages([]);
    setLastFailedPrompt(null);
    setInput('');
  };

  const sendMessage = async (rawText: string, isRetry = false) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    setLastFailedPrompt(null);
    setInput('');

    const baseMessages = isRetry
      ? messages.slice(0, Math.max(0, messages.length - 2))
      : messages;

    const historyForRequest: Array<{ role: 'user' | 'model'; text: string }> = [];
    for (let i = 0; i < baseMessages.length; i++) {
      const m = baseMessages[i];
      if (m.error || m.isLoading || !m.text.trim()) continue;
      if (m.role === 'user') {
        const next = baseMessages[i + 1];
        if (next && next.role === 'model' && !next.error && !next.isLoading && next.text.trim()) {
          historyForRequest.push({ role: 'user', text: m.text });
          historyForRequest.push({ role: 'model', text: next.text });
        }
      }
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `model-${Date.now() + 1}`;

    setMessages([
      ...baseMessages,
      { id: userMsgId, role: 'user', text: trimmed },
      { id: assistantMsgId, role: 'model', text: '', isLoading: true },
    ]);

    setIsSending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForRequest,
          context: buildOfferContext(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let payload: { success?: boolean; reply?: string; error?: string } | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !payload.reply) {
        throw new Error(
          payload?.error || `Assistant request failed (HTTP ${response.status}). Please try again.`
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, text: payload!.reply!, isLoading: false } : m
        )
      );
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const errorMessage = isAbort
        ? 'The request took too long or was cancelled. Please try again.'
        : err instanceof Error
        ? err.message
        : 'Unable to reach the PriceProof assistant right now.';

      setLastFailedPrompt(trimmed);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isLoading: false, error: errorMessage } : m
        )
      );
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  return (
    <div
      className={`fixed right-4 sm:right-6 z-50 flex flex-col items-end ${
        hasBottomActionBar ? 'bottom-20' : 'bottom-5'
      }`}
    >
      {isOpen && (
        <div
          role="dialog"
          aria-label="PriceProof AI Price & Policy Assistant"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[410px] h-[520px] max-h-[75vh] bg-white border border-[#E6D496] rounded-2xl shadow-[0_18px_46px_-12px_rgba(154,103,0,0.28)] flex flex-col overflow-hidden"
        >
          {/* Cozy Sunbeam Header */}
          <div className="px-4 py-3.5 bg-[#FEF0B8] text-[#241E14] border-b border-[#E6D496] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-[2px] bg-[#F5B800] shrink-0" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-[0.1em] truncate">
                  PRICEPROOF AI ADVISOR
                </h3>
              </div>
              <p className="text-[11px] text-[#5C5240] truncate mt-0.5">
                {activeProduct
                  ? `Auditing: ${activeProduct.shortName} · PIN ${prefs.pincode}`
                  : 'Ask about hidden fees, bank offers & return policies'}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear chat history"
                  className="p-1.5 rounded-lg text-[#5C5240] hover:text-[#241E14] hover:bg-[#F5B800]/30 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleOpen}
                title="Minimize assistant"
                aria-label="Minimize assistant"
                className="p-1.5 rounded-lg text-[#5C5240] hover:text-[#241E14] hover:bg-[#F5B800]/30 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-[#FFFDF7]">
            {/* Greeting */}
            <div className="p-3.5 bg-white border border-[#EFE3B8] rounded-xl text-xs text-[#241E14] space-y-1.5">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#855400]">
                ■ READY TO AUDIT
              </div>
              <p className="leading-relaxed text-[#5C5240]">
                Ask me what you&rsquo;ll <strong className="text-[#241E14]">actually pay</strong>{' '}
                after hidden fees, which card saves the most, or what happens if you return a
                defective item.
              </p>
            </div>

            {messages.length === 0 && (
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#857861]">
                  QUICK QUESTIONS
                </div>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      disabled={isSending}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-white border border-[#EFE3B8] text-[#241E14] hover:bg-[#FEF0B8] hover:border-[#F5B800] transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isLatest = idx === messages.length - 1;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3.5 py-2.5 text-xs max-w-[88%] rounded-xl ${
                      isUser
                        ? 'bg-[#F5B800] text-[#241E14] font-medium border border-[#DDA300]'
                        : 'bg-white border border-[#EFE3B8] text-[#241E14]'
                    }`}
                  >
                    {msg.error ? (
                      <div className="space-y-2 text-[#991B1B]">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{msg.error}</span>
                        </div>
                        {isLatest && lastFailedPrompt && (
                          <button
                            type="button"
                            onClick={() => sendMessage(lastFailedPrompt, true)}
                            className="font-mono text-[10px] font-bold uppercase text-[#855400] hover:text-[#241E14] underline cursor-pointer"
                          >
                            TRY AGAIN →
                          </button>
                        )}
                      </div>
                    ) : msg.isLoading ? (
                      <div className="flex items-center gap-2 text-[#5C5240] font-mono text-[11px] py-0.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9A6700]" />
                        <span>Checking fees &amp; return rules...</span>
                      </div>
                    ) : isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <FormattedMessage text={msg.text} />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-[#EFE3B8] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fees, COD, or return policies..."
              disabled={isSending}
              aria-label="Message PriceProof Assistant"
              className="flex-1 h-10 px-3 rounded-xl bg-[#FFFDF7] border border-[#E6D496] hover:border-[#F5B800] focus:bg-white focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/30 text-xs text-[#241E14] placeholder-[#857861] outline-none transition-all"
            />
            {isSending ? (
              <button
                type="button"
                onClick={handleStopRequest}
                aria-label="Cancel request"
                className="h-10 w-10 rounded-xl bg-[#FEE2E2] border border-[#B91C1C]/40 text-[#991B1B] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="h-10 w-10 rounded-xl bg-[#F5B800] hover:bg-[#EAB308] disabled:opacity-40 text-[#241E14] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Cozy Honey-Gold Launcher Button */}
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close PriceProof Assistant' : 'Open PriceProof Assistant'}
        className={`h-11 px-4 rounded-xl border font-mono text-[11px] font-bold uppercase tracking-[0.09em] inline-flex items-center gap-2 transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-white text-[#241E14] border-[#E6D496] hover:bg-[#FFF8DF] hover:border-[#F5B800] shadow-sm'
            : 'bg-[#F5B800] text-[#241E14] border-[#DDA300] hover:bg-[#FACC15] hover:-translate-y-0.5 shadow-[0_8px_22px_-6px_rgba(234,179,8,0.55)]'
        }`}
      >
        {isOpen ? (
          <>
            <X className="w-3.5 h-3.5" />
            <span>CLOSE AI</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-3.5 h-3.5 text-[#241E14]" />
            <span>✦ ASK AI</span>
          </>
        )}
      </button>
    </div>
  );
};
