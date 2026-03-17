"use client";

// src/components/layout/Providers.tsx
import { PWAInstallBanner } from "../ui/PWAInstallBanner";
import { IOSInstallPrompt }  from "../ui/IOSInstallPrompt";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { CurrencyProvider } from "../providers/CurrencyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:   60 * 1000,
        retry:       1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1e293b",
              color:      "#f1f5f9",
              border:     "1px solid #334155",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              fontWeight: "600",
              fontSize:   "13px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
