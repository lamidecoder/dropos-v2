"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../../components/layout/DashboardLayout";
import { api } from "../../../../lib/api";
import { Users, Mail, Send, Trash2, Download, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6" };

export default function WaitlistAdminPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#16122A":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };

  const [search, setSearch] = useState("");
  const [blastSubject, setBlastSubject] = useState("");
  const [blastBody, setBlastBody] = useState("");
  const [showBlast, setShowBlast] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: () => api.get("/waitlist/admin").then(r => r.data.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["waitlist-stats"],
    queryFn: () => api.get("/waitlist/stats").then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/waitlist/admin/${id}`),
    onSuccess: () => { toast.success("Removed"); refetch(); },
  });

  const blastMut = useMutation({
    mutationFn: () => api.post("/waitlist/blast", { subject: blastSubject, html: `<p style="font-family:Inter,sans-serif;font-size:15px;line-height:1.7;color:#130D2E;">${blastBody}</p>` }),
    onSuccess: (res) => { toast.success(`Sent to ${res.data.data?.sent} people!`); setShowBlast(false); },
    onError: () => toast.error("Failed to send"),
  });

  const entries = (data?.entries || data || []).filter((e: any) =>
    !search || e.email?.toLowerCase().includes(search.toLowerCase()) || e.name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const csv = ["Position,Name,Email,Niche,Date"].concat(
      entries.map((e: any) => `${e.position},${e.name || ""},${e.email},${e.niche || ""},${new Date(e.createdAt).toLocaleDateString()}`)
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "waitlist.csv"; a.click();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: t.text, margin: "0 0 4px" }}>Waitlist</h1>
        <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>Manage and email everyone waiting for DropOS</p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Signups", value: stats?.total || entries.length, color: V.v400 },
          { label: "This Week",     value: stats?.thisWeek || 0,           color: "#10B981" },
          { label: "Niches",        value: stats?.niches || "—",           color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} style={{ padding: "16px 18px", borderRadius: 14, background: t.card, border: `1px solid ${t.border}` }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: s.color, margin: "0 0 4px", letterSpacing: "-0.04em" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.faint }}>
          <Search size={13} color={t.muted}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: t.text, fontFamily: "inherit" }}/>
        </div>
        <button onClick={exportCSV}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          <Download size={13}/> Export CSV
        </button>
        <button onClick={() => setShowBlast(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: `linear-gradient(135deg,${V.v500},#4C1D95)`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <Send size={13}/> Email All
        </button>
      </div>

      {/* Blast composer */}
      {showBlast && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: 20, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: t.text, margin: "0 0 14px" }}>Send to entire waitlist</h3>
          <input value={blastSubject} onChange={e => setBlastSubject(e.target.value)} placeholder="Subject line…"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: isDark?"rgba(255,255,255,0.04)":"#f9fafb", color: t.text, fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" }}/>
          <textarea value={blastBody} onChange={e => setBlastBody(e.target.value)} placeholder="Message body (plain text, will be wrapped in branded email)…" rows={4}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: isDark?"rgba(255,255,255,0.04)":"#f9fafb", color: t.text, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}/>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => blastMut.mutate()} disabled={!blastSubject || !blastBody || blastMut.isPending}
              style={{ padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg,${V.v500},#4C1D95)`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              {blastMut.isPending ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> Sending…</> : <><Send size={13}/> Send to {entries.length} people</>}
            </button>
            <button onClick={() => setShowBlast(false)}
              style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div style={{ borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 80px 80px", gap: 0, padding: "10px 16px", borderBottom: `1px solid ${t.border}` }}>
          {["#", "Name", "Email", "Niche", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Loader2 size={20} color={V.v400} style={{ animation: "spin 1s linear infinite" }}/>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <Users size={32} style={{ color: t.muted, marginBottom: 12 }}/>
            <p style={{ color: t.muted, fontSize: 14, margin: 0 }}>No waitlist entries yet</p>
          </div>
        ) : entries.slice(0, 100).map((e: any, i: number) => (
          <div key={e.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 80px 80px", gap: 0, padding: "11px 16px", borderBottom: i < entries.length - 1 ? `1px solid ${t.border}` : "none", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>#{e.position}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name || "—"}</span>
            <span style={{ fontSize: 12, color: t.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.email}</span>
            <span style={{ fontSize: 11, color: V.v400, background: `${V.v400}10`, borderRadius: 99, padding: "2px 8px", textAlign: "center" }}>{e.niche || "—"}</span>
            <button onClick={() => deleteMut.mutate(e.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.5)", padding: 4, display: "flex", justifyContent: "flex-end" }}>
              <Trash2 size={13}/>
            </button>
          </div>
        ))}
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
