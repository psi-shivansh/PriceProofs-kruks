import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Square,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Offer, SearchResultResponse } from '../types/product.ts';
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
  currentQuery: string;
  searchResponse: SearchResultResponse | null;
  visibleOffers: Offer[];
  hasFloatingCompareButton: boolean;
}

/**
 * Safe inline markdown renderer (**bold**, *italic*, `code`) without raw HTML injection.
 */
function renderInlineFormatting(line: string): React.ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[11px]"
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
        <h4 key={`h-${index}`} className="font-bold text-emerald-300 text-xs pt-1.5">
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
  currentQuery,
  searchResponse,
  visibleOffers,
  hasFloatingCompareButton,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const quickPrompts = useMemo(() => {
    if (visibleOffers.length > 0) {
      return [
        'Which offer is actually cheapest overall?',
        'Are there any sticker traps or hidden fees here?',
        'Compare return policies and warranties',
        'Which seller gives the safest overall value?',
      ];
    }
    return [
      'How does PriceProof calculate real total cost?',
      'What is a deceptive sticker price trap?',
      'What should I check before buying electronics online?',
    ];
  }, [visibleOffers.length]);

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
    const offers = visibleOffers.slice(0, 12).map((o) => {
      const mandatoryFeesTotal = o.mandatoryFees.reduce(
        (sum, f) => sum + (f.isUnknown ? 0 : f.amount),
        0
      );
      const deliveryLabel = o.delivery.isUnknown
        ? 'Undisclosed until pincode/checkout'
        : o.delivery.isFree
        ? 'Free (₹0)'
        : formatINR(o.delivery.fee);

      return {
        title: o.title,
        sellerName: o.seller.name,
        basePrice: o.basePrice,
        knownTotal: o.totalCostCalculation.knownTotal,
        stickerDelta: o.totalCostCalculation.stickerDelta,
        deliveryLabel,
        mandatoryFeesTotal,
        mandatoryFeeNames: o.mandatoryFees.map((f) => f.name),
        returnWindowDays: o.returnPolicy.windowDays,
        isFreeReturn: o.returnPolicy.isFreeReturn,
        returnShippingCharge: o.returnPolicy.shippingCharge,
        restockingFeePercentage: o.returnPolicy.restockingFeePercentage,
        warrantyMonths: o.warranty.durationMonths,
        warrantyCoverage: o.warranty.coverage,
        transparencyGrade: o.totalCostCalculation.transparencyGrade,
        completeness: o.totalCostCalculation.completeness,
        isCheapestComparable: o.totalCostCalculation.isCheapestComparable,
        isDeceptiveSticker: o.totalCostCalculation.isDeceptiveSticker,
        isLive: o.dataSource.isLive,
        providerName: o.dataSource.providerName,
        warnings: o.totalCostCalculation.warnings,
      };
    });

    return {
      query: searchResponse?.query || currentQuery,
      totalOffers: searchResponse?.totalOffers || visibleOffers.length,
      offers,
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

    // Build clean history only from completed user/model pairs (never include errored/orphan turns)
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
          m.id === assistantMsgId
            ? { ...m, text: payload!.reply!, isLoading: false }
            : m
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
          m.id === assistantMsgId
            ? { ...m, isLoading: false, error: errorMessage }
            : m
        )
      );
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className={`fixed right-5 z-50 flex flex-col items-end ${
        hasFloatingCompareButton ? 'bottom-20' : 'bottom-5'
      }`}
    >
      {/* Expanded Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="PriceProof Shopping Assistant"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[540px] max-h-[78vh] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/70 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white truncate">
                    PriceProof Assistant
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {visibleOffers.length > 0
                    ? `Context: "${searchResponse?.query || currentQuery}" (${visibleOffers.length} offers)`
                    : 'Ask about fees, returns & true totals'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear chat history"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleOpen}
                title="Minimize assistant"
                aria-label="Minimize assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-slate-950/40">
            {/* Initial Greeting */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 max-w-[85%] space-y-2">
                <p className="leading-relaxed">
                  Hi! I can help you compare the{' '}
                  <strong className="text-white">real out-of-pocket cost</strong> of the offers
                  on screen, flag hidden delivery or restocking fees, and weigh warranty terms.
                </p>
                {visibleOffers.length > 0 && (
                  <p className="text-[11px] text-emerald-300/90">
                    I can see {visibleOffers.length} compared offers for{' '}
                    <span className="font-semibold">"{searchResponse?.query || currentQuery}"</span>.
                  </p>
                )}
              </div>
            </div>

            {/* Starter Prompts when conversation is fresh */}
            {messages.length === 0 && (
              <div className="pl-9 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={isSending}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Chat History */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isLatestMessage = idx === messages.length - 1;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start items-start gap-2.5'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs max-w-[85%] ${
                      isUser
                        ? 'rounded-tr-sm bg-emerald-500 text-slate-950 font-medium'
                        : 'rounded-tl-sm bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.error ? (
                      <div className="space-y-2 text-rose-300">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{msg.error}</span>
                        </div>
                        {isLatestMessage && lastFailedPrompt && (
                          <button
                            type="button"
                            onClick={() => sendMessage(lastFailedPrompt, true)}
                            className="text-[11px] font-semibold text-white underline hover:no-underline cursor-pointer"
                          >
                            Try again
                          </button>
                        )}
                      </div>
                    ) : msg.isLoading ? (
                      <div className="flex items-center gap-2 text-slate-400 py-0.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Analyzing offers & fees...</span>
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
            onSubmit={handleSubmit}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fees, returns, or best value..."
              disabled={isSending}
              aria-label="Message PriceProof Assistant"
              className="flex-1 h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-400 outline-none transition-colors"
            />
            {isSending ? (
              <button
                type="button"
                onClick={handleStopRequest}
                title="Cancel request"
                aria-label="Cancel request"
                className="h-10 w-10 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                title="Send message"
                aria-label="Send message"
                className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 flex items-center justify-center shrink-0 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close PriceProof Assistant' : 'Open PriceProof Assistant'}
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer border ${
          isOpen
            ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-emerald-500 border-emerald-400 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/30'
        }`}
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4 text-slate-400" />
            <span>Close Assistant</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            <span>Ask PriceProof</span>
          </>
        )}
      </button>
    </div>
  );
};
