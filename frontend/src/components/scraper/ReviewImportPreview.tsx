"use client";
// Path: frontend/src/components/scraper/ReviewImportPreview.tsx
import { motion } from "framer-motion";
import { Star, Shield, Download } from "lucide-react";

export function ReviewImportPreview({ reviews, isLoading, onImport, imported }: {
  reviews:   any[];
  isLoading: boolean;
  onImport:  () => void;
  imported:  boolean;
}) {
  if (isLoading) return (
    <div className="rounded-2xl p-5 flex items-center gap-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
        <Star size={16} style={{ color: "#fbbf24" }} />
      </motion.div>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
        KIRO is importing supplier reviews...
      </p>
    </div>
  );

  if (!reviews.length) return null;

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <motion.div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(251,191,36,0.2)" }}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: "rgba(251,191,36,0.06)", borderBottom: "1px solid rgba(251,191,36,0.1)" }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={13} fill={i <= Math.round(avgRating) ? "#fbbf24" : "none"}
                  style={{ color: "#fbbf24" }} />
              ))}
            </div>
            <span className="text-sm font-bold text-white">{avgRating.toFixed(1)}</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              · {reviews.length} reviews ready to import
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Real supplier reviews - builds instant trust with customers
          </p>
        </div>
        <button onClick={onImport} disabled={imported}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: imported ? "rgba(52,211,153,0.15)" : "#fbbf24",
            color:      imported ? "#34d399" : "#000",
          }}>
          {imported ? "✓ Imported" : <><Download size={12} />Import All</>}
        </button>
      </div>

      {/* Review list */}
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {reviews.slice(0, 4).map((review, i) => (
          <motion.div key={i} className="px-5 py-4"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `hsl(${i * 60 + 180}, 50%, 35%)`, color: "#fff" }}>
                  {review.reviewerName?.[0] || "?"}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{review.reviewerName}</p>
                  <div className="flex items-center gap-1.5">
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{review.reviewerCountry}</p>
                    {review.verified && (
                      <div className="flex items-center gap-0.5" style={{ color: "#34d399" }}>
                        <Shield size={8} />
                        <span style={{ fontSize: "9px" }}>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} fill={s <= review.rating ? "#fbbf24" : "none"}
                    style={{ color: "#fbbf24" }} />
                ))}
              </div>
            </div>
            {review.title && (
              <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                {review.title}
              </p>
            )}
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              {review.body}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{review.date}</p>
          </motion.div>
        ))}
        {reviews.length > 4 && (
          <div className="px-5 py-3 text-center">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              +{reviews.length - 4} more reviews will be imported
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
