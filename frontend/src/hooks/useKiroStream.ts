// Reusable hook: streams from KIRO smart-chat and returns text progressively
"use client";
import { useState, useRef, useCallback } from "react";
import { useAuthStore } from "../store/auth.store";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api");

export function useKiroStream(storeId: string) {
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const abortRef  = useRef<AbortController | null>(null);
  const token     = useAuthStore(s => s.accessToken);

  const run = useCallback(async (message: string, onDone?: (full: string) => void) => {
    if (!message || !storeId || loading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setText(""); setError(""); setLoading(true);

    try {
      const res = await fetch(`${BASE}/kai/smart-chat`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept":        "text/event-stream",
        },
        body:   JSON.stringify({ message, storeId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({ message: `Error ${res.status}` }));
        throw new Error(e.message || `Error ${res.status}`);
      }

      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        const reader  = res.body!.getReader();
        const decoder = new TextDecoder();
        let   full    = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;
            try {
              const p = JSON.parse(raw);
              if (p.token) {
                full += p.token;
                setText(full.replace(/KIRO_ACTION:\{[^}]+\}/g, "").trim());
              }
              if (p.done) onDone?.(full);
            } catch {}
          }
        }
      } else {
        const data = await res.json();
        const reply = data?.data?.message || data?.message || "";
        setText(reply);
        onDone?.(reply);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") setError(e.message || "KIRO unavailable");
    } finally {
      setLoading(false);
    }
  }, [storeId, token, loading]);

  const stop = () => abortRef.current?.abort();
  const clear = () => { setText(""); setError(""); };

  return { text, loading, error, run, stop, clear };
}
