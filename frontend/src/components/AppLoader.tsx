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
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "#06040F",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          }}
        >
          {/* === Layered ambient background === */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.18) 0%, transparent 55%)",
            opacity: 0.9,
          }} />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
              width: 600, height: 600, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* === Grain texture overlay === */}
          <svg style={{ position: "absolute", inset: 0, opacity: 0.04, mixBlendMode: "overlay", pointerEvents: "none" }}>
            <filter id="noise">
              <feTurbulence baseFrequency="0.9" numOctaves="3" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>

          {/* === Main composition === */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>

            {/* Orbital system */}
            <div style={{ position: "relative", width: 140, height: 140, marginBottom: 48 }}>

              {/* Outermost orbit — slowest */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: -16, borderRadius: "50%",
                  border: "1px solid rgba(167,139,250,0.10)",
                }}
              >
                <div style={{
                  position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)",
                  width: 4, height: 4, borderRadius: "50%",
                  background: "#A78BFA",
                  boxShadow: "0 0 12px #A78BFA, 0 0 24px rgba(167,139,250,0.6)",
                }} />
              </motion.div>

              {/* Middle orbit — reversed */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: 4, borderRadius: "50%",
                  border: "1px dashed rgba(124,58,237,0.15)",
                }}
              >
                <div style={{
                  position: "absolute", top: -2, right: -2,
                  width: 3, height: 3, borderRadius: "50%",
                  background: "#7C3AED",
                  boxShadow: "0 0 8px #7C3AED",
                }} />
              </motion.div>

              {/* Inner pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", inset: 20, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)",
                }}
              />

              {/* The icon — DropOS bolt */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.34, 1.4, 0.64, 1], delay: 0.1 }}
                style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: 76, height: 76, borderRadius: 22,
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `
                    0 0 0 1px rgba(167,139,250,0.3),
                    0 0 32px rgba(124,58,237,0.5),
                    0 24px 60px rgba(76,29,149,0.5),
                    inset 0 1px 0 rgba(255,255,255,0.15)
                  `,
                }}
              >
                {/* Subtle inner highlight */}
                <div style={{
                  position: "absolute", inset: 1, borderRadius: 21,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%)",
                  pointerEvents: "none",
                }} />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ position: "relative" }}>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" />
                </svg>
              </motion.div>
            </div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 32 }}
            >
              <span style={{
                fontSize: 32, fontWeight: 900, letterSpacing: "-0.05em",
                color: "#fff",
                background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.85) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Drop<span style={{ background: "linear-gradient(135deg, #A78BFA, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>OS</span>
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.4em",
                color: "rgba(167,139,250,0.7)", textTransform: "uppercase",
              }}>
                Commerce Platform
              </span>
            </motion.div>

            {/* Loading line — minimal, premium */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 160 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
              style={{ height: 1, background: "rgba(167,139,250,0.12)", overflow: "hidden", position: "relative" }}
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
                style={{
                  position: "absolute", top: 0, height: "100%", width: "40%",
                  background: "linear-gradient(90deg, transparent, #A78BFA 50%, transparent)",
                }}
              />
            </motion.div>
          </div>

          {/* Bottom corner label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{
              position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
              fontSize: 10, fontWeight: 500, letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
            }}
          >
            droposhq.com
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
