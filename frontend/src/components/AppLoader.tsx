"use client";
// DropOS App Loader — clean, minimal, instant
import { motion, AnimatePresence } from "framer-motion";

interface AppLoaderProps { show?: boolean; message?: string; }

export function AppLoader({ show = true, message = "Loading" }: AppLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#06040D",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #7C3AED, #4C1D95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(124,58,237,0.3), 0 12px 40px rgba(124,58,237,0.35)",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
              </svg>
            </div>

            {/* Wordmark */}
            <span style={{
              fontSize: 22, fontWeight: 900, letterSpacing: "-0.05em",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#fff",
            }}>
              Drop<span style={{ color: "#8B5CF6" }}>OS</span>
            </span>
          </motion.div>

          {/* Progress dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ position: "absolute", bottom: 48, display: "flex", gap: 6 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SpinLoader({ size = 18, color = "#8B5CF6" }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}20`, borderTopColor: color,
      animation: "dropos-spin 0.7s linear infinite", flexShrink: 0,
    }}>
      <style>{"@keyframes dropos-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
