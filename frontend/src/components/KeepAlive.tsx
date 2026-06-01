"use client";
import { useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Pings the backend every 10 minutes to prevent Render cold starts.
 * Render free tier sleeps after 15 minutes of inactivity.
 * This keeps it warm so merchants don't see 30-second delays.
 */
export function KeepAlive() {
  useEffect(() => {
    const ping = () => {
      if (!API) return;
      fetch(`${API}/health`, { method:"GET" }).catch(() => {});
    };

    ping(); // immediate ping on mount
    const interval = setInterval(ping, 10 * 60 * 1000); // every 10 min
    return () => clearInterval(interval);
  }, []);

  return null;
}
