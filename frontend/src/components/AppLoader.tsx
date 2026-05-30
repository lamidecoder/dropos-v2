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
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            // Uses the exact same light background as auth pages and dashboard
            background: "#F4F2FB",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
          }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;800;900&display=swap');
            @keyframes loader-spin { to { transform: rotate(360deg); } }
            @keyframes loader-pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
          `}</style>

          {/* Ambient glow — matches auth left panel */}
          <div style={{
            position: "absolute",
            top: "20%", left: "50%", transform: "translate(-50%,-50%)",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(107,53,232,0.09) 0%, transparent 65%)",
            filter: "blur(40px)",
            animation: "loader-pulse 3s ease-in-out infinite",
          }} />

          {/* Main composition */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>

            {/* Icon — matches auth page logo treatment */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.34, 1.2, 0.64, 1] }}
              style={{ marginBottom: 24, position: "relative" }}
            >
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: -12, borderRadius: "50%",
                  border: "1px solid rgba(107,53,232,0.12)",
                }}
              >
                <div style={{
                  position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)",
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#6B35E8",
                  boxShadow: "0 0 10px rgba(107,53,232,0.6)",
                }} />
              </motion.div>

              {/* Icon box — same gradient as auth visual panel */}
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(145deg, #2D1B69 0%, #1A0B4A 60%, #0D0625 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 32px rgba(45,27,105,0.25), 0 2px 8px rgba(45,27,105,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
                </svg>
              </div>
            </motion.div>

            {/* Wordmark — using Fraunces like auth pages */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ textAlign: "center", marginBottom: 36 }}
            >
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 28, fontWeight: 500,
                letterSpacing: "-0.04em",
                color: "#130D2E",
                lineHeight: 1,
                marginBottom: 6,
              }}>
                Drop<span style={{ color: "#6B35E8" }}>OS</span>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.18em",
                color: "rgba(19,13,46,0.35)", textTransform: "uppercase",
              }}>
                Commerce Platform
              </div>
            </motion.div>

            {/* Loading bar — uses brand purple */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 200 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
              style={{ height: 2, background: "rgba(107,53,232,0.1)", borderRadius: 99, overflow: "hidden" }}
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
                style={{
                  height: "100%", width: "50%", borderRadius: 99,
                  background: "linear-gradient(90deg, transparent, #6B35E8 40%, #A78BFA, transparent)",
                }}
              />
            </motion.div>
          </div>

          {/* Bottom — same footer style as auth */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              position: "absolute", bottom: 28,
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 10, color: "rgba(19,13,46,0.3)",
              letterSpacing: "0.12em", fontWeight: 500,
            }}
          >
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(107,53,232,0.4)" }} />
            <span>DROPOS · COMMERCE FOR EVERYONE</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(107,53,232,0.4)" }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SpinLoader({ size = 18, color = "#6B35E8" }: { size?: number; color?: string }) {
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
