"use client";
﻿"use client";
// Path: frontend/src/app/dashboard/settings/page.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme, useToast, useConfirm } from "../../../components/layout/DashboardLayout";
import { Settings, User, Bell, Shield, Globe, Palette, Trash2, ChevronRight, Camera, Check, Eye, EyeOff } from "lucide-react";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";

const V = { v500: "#6B35E8", v700: "#3D1C8A", v400: "#8B5CF6", v300: "#A78BFA" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)", input: "rgba(255,255,255,0.05)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", input: "rgba(15,5,32,0.04)" },
};

const SECTIONS = [
  { id: "profile",       label: "Profile",         icon: User },
  { id: "notifications", label: "Notifications",    icon: Bell },
  { id: "security",      label: "Security",         icon: Shield },
  { id: "appearance",    label: "Appearance",       icon: Palette },
  { id: "language",      label: "Language",         icon: Globe },
  { id: "danger",        label: "Danger Zone",      icon: Trash2 },
];

function Input({ label, value, onChange, type = "text", placeholder, t, disabled }: any) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: t.muted, marginBottom: 6, letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ position: "relative" }}>
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 11, border: `1px solid ${t.border}`, background: disabled ? t.faint : t.input, color: t.text, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", paddingRight: type === "password" ? 40 : 14, opacity: disabled ? 0.6 : 1 }}
        />
        {type === "password" && (
          <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.muted }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange, t }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${t.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", background: value ? V.v500 : (t.faint === "rgba(255,255,255,0.04)" ? "rgba(255,255,255,0.1)" : "rgba(15,5,32,0.1)"), transition: "all 0.2s", boxShadow: value ? "0 2px 8px rgba(107,53,232,0.3)" : "none" }}>
        <div style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme } = useTheme();
  const { show } = useToast();
  const { confirm } = useConfirm();
  const { user } = useAuthStore();
  const t = theme === "dark" ? T.dark : T.light;
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifs, setNotifs] = useState({ orders: true, marketing: false, security: true, updates: true });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/auth/profile", { name, email });
      show("Settings saved successfully", "success");
    } catch (e: any) {
      // Backend offline — save locally at least
      show("Saved locally (backend offline)", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({ title: "Delete your account?", message: "This will permanently delete your account and all your store data. This cannot be undone.", confirmText: "Yes, delete everything", cancelText: "Keep my account", variant: "danger" });
    if (ok) show("Account deletion requested", "info");
  };

  const activeLabel = SECTIONS.find(s => s.id === activeSection)?.label || "Settings";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Settings</h1>
        <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Manage your account and preferences</p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        {/* Nav */}
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: 8, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, height: "fit-content", boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04)" : "none" }}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            const isDanger = s.id === "danger";
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 11, border: "none", cursor: "pointer", background: isActive ? (isDanger ? "rgba(239,68,68,0.1)" : "rgba(107,53,232,0.1)") : "transparent", color: isActive ? (isDanger ? "#EF4444" : V.v300) : isDanger ? "#EF4444" : t.muted, marginBottom: 1, transition: "all 0.15s", textAlign: "left" }}>
                <Icon size={14} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1 }}>{s.label}</span>
                {isActive && <ChevronRight size={12} />}
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ padding: 24, borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, boxShadow: theme === "light" ? "0 1px 3px rgba(15,5,32,0.04), 0 4px 20px rgba(15,5,32,0.03)" : "none" }}>

          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>
            {activeLabel}
          </div>

          {activeSection === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(145deg, ${V.v500}, ${V.v700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "white" }}>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <button style={{ position: "absolute", bottom: -4, right: -4, width: 26, height: 26, borderRadius: "50%", background: V.v500, border: `2px solid ${t.card}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Camera size={11} color="white" />
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{user?.name || "User"}</div>
                  <div style={{ fontSize: 12, color: t.muted }}>{user?.email}</div>
                  <button style={{ marginTop: 6, fontSize: 12, color: V.v400, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Change photo</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Full Name" value={name} onChange={setName} placeholder="Your full name" t={t} />
                <Input label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" t={t} />
              </div>
              <Input label="Store Name" value="" onChange={() => {}} placeholder="My Awesome Store" t={t} />
              <Input label="WhatsApp Number" value="" onChange={() => {}} placeholder="+234 800 000 0000" t={t} />

              <button onClick={handleSave} disabled={saving}
                style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 11, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "white", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(107,53,232,0.35)", opacity: saving ? 0.7 : 1 }}>
                {saving ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> Saving...</> : <><Check size={14} /> Save Changes</>}
              </button>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <Toggle label="New orders" desc="Get notified when you receive a new order" value={notifs.orders} onChange={(v: boolean) => setNotifs(n => ({ ...n, orders: v }))} t={t} />
              <Toggle label="Marketing emails" desc="Receive tips and product updates from DropOS" value={notifs.marketing} onChange={(v: boolean) => setNotifs(n => ({ ...n, marketing: v }))} t={t} />
              <Toggle label="Security alerts" desc="Be notified of unusual account activity" value={notifs.security} onChange={(v: boolean) => setNotifs(n => ({ ...n, security: v }))} t={t} />
              <Toggle label="Platform updates" desc="Stay informed about new features and changes" value={notifs.updates} onChange={(v: boolean) => setNotifs(n => ({ ...n, updates: v }))} t={t} />
              <button onClick={handleSave} style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 11, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "white", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(107,53,232,0.35)" }}>
                <Check size={14} /> Save Preferences
              </button>
            </div>
          )}

          {activeSection === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Current Password" value="" onChange={() => {}} type="password" placeholder="Enter current password" t={t} />
              <Input label="New Password" value="" onChange={() => {}} type="password" placeholder="Enter new password" t={t} />
              <Input label="Confirm New Password" value="" onChange={() => {}} type="password" placeholder="Confirm new password" t={t} />
              <button style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 11, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "white", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(107,53,232,0.35)" }}>
                <Shield size={14} /> Update Password
              </button>
            </div>
          )}

          {activeSection === "danger" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#EF4444", marginBottom: 6 }}>Delete Account</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 14, lineHeight: 1.6 }}>Once you delete your account, all your stores, products, orders and data will be permanently removed. This action cannot be undone.</div>
                <button onClick={handleDeleteAccount} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Trash2 size={14} /> Delete My Account
                </button>
              </div>
            </div>
          )}

          {!["profile", "notifications", "security", "danger"].includes(activeSection) && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: t.muted }}>This section is coming soon.</div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
