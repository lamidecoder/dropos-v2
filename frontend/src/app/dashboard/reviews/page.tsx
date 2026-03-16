"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Star, Check, Trash2, MessageSquare, Shield, Image as ImageIcon,
  X, ChevronDown, TrendingUp, AlertCircle, Filter, MoreVertical,
  ThumbsUp, Send, Flag, Eye,
} from "lucide-react";

// ── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} style={{ color: i <= rating ? "#F59E0B" : "var(--border-strong)" }}
          fill={i <= rating ? "#F59E0B" : "none"} />
      ))}
    </div>
  );
}

// ── Rating histogram ──────────────────────────────────────────────────────────
function RatingHistogram({ reviews }: { reviews: any[] }) {
  const counts = [5,4,3,2,1].map(r => ({
    r, count: reviews.filter(rev => rev.rating === r).length
  }));
  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="space-y-1.5">
      {counts.map(({ r, count }) => (
        <div key={r} className="flex items-center gap-2">
          <span className="text-[11px] font-semibold w-3" style={{ color: "var(--text-tertiary)" }}>{r}</span>
          <Star size={10} fill="#F59E0B" style={{ color: "#F59E0B", flexShrink: 0 }} />
          <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-secondary)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(count / max) * 100}%`, background: r >= 4 ? "#10B981" : r === 3 ? "#F59E0B" : "#EF4444" }} />
          </div>
          <span className="text-[11px] w-4 text-right" style={{ color: "var(--text-tertiary)" }}>{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ r, storeId }: { r: any; storeId: string }) {
  const qc            = useQueryClient();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState(r.replyBody || "");
  const [lightbox, setLightbox]   = useState<string | null>(null);

  const approveMut = useMutation({
    mutationFn: () => api.patch(`/reviews/${storeId}/${r.id}/approve`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["reviews-admin"] }),
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const featureMut = useMutation({
    mutationFn: () => api.patch(`/reviews/${storeId}/${r.id}/feature`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["reviews-admin"] }),
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const replyMut = useMutation({
    mutationFn: () => api.patch(`/reviews/${storeId}/${r.id}/reply`, { replyBody: replyText }),
    onSuccess:  () => { toast.success("Reply saved!"); qc.invalidateQueries({ queryKey: ["reviews-admin"] }); setReplying(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const deleteMut = useMutation({
    mutationFn: () => api.delete(`/reviews/${storeId}/${r.id}`),
    onSuccess:  () => { toast.success("Review deleted"); qc.invalidateQueries({ queryKey: ["reviews-admin"] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const ratingColor = r.rating >= 4 ? "#10B981" : r.rating === 3 ? "#F59E0B" : "#EF4444";

  return (
    <>
      <div className="rounded-2xl overflow-hidden transition-all"
        style={{ background: "var(--bg-card)", border: `1px solid ${r.featured ? "rgba(245,158,11,0.4)" : "var(--border)"}`, boxShadow: r.featured ? "0 0 0 1px rgba(245,158,11,0.15)" : "var(--shadow-sm)" }}>

        {r.featured && (
          <div className="px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-bold"
            style={{ background: "rgba(245,158,11,0.08)", color: "#F59E0B" }}>
            <Star size={10} fill="#F59E0B" /> Featured Review
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-[var(--text-primary)] flex-shrink-0"
                style={{ background: `hsl(${r.name.charCodeAt(0) * 7 % 360},60%,50%)` }}>
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r.name}</span>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                      <Shield size={8} /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars rating={r.rating} size={11} />
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!r.approved && (
                <button onClick={() => approveMut.mutate()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                  <Check size={11} /> Approve
                </button>
              )}
              <button onClick={() => featureMut.mutate()}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: r.featured ? "#F59E0B" : "var(--text-tertiary)", background: r.featured ? "rgba(245,158,11,0.1)" : "transparent" }}
                title={r.featured ? "Unfeature" : "Feature"}>
                <Star size={13} fill={r.featured ? "#F59E0B" : "none"} />
              </button>
              <button onClick={() => deleteMut.mutate()}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--error)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Content */}
          {r.title && (
            <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{r.title}</div>
          )}
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.body}</p>

          {/* Photos */}
          {r.photos?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {r.photos.map((url: string, i: number) => (
                <button key={i} onClick={() => setLightbox(url)}
                  className="w-16 h-16 rounded-xl overflow-hidden border transition-all hover:scale-105"
                  style={{ borderColor: "var(--border)" }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Status / meta */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full`}
              style={{
                background: r.approved ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                color:       r.approved ? "#10B981" : "#F59E0B",
              }}>
              {r.approved ? <><Check size={9} /> Approved</> : <><AlertCircle size={9} /> Pending</>}
            </span>
            {r.helpful > 0 && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                <ThumbsUp size={10} /> {r.helpful} helpful
              </span>
            )}
            {r.source && (
              <span className="text-[11px] capitalize" style={{ color: "var(--text-tertiary)" }}>{r.source}</span>
            )}
          </div>

          {/* Reply */}
          {r.replyBody && !replying && (
            <div className="mt-3 pl-3 py-2.5 pr-3 rounded-xl"
              style={{ background: "var(--accent-dim)", borderLeft: "3px solid var(--accent)" }}>
              <div className="text-[11px] font-bold mb-1" style={{ color: "var(--accent)" }}>Store Reply</div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.replyBody}</p>
              <button onClick={() => setReplying(true)} className="text-[10px] mt-1 font-semibold" style={{ color: "var(--accent)" }}>
                Edit reply
              </button>
            </div>
          )}

          {replying && (
            <div className="mt-3 space-y-2">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                rows={3} placeholder="Write a reply visible to all customers..."
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <div className="flex gap-2">
                <button onClick={() => replyMut.mutate()} disabled={!replyText.trim() || replyMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-primary)] disabled:opacity-60"
                  style={{ background: "var(--accent)" }}>
                  <Send size={11} /> {replyMut.isPending ? "Saving…" : "Post Reply"}
                </button>
                <button onClick={() => setReplying(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!replying && !r.replyBody && (
            <button onClick={() => setReplying(true)}
              className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
              <MessageSquare size={11} /> Reply to review
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
            <X size={18} />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const [filter, setFilter] = useState<"all"|"pending"|"approved"|"featured"|"with-photos">("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sort, setSort]     = useState<"newest"|"oldest"|"rating-high"|"rating-low">("newest");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews-admin", storeId],
    queryFn:  () => api.get(`/reviews/${storeId}/all`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const bulkApproveMut = useMutation({
    mutationFn: () => api.post(`/reviews/${storeId}/approve-all`),
    onSuccess:  () => { toast.success("All pending reviews approved!"); qc.invalidateQueries({ queryKey: ["reviews-admin"] });
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")); },
  });

  // Filter + sort
  let filtered = reviews.filter((r: any) => {
    if (filter === "pending")     return !r.approved;
    if (filter === "approved")    return  r.approved;
    if (filter === "featured")    return  r.featured;
    if (filter === "with-photos") return  r.photos?.length > 0;
    return true;
  });

  if (ratingFilter) filtered = filtered.filter((r: any) => r.rating === ratingFilter);

  filtered = [...filtered].sort((a: any, b: any) => {
    if (sort === "newest")      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "oldest")      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "rating-high") return b.rating - a.rating;
    if (sort === "rating-low")  return a.rating - b.rating;
    return 0;
  });

  const pending   = reviews.filter((r: any) => !r.approved).length;
  const approved  = reviews.filter((r: any) =>  r.approved).length;
  const withPhotos = reviews.filter((r: any) => r.photos?.length > 0).length;
  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Reviews</h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              Moderate, reply, and feature customer reviews
            </p>
          </div>
          {pending > 0 && (
            <button onClick={() => bulkApproveMut.mutate()} disabled={bulkApproveMut.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] hover:opacity-90 disabled:opacity-60"
              style={{ background: "#10B981", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
              <Check size={14} /> Approve All ({pending})
            </button>
          )}
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg Rating",   value: avgRating ? avgRating.toFixed(1) + " ★" : "—", color: "#F59E0B" },
            { label: "Total Reviews",value: reviews.length,   color: "var(--accent)"    },
            { label: "Pending",      value: pending,           color: "#F59E0B"          },
            { label: "With Photos",  value: withPhotos,        color: "#3B82F6"          },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="text-xl font-black" style={{ color }}>{value}</div>
              <div className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Rating histogram */}
        {reviews.length > 0 && (
          <div className="rounded-2xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-6">
              <div className="text-center flex-shrink-0">
                <div className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>{avgRating.toFixed(1)}</div>
                <Stars rating={Math.round(avgRating)} size={14} />
                <div className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>{reviews.length} reviews</div>
              </div>
              <div className="flex-1 min-w-0">
                <RatingHistogram reviews={reviews} />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "all",         label: `All (${reviews.length})`   },
            { key: "pending",     label: `Pending (${pending})`       },
            { key: "approved",    label: `Approved (${approved})`     },
            { key: "featured",    label: "Featured"                   },
            { key: "with-photos", label: `With Photos (${withPhotos})`},
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key as any)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === key ? "var(--accent-dim)"  : "var(--bg-secondary)",
                color:      filter === key ? "var(--accent)"      : "var(--text-secondary)",
                border:     `1px solid ${filter === key ? "var(--accent-border)" : "var(--border)"}`,
              }}>
              {label}
            </button>
          ))}

          {/* Rating filter */}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[5,4,3,2,1].map(r => (
                <button key={r} onClick={() => setRatingFilter(ratingFilter === r ? null : r)}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: ratingFilter === r ? "rgba(245,158,11,0.15)" : "var(--bg-secondary)",
                    color:      ratingFilter === r ? "#F59E0B" : "var(--text-tertiary)",
                    border:     `1px solid ${ratingFilter === r ? "rgba(245,158,11,0.3)" : "var(--border)"}`,
                  }}>
                  {r}★
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="rating-high">Highest rating</option>
              <option value="rating-low">Lowest rating</option>
            </select>
          </div>
        </div>

        {/* Reviews list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="rounded-2xl h-40 skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center"
            style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
            <MessageSquare size={36} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
            <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>No reviews yet</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Reviews will appear here once customers leave feedback on your products.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r: any) => (
              <ReviewCard key={r.id} r={r} storeId={storeId!} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}