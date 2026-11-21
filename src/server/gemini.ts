/**
 * Server-side Gemini Chat Service for PriceProof Shopping Assistant
 * Uses @google/genai strictly on the backend with GEMINI_API_KEY from process.env.
 */

import { GoogleGenAI, ThinkingLevel, GenerateContentResponse } from '@google/genai';
import { formatINR } from '../core/formatters.ts';

export interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatOfferSummary {
  title: string;
  sellerName: string;
  basePrice: number;
  knownTotal: number;
  stickerDelta: number;
  deliveryLabel: string;
  mandatoryFeesTotal: number;
  mandatoryFeeNames: string[];
  returnWindowDays: number;
  isFreeReturn: boolean;
  returnShippingCharge: number;
  restockingFeePercentage?: number;
  warrantyMonths: number;
  warrantyCoverage: string;
  transparencyGrade: string;
  completeness: string;
  isCheapestComparable?: boolean;
  isDeceptiveSticker?: boolean;
  isLive: boolean;
  providerName: string;
  warnings: string[];
}

export interface ChatProductContext {
  query?: string;
  totalOffers?: number;
  offers?: ChatOfferSummary[];
}

const CHAT_MODEL = 'gemini-4-hydrogen';

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | undefined;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add a valid Gemini API key in Settings > Secrets.'
    );
  }

  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    cachedApiKey = apiKey;
  }

  return cachedClient;
}

/**
 * Formats an upstream Gemini API error into a clear, actionable client-facing error.
 */
export function formatGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err ?? 'Unknown error');
  const lower = rawMessage.toLowerCase();

  if (lower.includes('gemini_api_key is not configured')) {
    return {
      status: 503,
      message:
        'Chat assistant is unavailable because the Gemini API key is not configured in Settings > Secrets.',
    };
  }
  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403') || lower.includes('401')) {
    return {
      status: 403,
      message:
        'The configured Gemini API key was rejected. Please verify your API key in Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return {
      status: 429,
      message:
        'Rate limit or quota reached for the Gemini API. Please wait a moment and try again.',
    };
  }
  if (lower.includes('503') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('timed out')) {
    return {
      status: 503,
      message:
        'The assistant is temporarily busy due to high demand. Please click "Try again" in a few seconds.',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 502,
      message: `Model "${CHAT_MODEL}" could not be reached. Please try again shortly.`,
    };
  }

  return {
    status: 500,
    message: `Unable to generate a response right now. Please try again.`,
  };
}

function buildSystemInstruction(context?: ChatProductContext): string {
  const baseInstructions = [
    'You are the PriceProof Shopping Assistant — a transparent, consumer-first price comparison advisor inside the PriceProof web app.',
    'All prices in PriceProof are displayed in Indian Rupees (INR / ₹). Always format prices in INR (e.g., ₹26,990).',
    'Core principles you MUST follow:',
    '1. Always evaluate offers by their Total Known Cost (Base Price + Delivery + Mandatory Fees - Unconditional Coupons), NOT just the advertised sticker price.',
    '2. Explicitly call out "Sticker Price Traps" when a lower advertised price ends up more expensive after shipping and mandatory fees.',
    '3. Never treat undisclosed/unknown delivery fees as ₹0 — warn the user when an offer is a partial estimate.',
    '4. Do NOT claim the cheapest offer is automatically best in every respect. Always weigh return windows, return shipping deductions, open-box restocking fees, and manufacturer vs. seller warranty differences.',
    '5. Clearly distinguish between Live API offers and Demo Catalog reference offers when citing data sources.',
    '6. Never fabricate product listings, prices, discounts, or URLs that are not in the provided context.',
    '7. Keep responses concise, scannable, and well-structured using short paragraphs and bullet points (typically under 180 words unless the user asks for a deep dive).',
  ];

  if (context?.offers && context.offers.length > 0) {
    const summarizedOffers = context.offers.slice(0, 12).map((o, idx) => {
      const feeText =
        o.mandatoryFeesTotal > 0
          ? `${formatINR(o.mandatoryFeesTotal)} (${o.mandatoryFeeNames.join(', ')})`
          : '₹0';
      const returnText = o.isFreeReturn
        ? `${o.returnWindowDays}d free returns`
        : `${o.returnWindowDays}d returns, buyer pays ${
            o.returnShippingCharge === -1 ? 'unknown shipping' : formatINR(o.returnShippingCharge)
          }${o.restockingFeePercentage ? ` + ${o.restockingFeePercentage}% restocking fee` : ''}`;

      return [
        `Offer ${idx + 1}: ${o.title}`,
        `  Seller: ${o.sellerName} | Source: ${o.providerName} (${o.isLive ? 'LIVE API' : 'DEMO CATALOG'})`,
        `  Base Sticker: ${formatINR(o.basePrice)} | Delivery: ${o.deliveryLabel} | Mandatory Fees: ${feeText}`,
        `  Total Known Cost: ${formatINR(o.knownTotal)} (${o.completeness}) | Transparency Grade: ${o.transparencyGrade}`,
        `  Flags: ${o.isCheapestComparable ? 'LOWEST_TOTAL_WINNER ' : ''}${o.isDeceptiveSticker ? 'DECEPTIVE_STICKER_TRAP' : ''}`.trim(),
        `  Returns: ${returnText} | Warranty: ${o.warrantyMonths} months (${o.warrantyCoverage})`,
        o.warnings.length > 0 ? `  Warnings: ${o.warnings.slice(0, 3).join(' ; ')}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    });

    baseInstructions.push(
      `\nCURRENT USER SEARCH CONTEXT:\nSearch Query: "${context.query || 'N/A'}" (${context.totalOffers || context.offers.length} total offers loaded)\n\nVISIBLE OFFERS:\n${summarizedOffers.join('\n\n')}`
    );
  } else {
    baseInstructions.push(
      '\nCURRENT USER SEARCH CONTEXT: No specific product offers are currently loaded. You can answer general questions about hidden e-commerce fees, how PriceProof calculates total cost, or suggest searching for "wireless headphones", "gaming mouse", "laptop", or "mechanical keyboard".'
    );
  }

  return baseInstructions.join('\n');
}

function isRetryableError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err ?? '')).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('fetch failed') ||
    msg.includes('econnreset')
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Upstream Gemini request timed out')), timeoutMs);
    }),
  ]);
}

/**
 * Streams a multi-turn chat response from Gemini for a user message,
 * with brief exponential backoff retries on transient 503 unavailability.
 */
export async function streamShoppingAssistantReply(params: {
  message: string;
  history?: ChatHistoryMessage[];
  context?: ChatProductContext;
}): Promise<AsyncGenerator<GenerateContentResponse>> {
  const ai = getGeminiClient();

  const sanitizedHistory = (params.history || [])
    .filter(
      (item): item is ChatHistoryMessage =>
        Boolean(item) &&
        (item.role === 'user' || item.role === 'model') &&
        typeof item.text === 'string' &&
        item.text.trim().length > 0
    )
    .slice(-14)
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.text.slice(0, 4000) }],
    }));

  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const chat = ai.chats.create({
        model: CHAT_MODEL,
        history: sanitizedHistory,
        config: {
          systemInstruction: buildSystemInstruction(params.context),
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      return await withTimeout(
        chat.sendMessageStream({
          message: params.message.slice(0, 2000),
        }),
        20000
      );
    } catch (err: unknown) {
      lastError = err;
      if (attempt < maxAttempts && isRetryableError(err)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
