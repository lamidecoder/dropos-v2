"use client";
// ============================================================
// KAI — Sidebar
// Path: frontend/src/components/kai/KAISidebar.tsx
// ============================================================
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pin, Trash2, Edit3, MessageSquare, MoreHorizontal, LayoutDashboard, X } from "lucide-react";
import Link from "next/link";
import { useKaiStore } from "@/store/kai.store";
import { useKai } from "@/hooks/useKai";

export function KAISidebar() {
  const { sidebarOpen, setSidebarOpen, activeConversationId } = useKaiStore();
  const { conversations, loadConversation, startNewConversation, renameConversation, pinConversation, deleteConversation } = useKai();
  const [search, setSearch]     = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditId]  = useState<string | null>(null);
  const [editTitle, setEditTtl] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = (conversations as any[]).filter((c: any) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const todayStr = now.toDateString();
  const yestDate = new Date(now); yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = yestDate.toDateString();

  const pinned    = filtered.filter((c: any) => c.pinned);
  const today     = filtered.filter((c: any) => !c.pinned && new Date(c.updatedAt).toDateString() === todayStr);
  const yesterday = filtered.filter((c: any) => !c.pinned && new Date(c.updatedAt).toDateString() === yestStr);
  const older     = filtered.filter((c: any) => {
    const d = new Date(c.updatedAt);
    const twoDaysAgo = new Date(now); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return !c.pinned && d < twoDaysAgo;
  });

  const doRename = (id: string) => {
    if (editTitle.trim()) renameConversation.mutate({ id, title: editTitle.trim() });
    setEditId(null);
  };

  const ConvItem = ({ conv }: { conv: any }) => {
    const isActive  = activeConversationId === conv.id;
    const isEditing = editingId === conv.id;
    const isMenu    = menuOpen === conv.id;

    return (
      <div
        className="group relative flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer transition-all"
        style={{
          background: isActive ? "rgba(124,58,237,0.15)" : "transparent",
          border: isActive ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
        }}
        onClick={() => !isEditing && (loadConversation(conv.id), setSidebarOpen(false))}
      >
        {isEditing ? (
          <input autoFocus value={editTitle} onChange={e => setEditTtl(e.target.value)}
            onBlur={() => doRename(conv.id)}
            onKeyDown={e => { if (e.key === "Enter") doRename(conv.id); if (e.key === "Escape") setEditId(null); }}
            className="flex-1 bg-transparent text-sm outline-none border-b py-0.5"
            style={{ color: "rgba(255,255,255,0.9)", borderColor: "rgba(124,58,237,0.5)", fontSize: "13px" }}
            onClick={e => e.stopPropagation()} />
        ) : (
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ color: isActive ? "#a78bfa" : "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              {conv.pinned && "📌 "}{conv.title}
            </p>
            {conv.messages?.[0] && (
              <p className="truncate mt-0.5" style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
                {conv.messages[0].content?.slice(0, 40)}
              </p>
            )}
          </div>
        )}

        {!isEditing && (
          <button className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded transition-all"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onClick={e => { e.stopPropagation(); setMenuOpen(isMenu ? null : conv.id); }}>
            <MoreHorizontal size={12} />
          </button>
        )}

        <AnimatePresence>
          {isMenu && (
            <motion.div ref={menuRef}
              className="absolute right-0 top-8 rounded-xl shadow-2xl overflow-hidden z-50 w-40"
              style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              onClick={e => e.stopPropagation()}>
              {[
                { icon: Edit3, label: "Rename", fn: () => { setEditId(conv.id); setEditTtl(conv.title); setMenuOpen(null); } },
                { icon: Pin,   label: conv.pinned ? "Unpin" : "Pin", fn: () => { pinConversation.mutate({ id: conv.id, pinned: !conv.pinned }); setMenuOpen(null); } },
                { icon: Trash2, label: "Delete", fn: () => { deleteConversation.mutate(conv.id); setMenuOpen(null); }, danger: true },
              ].map(item => (
                <button key={item.label} onClick={item.fn}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors"
                  style={{ color: item.danger ? "#f87171" : "rgba(255,255,255,0.7)" }}>
                  <item.icon size={12} />{item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const Group = ({ label, items }: { label: string; items: any[] }) => (
    items.length > 0 ? (
      <div className="mb-2">
        <p className="px-3 py-1 uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", letterSpacing: "0.1em" }}>
          {label}
        </p>
        {items.map(c => <ConvItem key={c.id} conv={c} />)}
      </div>
    ) : null
  );

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className="fixed top-0 left-0 h-full z-50 flex flex-col w-72 lg:relative lg:z-auto"
            style={{ background: "#0D0D1A", borderRight: "1px solid rgba(255,255,255,0.06)" }}
            initial={{ x: -288, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>K</div>
                <div>
                  <p className="text-white text-sm font-semibold">KAI</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "0.05em" }}>YOUR BUSINESS PARTNER</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-7 h-7 flex items-center justify-center"
                style={{ color: "rgba(255,255,255,0.4)" }}><X size={15} /></button>
            </div>

            {/* New chat */}
            <div className="px-3 py-3">
              <button onClick={() => { startNewConversation(); setSidebarOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                <Plus size={14} />New conversation
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Search size={12} style={{ color: "rgba(255,255,255,0.25)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations..." className="bg-transparent flex-1 outline-none text-sm"
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }} />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-3 transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                <LayoutDashboard size={13} />Back to Dashboard
              </Link>

              <Group label="Pinned" items={pinned} />
              <Group label="Today" items={today} />
              <Group label="Yesterday" items={yesterday} />
              <Group label="Older" items={older} />

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare size={22} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {search ? "No matches" : "No conversations yet"}
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
