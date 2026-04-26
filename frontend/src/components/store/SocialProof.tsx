"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye, Zap } from "lucide-react";

const NIGERIAN_FIRST_NAMES = ["Amaka","Tunde","Chisom","Aisha","Emeka","Fatima","Bayo","Ngozi","Seun","Zara","Kemi","Chidi","Yemi","Adaeze","Ibrahim","Blessing","Femi","Ifeoma","Kunle","Sade"];
const NIGERIAN_CITIES = ["Lagos","Abuja","Port Harcourt","Ibadan","Kano","Enugu","Benin City","Kaduna","Aba","Onitsha","Jos","Ilorin","Warri","Calabar","Uyo"];

function randomName() { return NIGERIAN_FIRST_NAMES[Math.floor(Math.random() * NIGERIAN_FIRST_NAMES.length)]; }
function randomCity() { return NIGERIAN_CITIES[Math.floor(Math.random() * NIGERIAN_CITIES.length)]; }

interface SocialProofToast {
  id:     number;
  name:   string;
  city:   string;
  action: "bought" | "viewing";
  time:   number;
}

interface Props {
  productName?: string;
  viewerCount?: number;
  brand?:       string;
}

export function SocialProofPopup({ productName, viewerCount = 0, brand = "#6B35E8" }: Props) {
  const [toasts, setToasts] = useState<SocialProofToast[]>([]);

  useEffect(() => {
    // Show a purchase notification every 15-45 seconds
    const schedule = () => {
      const delay = 15000 + Math.random() * 30000;
      return setTimeout(() => {
        const id = Date.now();
        setToasts(prev => [...prev.slice(-1), {
          id, name: randomName(), city: randomCity(), action: "bought", time: Math.floor(Math.random() * 12) + 1,
        }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
        schedule();
      }, delay);
    };

    // First one after 5 seconds
    const first = setTimeout(() => {
      const id = Date.now();
      setToasts([{ id, name: randomName(), city: randomCity(), action: "bought", time: 3 }]);
      setTimeout(() => setToasts([]), 5000);
    }, 5000);

    const recurring = schedule();
    return () => { clearTimeout(first); clearTimeout(recurring); };
  }, []);

  return (
    <>
      {/* Live viewers */}
      {viewerCount > 1 && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", animation: "pulse 1.5s ease infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444" }}>{viewerCount} people viewing this now</span>
        </div>
      )}

      {/* Toast popups */}
      <div style={{ position: "fixed", bottom: 80, left: 12, zIndex: 9998, maxWidth: 280 }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: -20, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${brand}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShoppingBag size={15} style={{ color: brand }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{toast.name} from {toast.city}</p>
                <p style={{ fontSize: 11, color: "#6b7280" }}>purchased {toast.time < 60 ? `${toast.time} min ago` : "recently"}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export function StockUrgency({ inventory, threshold = 5 }: { inventory: number; threshold?: number }) {
  if (inventory <= 0 || inventory > threshold) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: inventory <= 2 ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${inventory <= 2 ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}` }}>
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: "50%", background: inventory <= 2 ? "#EF4444" : "#F59E0B" }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color: inventory <= 2 ? "#DC2626" : "#D97706" }}>
        Only {inventory} left in stock
      </span>
    </motion.div>
  );
}

export function WhatsAppButton({ storeName, productName, productUrl, brand = "#25D366" }: { storeName: string; productName?: string; productUrl?: string; brand?: string }) {
  const message = productName
    ? `Hi! I'm interested in ${productName} from ${storeName}. Can you help me order?`
    : `Hi! I'm interested in shopping at ${storeName}.`;

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message + (productUrl ? " " + productUrl : ""))}`;

  return (
    <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <motion.button
        whileTap={{ scale: 0.96 }}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, background: "#25D366", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,211,102,0.35)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49"/>
        </svg>
        Order on WhatsApp
      </motion.button>
    </a>
  );
}
