"use client";

import { useState } from "react";
import DashboardLayout from "../../../components/layout/DashboardLayout";

import { useAuthStore } from "../../../store/auth.store";
import { useUpdateProfile } from "../../../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { authAPI, api } from "../../../lib/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Bell, Sun, Moon, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { useTheme } from "next-themes";

const profileSchema = z.object({
  name:  z.string().min(2),
  phone: z.string().optional(),
  city:  z.string().optional(),
  country: z.string().optional(),
});

const pwdSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword:     z.string().min(8, "Min 8 chars")
    .regex(/[A-Z]/, "Need uppercase")
    .regex(/[a-z]/, "Need lowercase")
    .regex(/\d/, "Need number"),
  confirm:         z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [twoFAModal, setTwoFAModal]   = useState<"setup" | "disable" | null>(null);
  const [twoFAStep,  setTwoFAStep]    = useState<"qr" | "verify">("qr");
  const [twoFAQR,    setTwoFAQR]      = useState<string | null>(null);
  const [twoFASecret,setTwoFASecret]  = useState<string | null>(null);
  const [twoFACode,  setTwoFACode]    = useState("");
  const [notifSettings, setNotifSettings] = useState({
    "New orders": true,
    "Order status updates": true,
    "Payment received": true,
    "Low inventory": false,
    "Weekly digest": false,
  });

  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";
  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const GRAD = "linear-gradient(135deg,#7c3aed,#a855f7)";

  const updateProfile = useUpdateProfile();

  const { register: regPro, handleSubmit: subPro, formState: { errors: errPro } } = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name || "", phone: "", city: user?.city || "", country: user?.country || "" },
  });

  const { register: regPwd, handleSubmit: subPwd, reset: resetPwd, formState: { errors: errPwd } } = useForm({
    resolver: zodResolver(pwdSchema),
  });

  // 2FA mutations
  const setup2FA = useMutation({
    mutationFn: () => api.post("/2fa/setup"),
    onSuccess: (r) => { setTwoFAQR(r.data.data.qrCode); setTwoFASecret(r.data.data.secret); setTwoFAStep("verify"); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to start 2FA setup"),
  });
  const verify2FA = useMutation({
    mutationFn: (token: string) => api.post("/2fa/verify", { token }),
    onSuccess: () => {
      toast.success("2FA enabled!");
      useAuthStore.getState().setUser({ ...user!, twoFAEnabled: true });
      setTwoFAModal(null); setTwoFACode(""); setTwoFAStep("qr"); setTwoFAQR(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Invalid code"),
  });
  const disable2FA = useMutation({
    mutationFn: (token: string) => api.post("/2fa/disable", { token }),
    onSuccess: () => {
      toast.success("2FA disabled");
      useAuthStore.getState().setUser({ ...user!, twoFAEnabled: false });
      setTwoFAModal(null); setTwoFACode("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Invalid code"),
  });

    const changePwd = useMutation({
    mutationFn: (d: any) => authAPI.changePassword(d),
    onSuccess:  () => { toast.success("Password changed"); resetPwd(); },
    onError:    (e: any) => toast.error(e.response?.data?.message || "Change failed"),
  });

  const TABS = [
    { id: "profile",       label: "Profile",       Icon: User },
    { id: "security",      label: "Security",      Icon: Lock },
    { id: "notifications", label: "Notifications", Icon: Bell },
  ] as const;

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Settings</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>Manage your account preferences</p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 border-b [border-color:var(--border)]`}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all
                ${activeTab === id ? "border-violet-500 [color:var(--accent)]" : `border-transparent ${sub}`}`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {activeTab === "profile" && (
          <div className="space-y-5">
            {/* Avatar */}
            <div className={`rounded-2xl border p-5 flex items-center gap-5 ${card}`}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center [color:var(--text-primary)] text-2xl font-black shadow-lg "
                style={{ background: GRAD }}>
                {user?.name?.charAt(0) || "?"}
              </div>
              <div>
                <div className={`font-black text-lg ${tx}`}>{user?.name}</div>
                <div className={`text-sm ${sub}`}>{user?.email}</div>
                <div className={`text-xs mt-1 px-2.5 py-1 rounded-full inline-flex font-bold
                  ${user?.subscription?.plan === "ADVANCED" ? "bg-violet-400/10 text-violet-400"
                    : "[background:var(--bg-card)] text-secondary"}`}>
                  {user?.subscription?.plan || "STARTER"} plan
                </div>
              </div>
            </div>

            {/* Form */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold mb-4 ${tx}`}>Personal Information</h3>
              <form onSubmit={subPro((d) => updateProfile.mutate(d))} className="space-y-4">
                {[
                  { name: "name" as const,    label: "Full Name",    type: "text" },
                  { name: "phone" as const,   label: "Phone",        type: "tel"  },
                  { name: "city" as const,    label: "City",         type: "text" },
                  { name: "country" as const, label: "Country",      type: "text" },
                ].map(({ name, label, type }) => (
                  <div key={name}>
                    <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>{label}</label>
                    <input {...regPro(name)} type={type}
                      className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 transition-all ${inp}`} />
                    {errPro[name] && <p className="text-xs text-red-400 mt-1">{(errPro[name] as any)?.message}</p>}
                  </div>
                ))}
                <button type="submit" disabled={updateProfile.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-60 mt-2"
                  style={{ background: GRAD }}>
                  {updateProfile.isPending ? "Saving…" : "Save Profile"}
                </button>
              </form>
            </div>

            {/* Theme toggle */}
            <div className={`rounded-2xl border p-5 flex items-center justify-between ${card}`}>
              <div>
                <div className={`font-semibold ${tx}`}>Appearance</div>
                <div className={`text-xs ${sub}`}>Toggle dark / light mode</div>
              </div>
              <button onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                  [background:var(--bg-secondary)] [border-color:var(--border-strong)] [color:var(--accent)]`}>
                {<><Moon size={14} /> Dark mode</>}
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-5">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold mb-4 ${tx}`}>Change Password</h3>
              <form onSubmit={subPwd((d) => changePwd.mutate(d))} className="space-y-4">
                {[
                  { name: "currentPassword" as const, label: "Current Password" },
                  { name: "newPassword" as const,     label: "New Password" },
                  { name: "confirm" as const,         label: "Confirm New Password" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>{label}</label>
                    <input {...regPwd(name)} type="password"
                      className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 transition-all ${inp}`} />
                    {errPwd[name] && <p className="text-xs text-red-400 mt-1">{(errPwd[name] as any)?.message}</p>}
                  </div>
                ))}
                <button type="submit" disabled={changePwd.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-60"
                  style={{ background: GRAD }}>
                  {changePwd.isPending ? "Changing…" : "Change Password"}
                </button>
              </form>
            </div>

            <div className={`rounded-2xl border p-5 flex items-center justify-between ${card}`}>
              <div>
                <div className={`font-semibold ${tx}`}>Two-Factor Authentication</div>
                <div className={`text-xs ${sub}`}>Extra security via authenticator app</div>
              </div>
              <button
                onClick={() => { setTwoFAModal(user?.twoFAEnabled ? "disable" : "setup"); setTwoFAStep("qr"); setTwoFACode(""); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                style={{ borderColor: user?.twoFAEnabled ? "var(--error)" : "var(--accent)", color: user?.twoFAEnabled ? "var(--error)" : "var(--accent)" }}>
                {user?.twoFAEnabled ? <><ShieldOff size={12}/> Disable 2FA</> : <><ShieldCheck size={12}/> Enable 2FA</>}
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`font-bold mb-4 ${tx}`}>Email Notifications</h3>
            <div className="space-y-4">
              {[
                { label: "New orders",          sub: "Get notified when you receive a new order" },
                { label: "Order status updates", sub: "Updates when your orders change status"   },
                { label: "Payment received",     sub: "Confirmation when payments are processed" },
                { label: "Low inventory",        sub: "Alert when product stock runs low"        },
                { label: "Weekly digest",        sub: "Weekly summary of your store performance" },
              ].map((item, i) => {
                const on = notifSettings[item.label as keyof typeof notifSettings];
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${"[border-color:var(--border)]"}`}>
                    <div>
                      <div className={`font-semibold text-sm ${tx}`}>{item.label}</div>
                      <div className={`text-xs ${sub}`}>{item.sub}</div>
                    </div>
                    <button onClick={() => setNotifSettings(s => ({ ...s, [item.label]: !on }))}
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${on ? "bg-violet-600" : "[background:var(--bg-card)]"}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => toast.success("Notification preferences saved")}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: GRAD }}>
              Save Preferences
            </button>
          </div>
        )}
      </div>
      {/* ── 2FA Modal ──────────────────────────────────────────────────── */}
      {twoFAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: twoFAModal === "disable" ? "rgba(239,68,68,0.1)" : "var(--accent-dim)" }}>
                <Smartphone size={18} style={{ color: twoFAModal === "disable" ? "#ef4444" : "var(--accent)" }} />
              </div>
              <div>
                <div className="font-black text-base" style={{ color: "var(--text-primary)" }}>
                  {twoFAModal === "disable" ? "Disable 2FA" : twoFAStep === "qr" ? "Set Up 2FA" : "Verify Your App"}
                </div>
                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {twoFAModal === "disable" ? "Enter your authenticator code" : twoFAStep === "qr" ? "Scan QR with your authenticator app" : "Enter the 6-digit code from your app"}
                </div>
              </div>
            </div>

            {twoFAModal === "setup" && twoFAStep === "qr" && !twoFAQR && (
              <button onClick={() => setup2FA.mutate()} disabled={setup2FA.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-60" style={{ background: "var(--accent)" }}>
                {setup2FA.isPending ? "Generating…" : "Generate QR Code"}
              </button>
            )}

            {twoFAModal === "setup" && twoFAStep === "verify" && twoFAQR && (
              <div className="space-y-4">
                <img src={twoFAQR} alt="2FA QR Code" className="w-44 h-44 mx-auto rounded-2xl" />
                {twoFASecret && (
                  <div className="text-center">
                    <div className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Or enter this code manually:</div>
                    <code className="text-xs font-mono px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>{twoFASecret}</code>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>6-digit code from your app</label>
                  <input value={twoFACode} onChange={e => setTwoFACode(e.target.value.replace(/\D/g,"").slice(0,6))}
                    placeholder="000000" maxLength={6}
                    className="w-full rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest border outline-none transition-all"
                    style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </div>
                <button onClick={() => verify2FA.mutate(twoFACode)} disabled={twoFACode.length !== 6 || verify2FA.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-60" style={{ background: "var(--accent)" }}>
                  {verify2FA.isPending ? "Verifying…" : "Enable 2FA"}
                </button>
              </div>
            )}

            {twoFAModal === "disable" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>6-digit code from your app</label>
                  <input value={twoFACode} onChange={e => setTwoFACode(e.target.value.replace(/\D/g,"").slice(0,6))}
                    placeholder="000000" maxLength={6}
                    className="w-full rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest border outline-none transition-all"
                    style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </div>
                <button onClick={() => disable2FA.mutate(twoFACode)} disabled={twoFACode.length !== 6 || disable2FA.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 bg-red-600 hover:bg-red-700 transition-all">
                  {disable2FA.isPending ? "Disabling…" : "Disable 2FA"}
                </button>
              </div>
            )}

            <button onClick={() => { setTwoFAModal(null); setTwoFACode(""); setTwoFAStep("qr"); setTwoFAQR(null); }}
              className="w-full mt-3 py-2.5 rounded-xl text-sm transition-all" style={{ color: "var(--text-tertiary)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}