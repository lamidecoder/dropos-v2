// ============================================================
// KAI Bulletproof Streaming
// Path: backend/src/services/kai.stream.service.ts
// Self-healing — handles every failure mode gracefully
// ============================================================
import prisma from "../lib/prisma";

interface StreamOptions {
  systemPrompt: string;
  messages: any[];
  useSearch?: boolean;
  maxTokens?: number;
  timeout?: number; // ms, default 90000
  retries?: number; // default 2
  onToken: (token: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

// ── Bulletproof stream call ───────────────────────────────────
export async function streamWithRetry(options: StreamOptions): Promise<string> {
  const apiKey  = process.env.ANTHROPIC_API_KEY;
  const timeout = options.timeout || 90000;
  const retries = options.retries ?? 1;

  if (!apiKey) {
    options.onError("KAI is not configured yet. Add ANTHROPIC_API_KEY to get started.");
    return "";
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await attemptStream(apiKey, options, timeout);
      return result;
    } catch (err: any) {
      lastError = err;
      console.error(`[KAI Stream] Attempt ${attempt + 1} failed:`, err.message);

      if (attempt < retries) {
        // Brief pause before retry
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));

        // Tell user we're retrying (only on first retry)
        if (attempt === 0) {
          options.onToken("\n\nLet me try that again...\n\n");
        }
      }
    }
  }

  // All retries exhausted
  const userMessage = getFriendlyError(lastError);
  options.onError(userMessage);
  return "";
}

// ── Single stream attempt ─────────────────────────────────────
async function attemptStream(apiKey: string, options: StreamOptions, timeout: number): Promise<string> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeout);

  try {
    const body: any = {
      model:      "claude-sonnet-4-20250514",
      max_tokens: options.maxTokens || 1024,
      system:     options.systemPrompt,
      messages:   options.messages,
      stream:     true,
    };

    if (options.useSearch) {
      body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: {
        "x-api-key":          apiKey,
        "anthropic-version":  "2023-06-01",
        "Content-Type":       "application/json",
      },
      body:   JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      let parsed: any;
      try { parsed = JSON.parse(errText); } catch {}

      if (response.status === 529) throw new Error("OVERLOADED");
      if (response.status === 401) throw new Error("INVALID_KEY");
      if (response.status === 429) throw new Error("RATE_LIMITED");
      if (response.status >= 500)  throw new Error("AI_SERVER_ERROR");
      throw new Error(parsed?.error?.message || `HTTP ${response.status}`);
    }

    const reader  = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("No readable stream");

    let fullText  = "";
    let buffer    = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") continue;

        try {
          const parsed = JSON.parse(raw);
          if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
            const token = parsed.delta.text;
            fullText += token;
            options.onToken(token);
          }
        } catch {}
      }
    }

    options.onDone();
    return fullText;

  } finally {
    clearTimeout(timer);
  }
}

// ── Map errors to friendly messages ──────────────────────────
function getFriendlyError(err: Error | null): string {
  if (!err) return "Something went wrong. Please try again.";

  const msg = err.message;

  if (msg === "OVERLOADED" || msg.includes("overloaded")) {
    return "KAI is very busy right now. Give it 30 seconds and try again.";
  }
  if (msg === "INVALID_KEY") {
    return "KAI setup issue — please contact support.";
  }
  if (msg === "RATE_LIMITED") {
    return "KAI is being used a lot right now. Try again in a minute.";
  }
  if (msg === "AI_SERVER_ERROR") {
    return "KAI ran into a temporary issue. Try again — it usually resolves quickly.";
  }
  if (msg.includes("abort") || msg.includes("timeout")) {
    return "KAI took too long to respond. Your internet may be slow — try again.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Connection issue. Check your internet and try again.";
  }

  return "KAI encountered an issue. Please try again.";
}

// ── Save message safely (won't crash if DB is down) ──────────
export async function saveMessageSafely(params: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: any;
}): Promise<void> {
  try {
    await prisma.kaiMessage.create({
      data: {
        conversationId: params.conversationId,
        role:           params.role,
        content:        params.content,
        metadata:       params.metadata || null,
      },
    });
  } catch (err) {
    console.error("[KAI] Failed to save message:", err);
    // Don't throw — streaming continues even if save fails
  }
}
