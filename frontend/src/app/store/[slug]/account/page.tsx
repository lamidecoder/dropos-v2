"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import Link from "next/link";
import {
  User, Mail, Lock, Phone, Eye, EyeOff, ShoppingBag,
  Package, Heart, LogOut, ArrowLeft, Zap,
  Truck, CheckCircle, Clock, XCircle, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  PENDING:    { color: "#d97706", bg: "rgba(217,119,6,0.1)",   label: "Pending",    icon: Clock       },
  PROCESSING: { color: "#7c3aed", bg: "rgba(124,58,237,0.1)", label: "Processing", icon: RefreshCw   },
  SHIPPED:    { color: "#2563eb", bg: "rgba(37,99,235,0.1)",  label: "Shipped",    icon: Truck       },
  DELIVERED:  { color: "#059669", bg: "rgba(5,150,105,0.1)",  label: "Delivered",  icon: CheckCircle },
  COMPLETED:  { color: "#059669", bg: "rgba(5,150,105,0.1)",  label: "Completed",  icon: CheckCircle },
  CANCELLED:  { color: "#dc2626", bg: "rgba(220,38,38,0.1)",  label: "Cancelled",  icon: XCircle     },
};

function useCustomerAuth() {
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  const getData  = () => { try { return JSON.parse(localStorage.getItem("customer_data") || "null"); } catch { return null; } };
  const setAuth  = (token: string, data: any) => { localStorage.setItem("customer_token", token); localStorage.setItem("customer_data", JSON.stringify(data)); };
  const clearAuth = () => { localStorage.removeItem("customer_token"); localStorage.removeItem("customer_data"); };
  return { getToken, getData, setAuth, clearAuth };
}

export default function CustomerAccountPage() {
  const { slug } = useParams<{ slug: string }>();
  const auth = useCustomerAuth();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [section, setSection] = useState<"orders" | "wishlist" | "profile">("orders");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => { setToken(auth.getToken()); }, []);

  const { data: store } = useQuery({
    queryKey: ["public-store", slug],
    queryFn: () => api.get(`/stores/public/${slug}`).then(r => r.data.data),
  });

  const brand = store?.primaryColor || "#7c3aed";

  const { data: profile } = useQuery({
    queryKey: ["customer-profile", token],
    queryFn: () => api.get("/customer-auth/profile", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data.data),
    enabled: !!token,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["customer-wishlist", token],
    queryFn: () => api.get("/customer-auth/wishlist", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
    enabled: !!token,
  });

  const loginMut = useMutation({
    mutationFn: () => api.post("/customer-auth/login", { storeId: store?.id, ...loginForm }),
    onSuccess: (res) => {
      auth.setAuth(res.data.data.token, res.data.data.account);
      setToken(res.data.data.token);
      toast.success(`Welcome back, ${res.data.data.account.name}! 👋`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Login failed"),
  });

  const registerMut = useMutation({
    mutationFn: () => api.post("/customer-auth/register", { storeId: store?.id, ...regForm }),
    onSuccess: (res) => {
      auth.setAuth(res.data.data.token, res.data.data.account);
      setToken(res.data.data.token);
      toast.success("Account created! Welcome 🎉");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Registration failed"),
  });

  const handleLogout = () => { auth.clearAuth(); setToken(null); toast.success("Signed out"); };

  const inputCls = "w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all text-white placeholder-slate-600";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" };

  // ── NOT LOGGED IN ─────────────────────────────────────────────────────────
  if (!token || !profile) {
    return (
      <div className="min-h-screen" style={{ background: "#07070e" }}>
        {/* Nav */}
        <nav className="border-b px-6 h-16 flex items-center justify-between sticky top-0 z-40"
          style={{ background: "rgba(10,10,20,0.95)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to store
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${brand},${brand}cc)` }}>
              <span className="text-white text-xs font-black">{store?.name?.charAt(0)}</span>
            </div>
            <span className="text-sm font-bold text-white">{store?.name}</span>
          </div>
        </nav>

        <div className="max-w-md mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-2xl"
              style={{ background: `linear-gradient(135deg,${brand},${brand}cc)`, boxShadow: `0 16px 40px ${brand}40` }}>
              <User size={28} color="white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">My Account</h1>
            <p className="text-slate-500 text-sm">Track orders, save favourites, manage profile</p>
          </div>

          {/* Tab toggle */}
          <div className="flex p-1 rounded-2xl mb-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["login", "register"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={tab === t ? { background: brand, color: "white", boxShadow: `0 4px 16px ${brand}40` } : { color: "#6b7280" }}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="space-y-4">
            {tab === "login" ? (
              <>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    type="email" placeholder="Email address" className={inputCls} style={inputStyle} />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    type={showPass ? "text" : "password"} placeholder="Password" className={inputCls + " pr-12"} style={inputStyle} />
                  <button onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button onClick={() => loginMut.mutate()} disabled={loginMut.isPending || !loginForm.email}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg,${brand},${brand}cc)`, boxShadow: `0 8px 32px ${brand}40` }}>
                  {loginMut.isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</> : "Sign In →"}
                </button>
                <p className="text-center text-xs text-slate-600">
                  No account? <button onClick={() => setTab("register")} className="font-bold" style={{ color: brand }}>Create one free</button>
                </p>
              </>
            ) : (
              <>
                {[
                  { key: "name", icon: User, placeholder: "Full Name", type: "text" },
                  { key: "email", icon: Mail, placeholder: "Email address", type: "email" },
                  { key: "phone", icon: Phone, placeholder: "Phone (optional)", type: "tel" },
                  { key: "password", icon: Lock, placeholder: "Password (min. 8 chars)", type: showPass ? "text" : "password" },
                ].map(({ key, icon: Icon, placeholder, type }) => (
                  <div key={key} className="relative">
                    <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input value={(regForm as any)[key]} onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))}
                      type={type} placeholder={placeholder} className={inputCls} style={inputStyle} />
                    {key === "password" && (
                      <button onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => registerMut.mutate()} disabled={registerMut.isPending || !regForm.name || !regForm.email || !regForm.password}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg,${brand},${brand}cc)`, boxShadow: `0 8px 32px ${brand}40` }}>
                  {registerMut.isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</> : "Create Account →"}
                </button>
                <p className="text-center text-xs text-slate-600">
                  Already have an account? <button onClick={() => setTab("login")} className="font-bold" style={{ color: brand }}>Sign in</button>
                </p>
              </>
            )}
          </div>

          {/* Powered by */}
          <div className="text-center mt-12">
            <p className="text-xs text-slate-700">Powered by</p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
                <Zap size={11} color="white" fill="white" />
              </div>
              <span className="text-sm font-black text-white">Drop<span style={{ color: "#8b5cf6" }}>OS</span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED IN ─────────────────────────────────────────────────────────────
  const orders   = profile?.orders   || [];
  const wishlist = wishlistData?.data || [];
  const account  = profile?.account;

  return (
    <div className="min-h-screen" style={{ background: "#07070e" }}>
      {/* Nav */}
      <nav className="border-b px-6 h-16 flex items-center justify-between sticky top-0 z-40"
        style={{ background: "rgba(10,10,20,0.95)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
        <Link href={`/store/${slug}`} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> {store?.name}
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-400/10">
          <LogOut size={13} /> Sign Out
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-5">

        {/* Profile card */}
        <div className="rounded-3xl p-6 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${brand}15, ${brand}08)`, border: `1px solid ${brand}25` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${brand},${brand}cc)`, boxShadow: `0 8px 24px ${brand}40` }}>
            {account?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-lg leading-tight">{account?.name}</p>
            <p className="text-sm text-slate-500 truncate">{account?.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-white">{orders.length}</p>
            <p className="text-xs text-slate-500">orders</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {([
            { key: "orders",   label: "Orders",   icon: Package },
            { key: "wishlist", label: "Wishlist",  icon: Heart   },
            { key: "profile",  label: "Profile",   icon: User    },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={section === key ? { background: brand, color: "white" } : { color: "#6b7280" }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {section === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="rounded-3xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <ShoppingBag size={40} className="mx-auto mb-3 text-slate-700" />
                <p className="font-bold text-slate-400 mb-3">No orders yet</p>
                <Link href={`/store/${slug}`} className="text-sm font-bold px-5 py-2.5 rounded-xl text-white" style={{ background: brand }}>
                  Start Shopping →
                </Link>
              </div>
            ) : orders.map((order: any) => {
              const s = STATUS[order.status] || STATUS.PENDING;
              const Icon = s.icon;
              return (
                <div key={order.id} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-bold text-white">#{order.orderNumber}</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                      <Icon size={11} /> {s.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {order.items?.slice(0,3).map((item: any, i: number) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg text-slate-400" style={{ background: "rgba(255,255,255,0.04)" }}>
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                    {order.items?.length > 3 && <span className="text-xs text-slate-600">+{order.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-base font-black text-white">${order.total?.toFixed(2)}</span>
                    <span className="text-xs text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Wishlist */}
        {section === "wishlist" && (
          <div>
            {wishlist.length === 0 ? (
              <div className="rounded-3xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Heart size={40} className="mx-auto mb-3 text-slate-700" />
                <p className="font-bold text-slate-400 mb-3">Wishlist is empty</p>
                <Link href={`/store/${slug}`} className="text-sm font-bold px-5 py-2.5 rounded-xl text-white" style={{ background: brand }}>
                  Browse Products →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map((p: any) => (
                  <Link key={p.id} href={`/store/${slug}/product/${p.id}`}
                    className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <Package size={24} className="text-slate-600" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-bold text-white line-clamp-1">{p.name}</p>
                      <p className="text-sm font-black mt-0.5" style={{ color: brand }}>${p.price?.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {section === "profile" && (
          <div className="rounded-3xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="font-black text-white text-lg">Account Details</h3>
            {[
              { label: "Name",  value: account?.name },
              { label: "Email", value: account?.email },
              { label: "Phone", value: account?.phone || "Not set" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
            <button onClick={handleLogout}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-red-400 flex items-center justify-center gap-2 mt-2 transition-all hover:bg-red-400/10"
              style={{ border: "1px solid rgba(220,38,38,0.2)" }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}

        {/* Powered by DropOS */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-slate-700 mb-1">Powered by</p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
              <Zap size={11} color="white" fill="white" />
            </div>
            <span className="text-sm font-black text-white">Drop<span style={{ color: "#8b5cf6" }}>OS</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}