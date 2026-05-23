"use client";
// DropOS App Preloader — shown while auth is checking / app is booting
import { motion, AnimatePresence } from "framer-motion";

interface AppLoaderProps {
  show?: boolean;
  message?: string;
}

export function AppLoader({ show = true, message = "Loading…" }: AppLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "linear-gradient(145deg, #06040D 0%, #0D0820 50%, #06040D 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <style>{`
            @keyframes al-orbit { to { transform: rotate(360deg); } }
            @keyframes al-pulse { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } }
            @keyframes al-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes al-bar { 0% { width: 0%; } 100% { width: 100%; } }
            @keyframes al-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          `}</style>

          {/* Background particles */}
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 2 + (i % 3), height: 2 + (i % 3),
              borderRadius: "50%",
              background: `rgba(${i % 2 === 0 ? "139,92,246" : "99,102,241"},${0.3 + (i % 4) * 0.15})`,
              left: `${8 + i * 7.5}%`,
              top: `${15 + (i % 5) * 15}%`,
              animation: `al-pulse ${2 + (i % 3) * 0.8}s ease-in-out ${i * 0.2}s infinite`,
            }}/>
          ))}

          {/* Main logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ position: "relative", marginBottom: 40 }}
          >
            {/* Outer orbit ring */}
            <div style={{
              position: "absolute", inset: -20,
              borderRadius: "50%",
              border: "1px solid rgba(139,92,246,0.15)",
              borderTopColor: "rgba(139,92,246,0.6)",
              borderRightColor: "rgba(99,102,241,0.4)",
              animation: "al-orbit 2s linear infinite",
            }}/>
            {/* Middle ring */}
            <div style={{
              position: "absolute", inset: -10,
              borderRadius: "50%",
              border: "1px solid transparent",
              borderBottomColor: "rgba(167,139,250,0.5)",
              animation: "al-orbit 3s linear infinite reverse",
            }}/>
            {/* Inner dot ring */}
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{
                position: "absolute",
                width: 4, height: 4, borderRadius: "50%",
                background: i % 2 === 0 ? "#8B5CF6" : "#6366F1",
                top: "50%", left: "50%",
                transform: `rotate(${i * 60}deg) translateY(-36px) translate(-50%, -50%)`,
                animation: `al-pulse ${1 + i * 0.2}s ease-in-out ${i * 0.15}s infinite`,
              }}/>
            ))}

            {/* Logo mark */}
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: "linear-gradient(145deg, #7C3AED, #4C1D95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.3), 0 16px 48px rgba(124,58,237,0.4)",
              animation: "al-float 3s ease-in-out infinite",
              position: "relative", zIndex: 1,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity="0.95"/>
              </svg>
            </div>
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            <div style={{
              fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em",
              fontFamily: "system-ui, sans-serif",
              background: "linear-gradient(135deg, #F0ECFF 20%, #A78BFA 60%, #7C3AED 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 6,
            }}>
              DropOS
            </div>
            <div style={{
              fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(167,139,250,0.6)", fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
            }}>
              {message}
            </div>
          </motion.div>

          {/* Animated progress bar */}
          <div style={{ width: 180, height: 2, background: "rgba(139,92,246,0.15)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg, transparent, #8B5CF6, #6366F1, #8B5CF6, transparent)",
              backgroundSize: "200% 100%",
              animation: "al-shimmer 1.5s ease-in-out infinite",
            }}/>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple inline spinner for smaller loading states
export function SpinLoader({ size = 20, color = "#8B5CF6" }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}25`, borderTopColor: color,
      animation: "al-orbit 0.7s linear infinite",
      flexShrink: 0,
    }}>
      <style>{"@keyframes al-orbit{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
