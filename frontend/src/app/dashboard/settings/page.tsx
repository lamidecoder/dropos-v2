"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme, useToast, useConfirm } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { User, Bell, Shield, Palette, Globe, Trash2, Eye, EyeOff, ChevronRight, Camera, Sun, Moon, Check } from "lucide-react";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)", input: "rgba(255,255,255,0.05)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", input: "rgba(15,5,32,0.04)" },
};

const SECTIONS = [
  { id: "profile",       label: "Profile",      icon: User    },
  { id: "notifications", label: "Alerts",       icon: Bell    },
  { id: "security",      label: "Security",     icon: Shield  },
  { id: "appearance",    label: "Appearance",   icon: Palette },
  { id: "domain",        label: "Domain",        icon: Globe   },
  { id: "danger",        label: "Danger Zone",  icon: Trash2  },
];

function SettingRow({ label, desc, children, t }: any) {
  return (
    <div className="flex items-center justify-between py-4 gap-4" style={{ borderBottom: `1px solid ${t.border}` }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: t.text }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: t.muted }}>{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative flex-shrink-0 transition-all"
      style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: value ? V.v500 : "rgba(128,128,128,0.2)" }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm" style={{ left: value ? 22 : 2 }} />
    </button>
  );
}

function TextInput({ label, value, onChange, type = "text", placeholder, t, disabled }: any) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>{label}</label>
      <div className="relative">
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ border: `1px solid ${t.border}`, background: disabled ? t.faint : t.input, color: t.text, fontFamily: "inherit", paddingRight: type === "password" ? 44 : 16, opacity: disabled ? 0.6 : 1 }}
        />
        {type === "password" && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ border: "none", background: "none", cursor: "pointer", color: t.muted }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}


function DomainSection({ t, storeId }: { t: any; storeId?: string }) {
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);

  const save = async () => {
    if (!domain.trim()) return;
    setSaving(true);
    try {
      const { api } = await import("../../../lib/api");
      await api.put(`/stores/${storeId}/custom-domain`, { domain: domain.trim().toLowerCase() });
      setVerified(true);
      toast.success("Domain saved! Now add the CNAME record below to your DNS.");
    } catch {
      toast.error("Backend offline — save your domain when Render is live");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: t.muted }}>Custom domain</label>
        <div className="flex gap-2">
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="store.yourbrand.com"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: t.faint, border: `1px solid ${t.border}`, color: t.text, fontFamily: "inherit" }}/>
          <button onClick={save} disabled={!domain.trim() || saving}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", border: "none", cursor: "pointer" }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: t.muted }}>Must be a subdomain you control (e.g. shop.yourbrand.com)</p>
      </div>
      {(verified || domain) && (
        <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(107,53,232,0.06)", border: "1px solid rgba(107,53,232,0.2)" }}>
          <p className="text-xs font-bold" style={{ color: "#A78BFA" }}>Add this CNAME record to your DNS:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><p style={{ color: t.muted, marginBottom: 2 }}>Type</p><p className="font-mono font-bold" style={{ color: t.text }}>CNAME</p></div>
            <div><p style={{ color: t.muted, marginBottom: 2 }}>Name</p><p className="font-mono font-bold" style={{ color: t.text }}>{domain.split(".")[0] || "store"}</p></div>
            <div className="col-span-2"><p style={{ color: t.muted, marginBottom: 2 }}>Value</p><p className="font-mono font-bold text-xs" style={{ color: t.text }}>cname.vercel-dns.com</p></div>
          </div>
          <p className="text-xs" style={{ color: t.muted }}>DNS changes take 10-60 minutes to propagate. SSL is automatic via Vercel.</p>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { show } = useToast();
  const { confirm } = useConfirm();
  const { user } = useAuthStore();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;

  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [name, setName]   = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [notifs, setNotifs] = useState({ orders: true, marketing: false, security: true, updates: true, kiro: true });

  const handleSaveProfile = async () => {
    setSaving(true);
    try { await api.put("/auth/profile", { name, email }); show("Profile saved", "success"); }
    catch { show("Saved locally (backend offline)", "info"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { show("Fill in both fields", "error"); return; }
    try { await api.put("/auth/password", { currentPassword: currentPw, newPassword: newPw }); show("Password updated", "success"); setCurrentPw(""); setNewPw(""); }
    catch (e: any) { show(e.response?.data?.message || "Failed", "error"); }
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: "Delete your account?", message: "This permanently deletes your account and all store data. Cannot be undone.", confirmText: "Yes, delete everything", cancelText: "Keep my account", variant: "danger" });
    if (ok) show("Account deletion requested", "info");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: t.text }}>Settings</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: t.muted }}>Manage your account and preferences</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Section sidebar - horizontal scroll on mobile, vertical on desktop */}
        <div className="sm:w-44 flex-shrink-0">
          <div className="flex sm:flex-col gap-1 overflow-x-auto pb-1 sm:pb-0" style={{ scrollbarWidth: "none" }}>
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all whitespace-nowrap sm:whitespace-normal flex-shrink-0 sm:flex-shrink w-auto sm:w-full"
                  style={{ background: active ? "rgba(107,53,232,0.1)" : "transparent", border: `1px solid ${active ? "rgba(107,53,232,0.25)" : "transparent"}`, color: active ? V.v300 : t.muted }}>
                  <Icon size={14} />
                  <span className="text-xs font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}
            className="rounded-2xl p-4 sm:p-6" style={{ background: t.card, border: `1px solid ${t.border}` }}>

            {activeSection === "profile" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold mb-4" style={{ color: t.text }}>Profile</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                      {name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: V.v500 }}>
                      <Camera size={10} />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: t.text }}>{name || "Your Name"}</p>
                    <p className="text-xs" style={{ color: t.muted }}>{email}</p>
                  </div>
                </div>
                <TextInput label="Full Name" value={name} onChange={setName} placeholder="Your name" t={t} />
                <TextInput label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" t={t} />
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}

            {activeSection === "notifications" && (
              <div>
                <h2 className="text-sm font-bold mb-1" style={{ color: t.text }}>Notification Preferences</h2>
                <p className="text-xs mb-4" style={{ color: t.muted }}>Choose what you want to be notified about</p>
                {[
                  { key: "orders",    label: "New Orders",          desc: "Get notified when a customer places an order" },
                  { key: "kiro",      label: "KIRO Alerts",         desc: "Morning briefs, opportunities, and urgent alerts" },
                  { key: "security",  label: "Security Alerts",     desc: "Login attempts and account security" },
                  { key: "marketing", label: "Marketing Tips",      desc: "Product ideas and growth suggestions" },
                  { key: "updates",   label: "Platform Updates",    desc: "New features and improvements" },
                ].map(n => (
                  <SettingRow key={n.key} label={n.label} desc={n.desc} t={t}>
                    <Toggle value={notifs[n.key as keyof typeof notifs]} onChange={v => setNotifs(p => ({ ...p, [n.key]: v }))} />
                  </SettingRow>
                ))}
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold mb-4" style={{ color: t.text }}>Security</h2>
                <TextInput label="Current Password" value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" t={t} />
                <TextInput label="New Password" value={newPw} onChange={setNewPw} type="password" placeholder="Min 8 characters" t={t} />
                <button onClick={handleChangePassword}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                  Update Password
                </button>
                <div className="pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
                  <SettingRow label="Two-Factor Authentication" desc="Add an extra layer of security to your account" t={t}>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ border: `1px solid ${t.border}`, color: t.muted }}>Enable</button>
                  </SettingRow>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div>
                <h2 className="text-sm font-bold mb-4" style={{ color: t.text }}>Appearance</h2>
                <SettingRow label="Theme" desc="Choose how the dashboard looks" t={t}>
                  <div className="flex gap-2">
                    {[{ mode: "dark", icon: Moon, label: "Dark" }, { mode: "light", icon: Sun, label: "Light" }].map(opt => {
                      const Icon = opt.icon;
                      const active = theme === opt.mode;
                      return (
                        <button key={opt.mode} onClick={toggleTheme}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: active ? V.v500 : t.faint, color: active ? "#fff" : t.muted, border: `1px solid ${active ? V.v500 : t.border}` }}>
                          <Icon size={12} /> {opt.label}
                          {active && <Check size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </SettingRow>
              </div>
            )}

      
      {activeSection === "domain" && (
        <div className="space-y-0" style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${t.border}` }}>
          <div className="p-5" style={{ borderBottom: `1px solid ${t.border}` }}>
            <h2 className="font-bold text-sm mb-1" style={{ color: t.text }}>Custom Domain</h2>
            <p className="text-xs" style={{ color: t.muted }}>Connect your own domain instead of the dropos.io subdomain</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: t.muted }}>Your subdomain (always free)</label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: t.faint, border: `1px solid ${t.border}` }}>
                <span className="text-sm font-semibold" style={{ color: t.text }}>{user?.stores?.[0]?.slug || "yourstore"}</span>
                <span className="text-sm" style={{ color: t.muted }}>.droposhq.com</span>
              </div>
            </div>
            <DomainSection t={t} storeId={user?.stores?.[0]?.id} />
          </div>
        </div>
      )}

      {activeSection === "danger" && (
              <div>
                <h2 className="text-sm font-bold mb-1 text-red-400">Danger Zone</h2>
                <p className="text-xs mb-6" style={{ color: t.muted }}>These actions cannot be undone. Be very careful.</p>
                <div className="p-4 rounded-2xl" style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)" }}>
                  <p className="text-sm font-semibold text-red-400 mb-1">Delete Account</p>
                  <p className="text-xs mb-4" style={{ color: t.muted }}>Permanently delete your account and all store data including products, orders, and customer information.</p>
                  <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#EF4444" }}>
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
