"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Star, ThumbsUp, Flag, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";

const schema = z.object({
  rating:    z.number().min(1).max(5),
  name:      z.string().min(2, "Name required"),
  email:     z.string().email("Valid email required"),
  title:     z.string().optional(),
  body:      z.string().min(10, "Review must be at least 10 characters"),
  verified:  z.boolean().default(false),
});

interface Props {
  productId: string;
  storeId:   string;
  brand:     string;
}

function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  const display = onChange ? (hovered || value) : value;

  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((n) => (
        <button key={n} type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}>
          <Star size={size}
            className={n <= display ? "fill-amber-400 text-amber-400" : "text-slate-300"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, storeId, brand }: Props) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn:  () => api.get(`/reviews/${storeId}/${productId}`).then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema.omit({ rating: true })),
  });

  const submitMut = useMutation({
    mutationFn: (d: any) => api.post(`/reviews/${storeId}/${productId}`, { ...d, rating }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      reset();
      setRating(5);
      setShowForm(false);
    },
  });

  const helpfulMut = useMutation({
    mutationFn: (id: string) => api.post(`/reviews/${storeId}/${productId}/${id}/helpful`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews", productId] }),
  });

  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r: any) => r.rating === n).length,
    pct:   reviews.length ? (reviews.filter((r: any) => r.rating === n).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-black text-slate-900 mb-8">Customer Reviews</h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          {/* Average */}
          <div className="text-center sm:text-left">
            <div className="text-6xl font-black text-slate-900">{avgRating.toFixed(1)}</div>
            <StarRating value={Math.round(avgRating)} size={18} />
            <div className="text-sm text-slate-400 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-2">
            {ratingDist.map(({ n, count, pct }) => (
              <div key={n} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-4">{n}</span>
                <Star size={12} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${brand}, ${brand}99)` }} />
                </div>
                <span className="text-xs text-slate-400 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="animate-pulse p-5 rounded-2xl border border-slate-200">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-2.5 w-16 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-full mb-1.5" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Star size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-500">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this product</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {reviews.map((review: any) => (
            <div key={review.id} className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-primary)] font-bold text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)` }}>
                    {review.name?.charAt(0)?.toUpperCase() || <User size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{review.name}</span>
                      {review.verified && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={review.rating} size={12} />
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h4 className="font-bold text-slate-900 mb-1">{review.title}</h4>
              )}
              <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>

              <div className="flex items-center gap-3 mt-4">
                <button onClick={() => helpfulMut.mutate(review.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                  <ThumbsUp size={12} /> Helpful {review.helpful > 0 && `(${review.helpful})`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write review CTA / Form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-[var(--text-primary)] shadow-md"
          style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)` }}>
          <Star size={16} /> Write a Review
        </button>
      ) : (
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50">
          <h3 className="font-black text-slate-900 mb-5">Write Your Review</h3>
          <form onSubmit={handleSubmit((d) => submitMut.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Rating *</label>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Your Name *</label>
                <input {...register("name")} placeholder="John Doe"
                  className="w-full rounded-xl px-3 py-2.5 text-sm border-2 border-slate-200 outline-none focus:border-violet-500 transition-all bg-white" />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Email *</label>
                <input {...register("email")} type="email" placeholder="john@email.com"
                  className="w-full rounded-xl px-3 py-2.5 text-sm border-2 border-slate-200 outline-none focus:border-violet-500 transition-all bg-white" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Review Title</label>
              <input {...register("title")} placeholder="Summarize your experience"
                className="w-full rounded-xl px-3 py-2.5 text-sm border-2 border-slate-200 outline-none focus:border-violet-500 transition-all bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Review *</label>
              <textarea {...register("body")} rows={4} placeholder="Share your experience with this product…"
                className="w-full rounded-xl px-3 py-2.5 text-sm border-2 border-slate-200 outline-none focus:border-violet-500 resize-none transition-all bg-white" />
              {errors.body && <p className="text-xs text-red-400 mt-1">{errors.body.message}</p>}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitMut.isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${brand}, ${brand}bb)` }}>
                {submitMut.isPending ? "Submitting…" : "Submit Review"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-3 rounded-xl text-sm font-semibold border-2 border-slate-200 text-slate-500">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
