"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { useTheme } from "../../../components/layout/DashboardLayout";
import KIROChat from "../../../components/kai/KAIChat";
import {
  Plus, MessageSquare, Trash2, Pin, Search,
  MoreHorizontal, ChevronLeft, Zap, Edit2
} from "lucide-react";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA" };

function groupByDate(conversations: any[]) {
  const now   = new Date();
  const today = now.toDateString();
  const yest  = new Date(now.setDate(now.getDate() - 1)).toDateString();
  const groups: Record<string, any[]> = { Today: [], Yesterday: [], "This week": [], Older: [] };

  conversations.forEach(c => {
    const d = new Date(c.updatedAt || c.createdAt).toDateString();
    if (d === today)      groups["Today"].push(c);
    else if (d === yest)  groups["Yesterday"].push(c);
    else if (Date.now() - new Date(c.updatedAt || c.createdAt).getTime() < 7 * 86400000)
                          groups["This week"].push(c);
    else                  groups["Older"].push(c);
  });

  return groups;
}

export default function KIROPage() {
  const { theme } = useTheme();
  const isDark    = theme === "dark";
  const t = isDark
    ? { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)", sidebar: "#0D0918" }
    : { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", sidebar: "#f8f7ff" };

  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const qc      = useQueryClient();

  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false); // mobile
  const [search,      setSearch]      = useState("");
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editTitle,   setEditTitle]   = useState("");

  const { data: conversations = [] } = useQuery({
    queryKey: ["kiro-conversations"],
    queryFn:  () => api.get("/kai/conversations").then(r => r.data.data || []),
    enabled:  !!user?.id,
    staleTime: 30000,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/kai/conversation/${id}`),
    onSuccess:  (_, id) => {
      qc.invalidateQueries({ queryKey: ["kiro-conversations"] });
      if (activeId === id) setActiveId(null);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, title, pinned }: any) => api.patch(`/kai/conversation/${id}`, { title, pinned }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["kiro-conversations"] }); setEditingId(null); },
  });

  const filtered = conversations.filter((c: any) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );
  const pinned    = filtered.filter((c: any) => c.pinned);
  const unpinned  = filtered.filter((c: any) => !c.pinned);
  const groups    = groupByDate(unpinned);

  function ConversationItem({ c }: { c: any }) {
    const active = activeId === c.id;
    const [menu, setMenu] = useState(false);

    if (editingId === c.id) {
      return (
        <div className="px-2 py-1">
          <input
            autoFocus value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") updateMut.mutate({ id: c.id, title: editTitle });
              if (e.key === "Escape") setEditingId(null);
            }}
            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: t.faint, border: `1px solid ${V.v400}`, color: t.text, fontFamily: "inherit" }}
          />
        </div>
      );
    }

    return (
      <div
        onClick={() => { setActiveId(c.id); setShowSidebar(false); }}
        className="group relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all mx-1"
        style={{ background: active ? "rgba(107,53,232,0.12)" : "transparent", border: `1px solid ${active ? "rgba(107,53,232,0.25)" : "transparent"}` }}>
        {c.pinned && <Pin size={9} style={{ color: V.v400, flexShrink: 0 }} />}
        <p className="flex-1 text-xs font-medium truncate" style={{ color: active ? V.v300 : t.muted }}>
          {c.title || "New conversation"}
        </p>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); setEditingId(c.id); setEditTitle(c.title || ""); }}
            className="p-1 rounded" style={{ color: t.muted, background: "none", border: "none", cursor: "pointer" }}>
            <Edit2 size={10} />
          </button>
          <button onClick={e => { e.stopPropagation(); updateMut.mutate({ id: c.id, pinned: !c.pinned }); }}
            className="p-1 rounded" style={{ color: t.muted, background: "none", border: "none", cursor: "pointer" }}>
            <Pin size={10} />
          </button>
          <button onClick={e => { e.stopPropagation(); deleteMut.mutate(c.id); }}
            className="p-1 rounded" style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer" }}>
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    );
  }

  function Sidebar() {
    return (
      <div className="flex flex-col h-full" style={{ background: t.sidebar }}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-3 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              <Zap size={11} color="white" />
            </div>
            <span className="text-sm font-black" style={{ color: t.text }}>KIRO</span>
          </div>
          <button onClick={() => setActiveId(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(107,53,232,0.1)", color: V.v300, border: "none", cursor: "pointer" }}>
            <Plus size={11} /> New
          </button>
        </div>

        {/* Search */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: t.faint, border: `1px solid ${t.border}` }}>
            <Search size={11} style={{ color: t.muted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations"
              className="flex-1 text-xs bg-transparent border-none outline-none"
              style={{ color: t.text, fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-1" style={{ scrollbarWidth: "none" }}>
          {pinned.length > 0 && (
            <div className="mb-2">
              <p className="px-4 py-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: t.muted }}>Pinned</p>
              {pinned.map((c: any) => <ConversationItem key={c.id} c={c} />)}
            </div>
          )}

          {Object.entries(groups).map(([label, convs]) =>
            convs.length > 0 ? (
              <div key={label} className="mb-2">
                <p className="px-4 py-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: t.muted }}>{label}</p>
                {convs.map((c: any) => <ConversationItem key={c.id} c={c} />)}
              </div>
            ) : null
          )}

          {filtered.length === 0 && (
            <div className="text-center py-8 px-4">
              <MessageSquare size={24} style={{ color: t.muted, opacity: 0.3, margin: "0 auto 8px" }} />
              <p className="text-xs" style={{ color: t.muted }}>No conversations yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full -m-5 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
      {/* Sidebar — desktop */}
      <div className="hidden md:block flex-shrink-0 border-r" style={{ width: 220, borderColor: t.border }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(0,0,0,0.6)" }} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden" style={{ width: 240 }}>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${t.border}`, background: t.card }}>
          <button onClick={() => setShowSidebar(true)} style={{ color: t.muted, background: "none", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold" style={{ color: t.text }}>KIRO</span>
          <button onClick={() => setActiveId(null)} className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(107,53,232,0.1)", color: V.v300, border: "none", cursor: "pointer" }}>
            <Plus size={11} /> New
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <KIROChat
            key={activeId || "new"}
            className="h-full"
            storeId={storeId}
          />
        </div>
      </div>
    </div>
  );
}
