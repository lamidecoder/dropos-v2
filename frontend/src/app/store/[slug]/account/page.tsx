"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { useCartStore } from "../../../../store/cart.store";
import Link from "next/link";
import {
  User, Mail, Lock, Phone, Eye, EyeOff, ShoppingBag,
  Package, MapPin, Heart, ArrowRight, LogOut, ChevronRight,
  Check, X, Clock, Truck, Star,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: "#fef3c7", color: "#d97706", label: "Pending"    },
  PROCESSING: { bg: "#ede9fe", color: "#7c3aed", label: "Processing" },
  SHIPPED:    { bg: "#dbeafe", color: "#2563eb", label: "Shipped"    },
  DELIVERED:  { bg: "#d1fae5", color: "#059669", label: "Delivered"  },
  COMPLETED:  { bg: "#d1fae5", color: "#059669", label: "Completed"  },
  CANCELLED:  { bg: "#fee2e2", color: "#dc2626", label: "Cancelled"  },
  REFUNDED:   { bg: "#f3f4f6", color: "#6b7280", label: "Refunded"   },
};

// ─── Customer Auth Hook ───────────────────────────────────────────────────────
function useCustomerAuth() {
  const key = "customer_token";
  const dataKey = "customer_data";
  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem(key) : null);
  const getData  = () => {
    try { return JSON.parse(localStorage.getItem(dataKey) || "null"); } catch { return null; }
  };
  const setAuth = (token: string, data: any) => {
    localStorage.setItem(key, token);
    localStorage.setItem(dataKey, JSON.stringify(data));
  };
  const clearAuth = () => { localStorage.removeItem(key); localStorage.removeItem(dataKey); };
  return { getToken, getData, setAuth, clearAuth };
}

// ─── Main Account Page ────────────────────────────────────────────────────────
export default function CustomerAccountPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const auth = useCustomerAuth();
  const token = auth.getToken();
  const customerData = auth.getData();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [activeSection, setActiveSection] = useState<"orders" | "wishlist" | "profile">("orders");

  const { data: storeData } = useQuery({
    queryKey: ["public-store", slug],
    queryFn: () => api.get(`/stores/public/${slug}`).then(r => r.data.data),
  });
  const store = storeData;
  const brand = store?.primaryColor || "#7c3aed";

  // Profile data
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["customer-profile", token],
    queryFn: () => api.get("/customer-auth/profile", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data.data),
    enabled: !!token,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["customer-wishlist", token],
    queryFn: () => api.get("/customer-auth/wishlist", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
    enabled: !!token,
  });

  // ── Login ──
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const loginMut = useMutation({
    mutationFn: () => api.post("/customer-auth/login", { storeId: store?.id, ...loginForm }),
    onSuccess: (res) => {
      auth.setAuth(res.data.data.token, res.data.data.account);
      toast.success(`Welcome back, ${res.data.data.account.name}!`);
      window.location.reload();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Login failed"),
  });

  // ── Register ──
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "" });
  const registerMut = useMutation({
    mutationFn: () => api.post("/customer-auth/register", { storeId: store?.id, ...regForm }),
    onSuccess: (res) => {
      auth.setAuth(res.data.data.token, res.data.data.account);
      toast.success("Account created! Welcome 🎉");
      window.location.reload();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Registration failed"),
  });

  const handleLogout = () => { auth.clearAuth(); window.location.reload(); };

  const inp = `w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all`;
  const focusStyle = { boxShadow: `0 0 0 3px ${brand}20` };

  // ── NOT LOGGED IN ──────────────────────────────────────────────────────────
  if (!token || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-sm font-bold text-slate-600">
            ← {store?.name || "Store"}
          </Link>
        </nav>

        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-[var(--text-primary)]"
              style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
              <User size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">My Account</h1>
            <p className="text-sm text-slate-500 mt-1">Track orders, manage addresses, save favourites</p>
          </div>

          {/* Tab switch */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
            {(["login", "register"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            {tab === "login" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      className={inp + " pl-10"} type="email" placeholder="you@email.com"
                      onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.boxShadow = ""} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      type={showPass ? "text" : "password"} className={inp + " pl-10 pr-10"} placeholder="••••••••"
                      onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.boxShadow = ""} />
                    <button onClick={() => setShowPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button onClick={() => loginMut.mutate()} disabled={loginMut.isPending || !loginForm.email}
                  className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50 transition-opacity"
                  style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
                  {loginMut.isPending ? "Signing in…" : "Sign In →"}
                </button>
                <p className="text-center text-xs text-slate-400">
                  No account?{" "}
                  <button onClick={() => setTab("register")} className="font-bold" style={{ color: brand }}>Create one free</button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { key: "name",  label: "Full Name",  type: "text",     icon: User,  placeholder: "Jane Doe" },
                  { key: "email", label: "Email",       type: "email",    icon: Mail,  placeholder: "you@email.com" },
                  { key: "phone", label: "Phone",       type: "tel",      icon: Phone, placeholder: "+234 801 234 5678" },
                  { key: "password", label: "Password", type: showPass ? "text" : "password", icon: Lock, placeholder: "Min. 8 characters" },
                ].map(({ key, label, type, icon: Icon, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={(regForm as any)[key]} onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))}
                        type={type} className={inp + " pl-10"} placeholder={placeholder}
                        onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.boxShadow = ""} />
                    </div>
                  </div>
                ))}
                <button onClick={() => registerMut.mutate()} disabled={registerMut.isPending || !regForm.name || !regForm.email || !regForm.password}
                  className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
                  {registerMut.isPending ? "Creating account…" : "Create Account →"}
                </button>
                <p className="text-xs text-slate-400 text-center">Already have an account?{" "}
                  <button onClick={() => setTab("login")} className="font-bold" style={{ color: brand }}>Sign in</button></p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED IN ──────────────────────────────────────────────────────────────
  const orders = profile?.orders || [];
  const wishlist = wishlistData?.data || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href={`/store/${slug}`} className="text-sm font-bold text-slate-600">← {store?.name}</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">{profile?.account?.name}</span>
          <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Profile header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--text-primary)] font-black text-lg"
            style={{ background: `linear-gradient(135deg,${brand},${brand}bb)` }}>
            {profile?.account?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-black text-slate-900 text-lg">{profile?.account?.name}</p>
            <p className="text-sm text-slate-500">{profile?.account?.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-black text-slate-900">{orders.length}</p>
            <p className="text-xs text-slate-500">orders</p>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2">
          {([
            { key: "orders",  label: "Orders",   icon: Package },
            { key: "wishlist",label: "Wishlist",  icon: Heart   },
            { key: "profile", label: "Profile",   icon: User    },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveSection(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 justify-center ${activeSection === key ? "text-[var(--text-primary)] shadow-sm" : "bg-white text-slate-500 border border-slate-100"}`}
              style={activeSection === key ? { background: `linear-gradient(135deg,${brand},${brand}bb)` } : {}}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {activeSection === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100">
                <ShoppingBag size={40} className="mx-auto mb-3 text-slate-200" />
                <p className="font-bold text-slate-700 mb-1">No orders yet</p>
                <Link href={`/store/${slug}`} className="text-sm font-bold" style={{ color: brand }}>Start shopping →</Link>
              </div>
            ) : orders.map((order: any) => {
              const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
              return (
                <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-slate-800">#{order.orderNumber}</span>
                      <span className="ml-2 text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {order.items?.slice(0,3).map((item: any, i: number) => (
                      <span key={i} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-lg">{item.name} ×{item.quantity}</span>
                    ))}
                    {order.items?.length > 3 && <span className="text-xs text-slate-400">+{order.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">${order.total.toFixed(2)}</span>
                    {order.trackingNumber && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Truck size={10} /> {order.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Wishlist */}
        {activeSection === "wishlist" && (
          <div className="space-y-3">
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100">
                <Heart size={40} className="mx-auto mb-3 text-slate-200" />
                <p className="font-bold text-slate-700 mb-1">Wishlist is empty</p>
                <Link href={`/store/${slug}`} className="text-sm font-bold" style={{ color: brand }}>Browse products →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map((p: any) => (
                  <Link key={p.id} href={`/store/${slug}/product/${p.id}`}
                    className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover rounded-xl mb-3" />
                    ) : (
                      <div className="w-full aspect-square rounded-xl mb-3 bg-slate-100 flex items-center justify-center">
                        <Package size={24} className="text-slate-300" />
                      </div>
                    )}
                    <p className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</p>
                    <p className="text-sm font-black" style={{ color: brand }}>${p.price.toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {activeSection === "profile" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900">Account Details</h3>
            {[
              { label: "Name",  value: profile?.account?.name },
              { label: "Email", value: profile?.account?.email },
              { label: "Phone", value: profile?.account?.phone || "Not set" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            ))}
            <button onClick={handleLogout}
              className="w-full py-3 rounded-xl text-sm font-bold text-red-500 border border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
