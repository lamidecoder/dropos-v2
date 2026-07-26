"use client";
import { useTheme } from "../layout/DashboardLayout";

export function Skeleton({ w = "100%", h = 16, r = 8, className = "" }: {
  w?: string | number; h?: number; r?: number; className?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: isDark
        ? "linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%)"
        : "linear-gradient(90deg,rgba(19,13,46,0.04) 0%,rgba(19,13,46,0.08) 50%,rgba(19,13,46,0.04) 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite",
    }} className={className}/>
  );
}

export function SkeletonCard({ lines = 3, t }: { lines?: number; t?: any }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${t?.border || "rgba(107,53,232,0.08)"}`, background: t?.card || "#fff" }}>
      <Skeleton h={12} w="60%" r={6}/>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} style={{ marginTop: 8 }}>
          <Skeleton h={10} w={`${90 - i * 15}%`} r={5}/>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 16, padding: "12px 16px", alignItems: "center", borderBottom: "1px solid rgba(107,53,232,0.05)" }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} h={12} w={j === 0 ? 40 : `${Math.random() * 40 + 40}%`} r={5}/>
          ))}
        </div>
      ))}
    </div>
  );
}

export const skeletonCSS = `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
