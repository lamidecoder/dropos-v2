"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Suspense } from "react";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuthStore(s => s.setAccessToken);
  const setUser  = useAuthStore(s => s.setUser);

  useEffect(() => {
    const token    = searchParams.get("token");
    const error    = searchParams.get("error");
    const provider = searchParams.get("provider");

    if (error) {
      const messages: Record<string,string> = {
        google_not_configured: "Google sign-in is not set up yet. Use email instead.",
        google_denied:         "You cancelled Google sign-in.",
        google_failed:         "Google sign-in failed. Try again or use email.",
      };
      router.replace(`/auth/login?error=${encodeURIComponent(messages[error] || error)}`);
      return;
    }

    if (token) {
      // Store token and fetch user profile
      setToken(token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      api.get("/auth/me")
        .then(r => {
          setUser(r.data.data);
          router.replace("/dashboard");
        })
        .catch(() => {
          router.replace("/auth/login?error=Session+expired");
        });
    } else {
      router.replace("/auth/login");
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #2D1B69 0%, #0D0625 100%)",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* Animated logo */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "pulse 1.5s ease-in-out infinite",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
          </svg>
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500 }}>
        Signing you in…
      </p>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.96)}}`}</style>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#2D1B69,#0D0625)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p style={{ color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif" }}>Signing you in…</p>
      </div>
    }>
      <CallbackInner/>
    </Suspense>
  );
}
