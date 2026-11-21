/**
 * Server-side Gemini Chat Service for PriceProof Shopping Assistant
 * Uses @google/genai strictly on the backend with GEMINI_API_KEY from process.env.
 */

import { GoogleGenAI, ThinkingLevel } from '@google/genai';
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

const PRIMARY_CHAT_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_CHAT_MODEL = 'gemini-4-hydrogen';

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
  if (
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('403') ||
    lower.includes('401')
  ) {
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
  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('timed out') ||
    lower.includes('abort')
  ) {
    return {
      status: 503,
      message:
        'The assistant is temporarily busy due to high demand. Please click "Try again" in a few seconds.',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 502,
      message: 'The chat model could not be reached. Please try again shortly.',
    };
  }

  return {
    status: 500,
    message: 'Unable to generate a response right now. Please try again.',
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
    '7. Keep responses concise, scannable, and well-structured using short paragraphs and bullet points (typically under 160 words unless the user asks for a deep dive).',
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

/**
 * Ensures history strictly alternates user -> model -> user -> model
 * and ends on a model turn so appending the new user message is always valid.
 */
function sanitizeConversationHistory(
  history?: ChatHistoryMessage[]
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const valid = (history || [])
    .filter(
      (item): item is ChatHistoryMessage =>
        Boolean(item) &&
        (item.role === 'user' || item.role === 'model') &&
        typeof item.text === 'string' &&
        item.text.trim().length > 0
    )
    .slice(-14);

  const alternating: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const item of valid) {
    const prev = alternating[alternating.length - 1];
    if (!prev) {
      if (item.role !== 'user') continue;
      alternating.push({ role: 'user', parts: [{ text: item.text.slice(0, 4000) }] });
    } else if (prev.role === item.role) {
      // Merge or replace duplicate consecutive role so alternation stays valid
      prev.parts[0].text = `${prev.parts[0].text}\n${item.text.slice(0, 4000)}`.slice(0, 4000);
    } else {
      alternating.push({ role: item.role, parts: [{ text: item.text.slice(0, 4000) }] });
    }
  }

  // History before a new user prompt must end with a model turn
  while (alternating.length > 0 && alternating[alternating.length - 1].role !== 'model') {
    alternating.pop();
  }

  return alternating;
}

function shouldFallbackModel(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err ?? '')).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('timed out') ||
    msg.includes('timeout') ||
    msg.includes('abort') ||
    msg.includes('fetch failed') ||
    msg.includes('econnreset')
  );
}

async function generateWithTimeout(
  ai: GoogleGenAI,
  model: string,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  systemInstruction: string,
  timeoutMs: number
): Promise<string> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Upstream Gemini request (${model}) timed out after ${timeoutMs}ms`);
      controller.abort(err);
      reject(err);
    }, timeoutMs);
  });

  try {
    const requestPromise = ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        abortSignal: controller.signal,
        ...(model === 'gemini-4-hydrogen'
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
      },
    });

    const response = await Promise.race([requestPromise, timeoutPromise]);
    const text = response.text?.trim();
    if (!text) {
      throw new Error(`Model ${model} returned an empty response.`);
    }
    return text;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Generates a multi-turn chat reply from Gemini for a user message.
 * Uses gemini-3.1-flash-lite for low-latency interactive chat with exponential-backoff
 * retries and automatic cross-model failover to gemini-4-hydrogen on transient 429/503 spikes.
 */
export async function generateShoppingAssistantReply(params: {
  message: string;
  history?: ChatHistoryMessage[];
  context?: ChatProductContext;
}): Promise<{ reply: string; model: string }> {
  const ai = getGeminiClient();
  const systemInstruction = buildSystemInstruction(params.context);
  const sanitizedHistory = sanitizeConversationHistory(params.history);

  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
    ...sanitizedHistory,
    {
      role: 'user',
      parts: [{ text: params.message.slice(0, 2000) }],
    },
  ];

  const attempts: Array<{ model: string; timeoutMs: number; delayBeforeMs?: number }> = [
    { model: PRIMARY_CHAT_MODEL, timeoutMs: 10000 },
    { model: PRIMARY_CHAT_MODEL, timeoutMs: 10000, delayBeforeMs: 600 },
    { model: FALLBACK_CHAT_MODEL, timeoutMs: 10000, delayBeforeMs: 700 },
    { model: PRIMARY_CHAT_MODEL, timeoutMs: 12000, delayBeforeMs: 1400 },
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    if (attempt.delayBeforeMs) {
      await new Promise((resolve) => setTimeout(resolve, attempt.delayBeforeMs));
    }
    try {
      const reply = await generateWithTimeout(
        ai,
        attempt.model,
        contents,
        systemInstruction,
        attempt.timeoutMs
      );
      return { reply, model: attempt.model };
    } catch (err: unknown) {
      lastError = err;
      const errSummary = err instanceof Error ? err.message.slice(0, 200) : String(err);
      console.warn(
        `[Chat API] Attempt ${i + 1}/${attempts.length} (${attempt.model}) failed: ${errSummary}`
      );
      if (!shouldFallbackModel(err)) {
        throw err;
      }
    }
  }

  throw lastError;
}
