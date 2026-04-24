"use client";
// ============================================================
// KAI — Message Bubble
// Path: frontend/src/components/kai/KAIMessage.tsx
// ============================================================
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import type { KaiMessage } from "@/types/kai";

interface Props {
  message: KaiMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export function KAIMessageBubble({ message, isStreaming, onRegenerate }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [rated, setRated]   = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: message.content });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message.content)}`, "_blank");
    }
  };

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* KAI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <motion.div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
            animate={
              isStreaming && message.content === ""
                ? { boxShadow: ["0 0 0px #7c3aed40", "0 0 16px #7c3aed80", "0 0 0px #7c3aed40"] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            K
          </motion.div>
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isUser
              ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
              : "rgba(255,255,255,0.06)",
            border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            color: isUser ? "#fff" : "rgba(255,255,255,0.85)",
            fontSize: "14px",
            lineHeight: "1.65",
            wordBreak: "break-word",
          }}
        >
          {!isUser && isStreaming && message.content === "" ? (
            <ThinkingDots />
          ) : (
            <MessageContent content={message.content} />
          )}
        </div>

        {/* Timestamp */}
        <span className="px-1" style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
          {formatTime(message.createdAt)}
        </span>

        {/* Actions on hover */}
        {!isUser && message.content && !isStreaming && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            <ActionBtn icon={copied ? Check : Copy} onClick={handleCopy} label="Copy" active={copied} />
            <ActionBtn icon={Share2} onClick={handleShare} label="Share to WhatsApp" />
            {onRegenerate && <ActionBtn icon={RefreshCw} onClick={onRegenerate} label="Regenerate" />}
            <ActionBtn icon={ThumbsUp} onClick={() => setRated("up")} label="Good" active={rated === "up"} />
            <ActionBtn icon={ThumbsDown} onClick={() => setRated("down")} label="Bad" active={rated === "down"} />
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
          U
        </div>
      )}
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: "#7c3aed" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const paragraphs = content.split("\n\n").filter(Boolean);
  return (
      {paragraphs.map((para, i) => (
        <p key={i} style={{ marginTop: i > 0 ? "12px" : "0" }}>
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
          ))}
        </p>
      ))}
  );
}

function ActionBtn({ icon: Icon, onClick, label, active }: {
  icon: any; onClick: () => void; label: string; active?: boolean;
}) {
  return (
    <button onClick={onClick} title={label}
      className="w-6 h-6 flex items-center justify-center rounded-md transition-colors"
      style={{ color: active ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>
      <Icon size={12} />
    </button>
  );
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}
