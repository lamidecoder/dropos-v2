"use client";
import { motion, AnimatePresence } from "framer-motion";

interface AppLoaderProps { show?: boolean; }

export function AppLoader({ show = true }: AppLoaderProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="app-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "#000",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
          }}
        >
          {/* Centered minimalist composition */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Logo mark — clean, monochrome */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 56, height: 56, marginBottom: 28,
                background: "#fff", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 40px rgba(255,255,255,0.05)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="#000" />
              </svg>
            </motion.div>

            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{ marginBottom: 56 }}
            >
              <span style={{
                fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em",
                color: "#fff",
              }}>
                DropOS
              </span>
            </motion.div>

            {/* Single thin line that fills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{ width: 240, height: 1, background: "rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], repeat: Infinity }}
                style={{
                  position: "absolute", top: 0, left: 0, height: "100%",
                  background: "linear-gradient(90deg, transparent, #fff 50%, transparent)",
                }}
              />
            </motion.div>
          </div>

          {/* Footer credit — tiny, bottom corners */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1, duration: 0.8 }}
            style={{
              position: "absolute", bottom: 24,
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 10, color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.08em",
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
            <span>COMMERCE FOR EVERYONE</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
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
