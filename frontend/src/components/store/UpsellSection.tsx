"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { publicApi } from "../../lib/api";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/cart.store";

interface Props {
  storeId:   string;
  storeSlug: string;
  productId: string;
  brand:     string;
  currency:  string;
  dark?:     boolean;
}

function fmt(n: number, currency: string) {
  try { return new Intl.NumberFormat("en", { style:"currency", currency, maximumFractionDigits:0 }).format(n); }
  catch { return `${currency} ${n.toLocaleString()}`; }
}

export default function UpsellSection({ storeId, storeSlug, productId, brand, currency, dark }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const t = {
    text:   dark ? "rgba(255,255,255,0.85)" : "#111827",
    muted:  dark ? "rgba(255,255,255,0.4)"  : "#6b7280",
    card:   dark ? "rgba(255,255,255,0.04)" : "#fff",
    border: dark ? "rgba(255,255,255,0.07)" : "#f0f0f0",
    faint:  dark ? "rgba(255,255,255,0.03)" : "#f9f9f9",
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["upsell", storeId, productId],
    queryFn:  () => publicApi.get(`/products/public/${storeId}?limit=4&exclude=${productId}`).then(r => r.data.data?.slice(0,4) || []),
    enabled:  !!storeId && !!productId,
    staleTime: 300000,
  });

  if (isLoading || !products?.length) return null;

  return (
    <div className="mt-10">
      <h2 className="font-bold text-base mb-4" style={{ color: t.text }}>You might also like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((p: any, i: number) => {
          const img = p.images?.[0];
          const oos = p.inventory === 0;
          return (
            <motion.div key={p.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
              className="rounded-2xl overflow-hidden group" style={{ background:t.card, border:`1px solid ${t.border}` }}>
              <Link href={`/store/${storeSlug}/product/${p.id}`}>
                <div className="relative aspect-square" style={{ background:t.faint }}>
                  {img
                    ? <img src={img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ color:t.muted, opacity:0.3 }}>📦</div>
                  }
                  {oos && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background:"rgba(0,0,0,0.4)" }}>
                      <span className="text-xs font-bold text-white px-2 py-1 rounded-full" style={{ background:"rgba(0,0,0,0.6)" }}>Sold Out</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold truncate mb-1" style={{ color:t.text }}>{p.name}</p>
                  <p className="text-sm font-black" style={{ color:t.text }}>{fmt(p.price||0, currency)}</p>
                </div>
              </Link>
              {!oos && (
                <div className="px-3 pb-3">
                  <button
                    onClick={() => { addItem({ id:p.id, productId:p.id, name:p.name, price:p.price, image:img, storeId, storeSlug }); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background:`linear-gradient(135deg,${brand},${brand}cc)` }}>
                    <ShoppingCart size={11} /> Add
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
