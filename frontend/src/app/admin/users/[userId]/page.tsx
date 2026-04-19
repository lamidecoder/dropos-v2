"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../../lib/api";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  ArrowLeft, Edit2, Save, X, Trash2, Flag, Globe, Phone,
  MapPin, Mail, Shield, Key, Ban, UserCheck, Copy, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function UserDetailPage() {
  const { userId }  = useParams<{ userId: string }>();
  const { theme }   = useTheme();
  const dark        = theme === "dark";
  const router      = useRouter();
  const qc          = useQueryClient();
  const [tab, setTab]         = useState<"overview" | "stores" | "payments" | "account">("overview");
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const inp  = "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";
  const GRAD = "linear-gradient(135deg,#7c3aed,#a855f7)";

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn:  () => adminAPI.getUser(userId).then((r) => r.data.data),
  });
  const user = res;

  const schema = z.object({
    name:          z.string().min(2).optional(),
    email:         z.string().email().optional(),
    phone:         z.string().optional(),
    status:        z.enum(["ACTIVE", "SUSPENDED", "BANNED"]).optional(),
    emailVerified: z.boolean().optional(),
    twoFAEnabled:  z.boolean().optional(),
    adminNotes:    z.string().optional(),
    flags:         z.array(z.string()).optional(),
    country:       z.string().optional(),
    city:          z.string().optional(),
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { isDirty } } = useForm({
    resolver: zodResolver(schema),
    values:   user ? {
      name:          user.name,
      email:         user.email,
      phone:         user.phone || "",
      status:        user.status,
      emailVerified: user.emailVerified,
      twoFAEnabled:  user.twoFAEnabled,
      adminNotes:    user.adminNotes || "",
      flags:         user.flags || [],
      country:       user.country || "",
      city:          user.city || "",
    } : undefined,
  });

  const currentFlags = watch("flags") || [];
  const currentStatus = watch("status");

  const updateUser = useMutation({
    mutationFn: (data: any) => adminAPI.updateUser(userId, data),
    onSuccess: () => {
      toast.success("User saved");
      qc.invalidateQueries({ queryKey: ["admin-user", userId] });
      setEditing(false);
    },
    onError: () => toast.error("Save failed"),
  });

  const updateSub = useMutation({
    mutationFn: (data: any) => adminAPI.updateSubscription(userId, data),
    onSuccess: () => { toast.success("Subscription updated"); qc.invalidateQueries({ queryKey: ["admin-user", userId] }); },
    onError:   () => toast.error("Update failed"),
  });

  const deleteUser = useMutation({
    mutationFn: () => adminAPI.deleteUser(userId),
    onSuccess: () => { toast.success("User deleted"); router.push("/admin/users"); },
    onError:   () => toast.error("Delete failed"),
  });

  const toggleFlag = (flag: string) => {
    const flags = currentFlags.includes(flag)
      ? currentFlags.filter((f: string) => f !== flag)
      : [...currentFlags, flag];
    setValue("flags", flags, { shouldDirty: true });
  };

  if (isLoading) return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
  );

  if (!user) return (
      <div className={`text-center py-20 ${sub}`}>User not found</div>
  );

  const TABS = [
    { id: "overview",  label: "Overview" },
    { id: "stores",    label: `Stores (${user.stores?.length || 0})` },
    { id: "payments",  label: "Payments" },
    { id: "account",   label: "Account" },
  ] as const;

  return (
      <div className="max-w-4xl space-y-6">
        {/* Back */}
        <Link href="/admin/users" className={`inline-flex items-center gap-2 text-sm font-semibold ${sub} hover:text-violet-500 transition-all`}>
          <ArrowLeft size={16} /> Back to Users
        </Link>

        {/* Header card */}
        <div className={`rounded-2xl border p-6 bg-[var(--bg-card)]/60 border-[var(--border)]/50`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--text-primary)] text-xl font-black shadow-lg shadow-violet-500/30"
                style={{ background: GRAD }}>
                {user.name?.charAt(0)}
              </div>
              <div>
                <h1 className={`text-xl font-black ${tx}`}>{user.name}</h1>
                <p className={`text-sm ${sub}`}>{user.id} · Joined {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                ${user.status === "ACTIVE" ? "bg-emerald-400/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-400/10 text-red-600 dark:text-red-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`} />
                {user.status}
              </span>

              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] shadow-lg shadow-violet-500/20"
                  style={{ background: GRAD }}>
                  <Edit2 size={12} /> Edit User
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSubmit((d) => updateUser.mutate(d))} disabled={updateUser.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60">
                    <Save size={12} /> {updateUser.isPending ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => { setEditing(false); reset(); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${"border-[var(--border-strong)] text-[var(--text-tertiary)]"}`}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Flags */}
          {user.flags?.length > 0 && (
            <div className={`mt-4 flex flex-wrap gap-2 p-3 rounded-xl border border-red-500/20 bg-red-100 dark:bg-red-900/10`}>
              <Flag size={13} className="text-red-500 mt-0.5" />
              {user.flags.map((f: string) => (
                <span key={f} className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                  {f.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Revenue summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { l: "Total Revenue", v: `$${(user.totalRevenue || 0).toLocaleString()}`,  c: "text-emerald-700 dark:text-emerald-400" },
            { l: "Platform Fees", v: `$${(user.platformFees || 0).toLocaleString()}`,  c: "text-red-600 dark:text-red-400" },
            { l: "Net Payouts",   v: `$${(user.payouts || 0).toLocaleString()}`,       c: "text-amber-700 dark:text-amber-400" },
          ].map((s) => (
            <div key={s.l} className={`rounded-2xl border p-5 text-center bg-[var(--bg-card)]/60 border-[var(--border)]/50`}>
              <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
              <div className={`text-xs mt-1 ${sub}`}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 border-b border-[var(--border)]`}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all
                ${tab === t.id ? "border-violet-500 text-violet-500" : `border-transparent ${sub}`}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", field: "name",    Icon: Mail },
                { label: "Email",     field: "email",   Icon: Mail },
                { label: "Phone",     field: "phone",   Icon: Phone },
                { label: "Location",  field: "city",    Icon: MapPin },
              ].map(({ label, field, Icon }) => (
                <div key={field} className={`rounded-xl border p-4 ${card}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={12} className="text-amber-700 dark:text-amber-400" />
                    <span className={`text-xs font-semibold ${sub}`}>{label}</span>
                  </div>
                  {editing ? (
                    <input {...register(field as any)}
                      className={`w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-violet-500 transition-all ${inp}`} />
                  ) : (
                    <span className={`text-sm font-semibold ${tx}`}>{(user as any)[field] || "—"}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Plan */}
            <div className={`rounded-xl border p-4 flex items-center justify-between ${card}`}>
              <div>
                <div className={`text-xs font-semibold ${sub} mb-2`}>Subscription Plan</div>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full
                  ${user.subscription?.plan === "ADVANCED" ? "bg-violet-400/10 text-violet-700 dark:text-violet-400"
                    : user.subscription?.plan === "PRO" ? "bg-amber-400/10 text-amber-700 dark:text-amber-400"
                    : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"}`}>
                  {user.subscription?.plan || "STARTER"}
                </span>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`text-xs ${sub}`}>Expires {user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : "—"}</span>
                {editing && (
                  <select onChange={(e) => updateSub.mutate({ plan: e.target.value })}
                    defaultValue={user.subscription?.plan}
                    className={`rounded-lg px-3 py-1.5 text-xs border outline-none focus:border-violet-500 ${inp}`}>
                    {["STARTER", "PRO", "ADVANCED"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Admin notes */}
            <div className={`rounded-xl border p-4 ${card}`}>
              <div className={`text-xs font-semibold ${sub} mb-2`}>Admin Notes</div>
              {editing ? (
                <textarea {...register("adminNotes")} rows={3}
                  className={`w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-violet-500 resize-none ${inp}`} />
              ) : (
                <p className={`text-sm ${tx}`}>{user.adminNotes || "No notes."}</p>
              )}
            </div>

            {/* Status (editing only) */}
            {editing && (
              <div className={`rounded-xl border p-4 ${card}`}>
                <div className={`text-xs font-semibold ${sub} mb-3`}>Account Status</div>
                <div className="flex gap-2">
                  {["ACTIVE", "SUSPENDED", "BANNED"].map((s) => (
                    <button key={s} type="button"
                      onClick={() => setValue("status", s as any, { shouldDirty: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold capitalize border transition-all
                        ${currentStatus === s
                          ? s === "ACTIVE" ? "bg-emerald-600 border-emerald-600 text-[var(--text-primary)]"
                            : s === "SUSPENDED" ? "bg-amber-600 border-amber-600 text-[var(--text-primary)]"
                            : "bg-red-600 border-red-600 text-[var(--text-primary)]"
                          : "border-[var(--border-strong)] text-[var(--text-tertiary)]"}`}>
                      {s.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delete */}
            <div className={`rounded-xl border border-red-500/20 p-4 bg-red-100 dark:bg-red-900/10`}>
              <p className="text-xs font-bold text-red-500 mb-3">Danger Zone</p>
              {!confirmDel ? (
                <button onClick={() => setConfirmDel(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-[var(--text-primary)] text-xs font-bold">
                  <Trash2 size={12} /> Delete Account
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-red-600 dark:text-red-400">Permanently deletes this user and ALL their data. Cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => deleteUser.mutate()}
                      className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-[var(--text-primary)] text-xs font-bold">
                      Yes, Delete Permanently
                    </button>
                    <button onClick={() => setConfirmDel(false)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border ${"border-[var(--border-strong)] text-[var(--text-tertiary)]"}`}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STORES TAB ───────────────────────────────────────── */}
        {tab === "stores" && (
          <div className="space-y-4">
            {user.stores?.map((store: any) => (
              <div key={store.id} className={`rounded-2xl border p-5 bg-[var(--bg-card)]/60 border-[var(--border)]/50`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`font-bold ${tx}`}>{store.name}</div>
                    <div className={`text-xs mt-1 ${sub} flex items-center gap-1`}>
                      <Globe size={11} /> {store.domain || store.slug + ".dropos.io"}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${store.status === "ACTIVE" ? "bg-emerald-400/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-400/10 text-red-600 dark:text-red-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${store.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`} />
                    {store.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "Orders",   v: store._count?.orders || 0 },
                    { l: "Products", v: store._count?.products || 0 },
                    { l: "Customers",v: store._count?.customers || 0 },
                  ].map((m) => (
                    <div key={m.l} className={`rounded-lg p-3 text-center border bg-[#08080f] border-[var(--border)]`}>
                      <div className={`text-base font-black ${tx}`}>{m.v}</div>
                      <div className={`text-xs ${sub}`}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div className={`mt-3 text-xs ${sub}`}>
                  <span className="font-semibold">ID:</span> {store.id} ·{" "}
                  <span className="font-semibold">Created:</span> {new Date(store.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {!user.stores?.length && (
              <div className={`text-center py-12 ${sub}`}>No stores yet</div>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ─────────────────────────────────────── */}
        {tab === "payments" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { l: "Total Revenue", v: `$${(user.totalRevenue || 0).toLocaleString()}`, c: "text-emerald-700 dark:text-emerald-400" },
                { l: "Platform Fees", v: `$${(user.platformFees || 0).toLocaleString()}`, c: "text-red-600 dark:text-red-400" },
                { l: "Net Payouts",   v: `$${(user.payouts || 0).toLocaleString()}`,      c: "text-amber-700 dark:text-amber-400" },
              ].map((s) => (
                <div key={s.l} className={`rounded-xl border p-4 text-center bg-[var(--bg-card)]/60 border-[var(--border)]/50`}>
                  <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
                  <div className={`text-xs ${sub} mt-0.5`}>{s.l}</div>
                </div>
              ))}
            </div>
            {user.stores?.map((store: any) => (
              <div key={store.id}>
                {store.payments?.length > 0 && (
                  <div className={`rounded-xl border p-4 bg-[var(--bg-card)]/60 border-[var(--border)]/50`}>
                    <div className={`text-xs font-semibold ${sub} mb-3`}>{store.name} — Recent Payments</div>
                    <div className="space-y-2">
                      {store.payments.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className={`font-semibold ${tx}`}>${(p.amount || 0).toFixed(2)}</span>
                          <span className="text-red-600 dark:text-red-400 text-xs">-${(p.platformFee || 0).toFixed(2)} fee</span>
                          <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">${(p.storeEarnings || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ACCOUNT TAB ──────────────────────────────────────── */}
        {tab === "account" && (
          <div className="space-y-4">
            {/* Verification toggles */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: "Email Verified", f: "emailVerified" as const },
                { l: "2FA Enabled",    f: "twoFAEnabled" as const },
              ].map(({ l, f }) => {
                const val = watch(f);
                return (
                  <div key={f} className={`rounded-xl border p-4 flex items-center justify-between ${card}`}>
                    <span className={`text-sm font-semibold ${tx}`}>{l}</span>
                    {editing ? (
                      <button type="button" onClick={() => setValue(f, !val, { shouldDirty: true })}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${val ? "bg-emerald-600 text-[var(--text-primary)]" : "bg-slate-600 text-[var(--text-secondary)]"}`}>
                        {val ? "ON" : "OFF"}
                      </button>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${(user as any)[f] ? "bg-emerald-600/20 text-emerald-700 dark:text-emerald-400" : "bg-slate-700 text-[var(--text-tertiary)]"}`}>
                        {(user as any)[f] ? "Yes" : "No"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Account ID */}
            <div className={`rounded-xl border p-4 ${card}`}>
              <div className={`text-xs font-semibold ${sub} mb-2`}>Account ID</div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm font-bold ${tx}`}>{user.id}</span>
                <button onClick={() => { navigator.clipboard.writeText(user.id); toast.success("Copied!"); }}
                  className={`p-1.5 rounded-lg hover:bg-slate-700`}>
                  <Copy size={12} className={sub} />
                </button>
              </div>
            </div>

            {/* Flags (editing) */}
            {editing && (
              <div className={`rounded-xl border p-4 ${card}`}>
                <div className={`text-xs font-semibold ${sub} mb-3`}>Account Flags</div>
                {["payment_dispute", "chargeback", "suspicious_activity", "policy_violation", "high_risk"].map((f) => (
                  <label key={f} className="flex items-center gap-3 py-1.5 cursor-pointer">
                    <input type="checkbox" checked={currentFlags.includes(f)} onChange={() => toggleFlag(f)}
                      className="accent-violet-500 w-4 h-4" />
                    <span className={`text-sm capitalize ${tx}`}>{f.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Admin actions */}
            <div className={`rounded-xl border p-4 ${card}`}>
              <div className={`text-xs font-semibold ${sub} mb-3`}>Admin Actions</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Send Email",     Icon: Mail,      cls: "text-amber-700 dark:text-amber-400  bg-amber-600/20  hover:bg-amber-600/30" },
                  { label: "Force Suspend",  Icon: Ban,       cls: "text-red-600 dark:text-red-400    bg-red-600/20    hover:bg-red-600/30" },
                  { label: "Reset Password", Icon: Key,       cls: "text-amber-700 dark:text-amber-400 bg-violet-600/20 hover:bg-violet-600/30" },
                  { label: "Verify Email",   Icon: UserCheck, cls: "text-emerald-700 dark:text-emerald-400 bg-emerald-600/20 hover:bg-emerald-600/30" },
                ].map(({ label, Icon, cls }) => (
                  <button key={label}
                    onClick={() => toast("Feature not yet implemented", { icon: "🚧" })}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${cls}`}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}