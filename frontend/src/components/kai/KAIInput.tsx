"use client";
// ============================================================
// KAI - Floating Input
// Path: frontend/src/components/kai/KAIInput.tsx
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Mic, MicOff, X } from "lucide-react";
import { useKaiStore } from "@/store/kai.store";

const PLACEHOLDERS = [
  "Ask KIRO anything about your business...",
  "What's trending to sell right now?",
  "Build me a store that sells sneakers...",
  "How are my sales this week?",
  "Find products with 60%+ margin...",
  "Create a flash sale for tonight...",
  "Help me get my first sale...",
  "What do my customers want?",
];

interface Props {
  onSend: (message: string, imageBase64?: string, imageMediaType?: string) => void;
  disabled?: boolean;
}

export function KAIInput({ onSend, disabled }: Props) {
  const { isStreaming } = useKaiStore();
  const [value, setValue]       = useState("");
  const [phIdx, setPhIdx]       = useState(0);
  const [image, setImage]       = useState<{ base64: string; mediaType: string; preview: string } | null>(null);
  const [isRecording, setIsRec] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const recRef      = useRef<any>(null);

  // Rotate placeholder
  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed, image?.base64, image?.mediaType);
    setValue("");
    setImage(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [value, disabled, isStreaming, image, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImage({ base64: result.split(",")[1], mediaType: file.type, preview: result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleVoice = () => {
    if (isRecording) { recRef.current?.stop(); setIsRec(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-NG";
    r.onresult = (e: any) => setValue(Array.from(e.results).map((r: any) => r[0].transcript).join(""));
    r.onend = () => setIsRec(false);
    r.start();
    recRef.current = r;
    setIsRec(true);
  };

  const canSend = value.trim().length > 0 && !disabled && !isStreaming;

  return (
    <div className="px-4 pb-5 pt-2">
      {/* Image preview */}
      <AnimatePresence>
        {image && (
          <motion.div className="mb-2 flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <div className="relative w-14 h-14 rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <img src={image.preview} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImage(null)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)" }}>
                <X size={9} color="#fff" />
              </button>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>KAI will analyse this image</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex items-end gap-2 px-3 py-2.5 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}>
        <button onClick={() => fileRef.current?.click()}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl mb-0.5 transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }} title="Attach image">
          <Paperclip size={15} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        <textarea ref={textareaRef} value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[phIdx]}
          rows={1} disabled={disabled}
          className="flex-1 bg-transparent outline-none resize-none"
          style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", lineHeight: "1.55",
            minHeight: "24px", maxHeight: "120px" }} />

        <button onClick={toggleVoice}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl mb-0.5 transition-colors"
          style={{ color: isRecording ? "#7c3aed" : "rgba(255,255,255,0.3)" }} title="Voice">
          {isRecording ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <MicOff size={15} />
            </motion.div>
          ) : <Mic size={15} />}
        </button>

        <AnimatePresence>
          {canSend && (
            <motion.button onClick={handleSend}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl mb-0.5"
              style={{ background: "#7c3aed" }}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }} whileTap={{ scale: 0.9 }}>
              <Send size={14} color="#fff" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center mt-1.5" style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px" }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
