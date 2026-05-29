"use client";
import { motion, AnimatePresence } from "framer-motion";

interface AppLoaderProps { show?: boolean; }

export function AppLoader({ show = true }: AppLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#06040D",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: "absolute", width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            animation: "pulse 3s ease-in-out infinite",
          }} />

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative" }}
          >
            {/* Orbit animation around the icon */}
            <div style={{ position: "relative", width: 80, height: 80, marginBottom: 28 }}>
              {/* Outer ring */}
              <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                border: "1px solid rgba(124,58,237,0.15)",
                animation: "spin 8s linear infinite",
              }}>
                <div style={{
                  position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)",
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#7C3AED",
                  boxShadow: "0 0 8px #7C3AED",
                }} />
              </div>
              {/* Inner ring */}
              <div style={{
                position: "absolute", inset: 4, borderRadius: "50%",
                border: "1px solid rgba(124,58,237,0.08)",
                animation: "spin 5s linear infinite reverse",
              }} />
              {/* Icon */}
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 0 1px rgba(124,58,237,0.4), 0 16px 48px rgba(124,58,237,0.4)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
                </svg>
              </div>
            </div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{ marginBottom: 40 }}
            >
              <span style={{
                fontSize: 26, fontWeight: 900, letterSpacing: "-0.05em",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "#fff",
              }}>
                Drop<span style={{ color: "#8B5CF6" }}>OS</span>
              </span>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ width: 120, height: 2, borderRadius: 99, background: "rgba(124,58,237,0.15)", overflow: "hidden" }}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
                style={{ height: "100%", width: "60%", borderRadius: 99, background: "linear-gradient(90deg, transparent, #7C3AED, #A78BFA, transparent)" }}
              />
            </motion.div>
          </motion.div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.15);opacity:1} }
          `}</style>
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
