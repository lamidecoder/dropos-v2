"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: compact ? 32 : 100, height: 32 }} />;

  const isDark = resolvedTheme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle theme"
        className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: isDark ? "rgba(124,58,237,0.12)" : "rgba(15,23,42,0.06)",
          border:     isDark ? "1px solid rgba(124,58,237,0.25)" : "1px solid rgba(15,23,42,0.1)",
          color:      isDark ? "#A78BFA" : "#475569",
        }}
      >
        {isDark ? <Sun size={13} /> : <Moon size={13} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all select-none w-full"
      style={{
        background: isDark ? "rgba(124,58,237,0.08)" : "rgba(15,23,42,0.04)",
        border:     isDark ? "1px solid rgba(124,58,237,0.18)" : "1px solid rgba(15,23,42,0.08)",
        color:      isDark ? "#9CA3AF" : "#64748B",
      }}
    >
      <span className="relative flex-shrink-0" style={{ width: 34, height: 20 }}>
        <span className="absolute inset-0 rounded-full" style={{
          background: isDark ? "rgba(124,58,237,0.2)" : "rgba(15,23,42,0.07)",
          border:     isDark ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(15,23,42,0.1)",
          transition: "background 0.2s, border-color 0.2s",
        }} />
        <span className="absolute w-4 h-4 top-0.5 rounded-full flex items-center justify-center" style={{
          left:       isDark ? "calc(100% - 18px)" : "2px",
          background: isDark ? "#7C3AED" : "#94A3B8",
          boxShadow:  isDark ? "0 0 8px rgba(124,58,237,0.5)" : "0 1px 3px rgba(0,0,0,0.15)",
          transition: "left 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.2s",
        }}>
          {isDark ? <Moon size={8} color="white" /> : <Sun size={8} color="white" />}
        </span>
      </span>
      <span className="text-xs font-semibold flex-1 text-left">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
