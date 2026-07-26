"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, Check, Mail, Lock, User, Zap } from "lucide-react";
import { useRegister } from "../../../hooks/useAuth";
import { motion } from "framer-motion";

const schema = z.object({
  name:     z.string().min(2, "Name is too short"),
  email:    z.string().email("Enter a valid email"),
  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter")
    .regex(/[a-z]/, "One lowercase letter")
    .regex(/\d/, "One number"),
});
type Form = z.infer<typeof schema>;

const pwChecks = [
  { label: "8+ characters", test: (v: string) => v.length >= 8    },
  { label: "Uppercase",     test: (v: string) => /[A-Z]/.test(v)  },
  { label: "Number",        test: (v: string) => /\d/.test(v)     },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* Floating metric card shown on the left panel */
function MetricCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
      style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
      <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.04em" }}>{value}</p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "2px 0 0", fontWeight: 500 }}>{label}</p>
    </motion.div>
  );
}

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw]         = useState("");
  const [agreedToTos, setAgreedToTos] = useState(false);
  const reg = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = (data: Form) => { if (!agreedToTos) return; reg.mutate(data); };

  const handleGoogle = () => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
    window.location.href = `${base}/api/auth/google`;
  };

  const inp = {
    width: "100%", padding: "12px 14px 12px 40px",
    borderRadius: 12, border: "1px solid rgba(19,13,46,0.1)",
    background: "#fff", fontSize: 14, color: "#130D2E",
    fontFamily: "inherit", outline: "none", transition: "all 0.15s ease",
  } as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F4F2FB", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,700;1,400&display=swap');
        .auth-inp:focus { border-color: #6B35E8 !important; box-shadow: 0 0 0 3px rgba(107,53,232,0.08); }
        .auth-inp::placeholder { color: rgba(19,13,46,0.3); }
        @media (max-width: 768px) { .auth-left { display: none !important; } .auth-right { width: 100% !important; } }
      `}</style>

      {/* LEFT — animated visual */}
      <div className="auth-left" style={{
        width: "44%", position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #2D1B69 0%, #1A0B4A 55%, #0D0625 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 52px",
      }}>
        {/* Glows */}
        <div style={{ position: "absolute", top: "-180px", right: "-120px", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }}/>

        {/* Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="#2D1B69"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>DropOS</span>
        </motion.div>

        {/* Main text */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px" }}>
              Join 4,000+ Nigerian merchants
            </p>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 40, fontWeight: 500, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Build your store.<br/>
              <em style={{ fontStyle: "italic", color: "#C4B5FD", fontWeight: 400 }}>Grow your business.</em>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 380 }}>
              KIRO, your AI commerce assistant, helps you import products, write ads, and handle orders — so you can focus on selling.
            </p>
          </motion.div>

          {/* Live metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MetricCard value="₦0" label="Setup cost, ever" delay={0.2}/>
            <MetricCard value="15s" label="First product imported" delay={0.3}/>
            <MetricCard value="29" label="Store templates" delay={0.4}/>
            <MetricCard value="98%" label="Goes to your bank" delay={0.5}/>
          </div>
        </div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ position: "relative", zIndex: 1, display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Support"].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", letterSpacing: "0.05em" }}>{l}</Link>
          ))}
        </motion.div>
      </div>

      {/* RIGHT — form */}
      <div className="auth-right" style={{ width: "56%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", background: "#FAFAFC", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 384 }}>

          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 28 }} className="auth-left-hidden">
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#2D1B69", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="#fff"/></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#130D2E" }}>DropOS</span>
          </div>

          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, fontWeight: 500, color: "#130D2E", margin: "0 0 4px", letterSpacing: "-0.025em" }}>
            Create your account
          </h2>
          <p style={{ fontSize: 14, color: "rgba(19,13,46,0.5)", margin: "0 0 24px" }}>
            Already have one?{" "}
            <Link href="/auth/login" style={{ color: "#6B35E8", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>

          {/* Google */}
          <button onClick={handleGoogle} type="button"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "#fff", border: "1px solid rgba(19,13,46,0.08)", fontSize: 14, fontWeight: 600, color: "#130D2E", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(19,13,46,0.15)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(19,13,46,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(19,13,46,0.08)"; e.currentTarget.style.boxShadow = "none"; }}>
            <GoogleIcon /> Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(19,13,46,0.07)" }}/>
            <span style={{ fontSize: 11, color: "rgba(19,13,46,0.35)", fontWeight: 600, letterSpacing: "0.06em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(19,13,46,0.07)" }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#130D2E", marginBottom: 5 }}>Full name</label>
              <div style={{ position: "relative" }}>
                <User size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.3)", pointerEvents: "none" }}/>
                <input {...register("name")} type="text" placeholder="Amaka Johnson" className="auth-inp"
                  style={inp} onFocus={e => { e.target.style.borderColor = "#6B35E8"; e.target.style.boxShadow = "0 0 0 3px rgba(107,53,232,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(19,13,46,0.1)"; e.target.style.boxShadow = "none"; }}/>
              </div>
              {errors.name && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#130D2E", marginBottom: 5 }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.3)", pointerEvents: "none" }}/>
                <input {...register("email")} type="email" placeholder="you@example.com" className="auth-inp"
                  style={inp} onFocus={e => { e.target.style.borderColor = "#6B35E8"; e.target.style.boxShadow = "0 0 0 3px rgba(107,53,232,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(19,13,46,0.1)"; e.target.style.boxShadow = "none"; }}/>
              </div>
              {errors.email && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#130D2E", marginBottom: 5 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.3)", pointerEvents: "none" }}/>
                <input {...register("password")}
                  type={showPw ? "text" : "password"} placeholder="Min 8 characters" className="auth-inp"
                  style={{ ...inp, paddingRight: 44 }}
                  onChange={e => { setPw(e.target.value); }}
                  onFocus={e => { e.target.style.borderColor = "#6B35E8"; e.target.style.boxShadow = "0 0 0 3px rgba(107,53,232,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(19,13,46,0.1)"; e.target.style.boxShadow = "none"; }}/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(19,13,46,0.35)", cursor: "pointer", padding: 0 }}>
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.password.message}</p>}

              {/* Password strength */}
              {pw.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {pwChecks.map(c => (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: c.test(pw) ? "rgba(16,185,129,0.15)" : "rgba(19,13,46,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {c.test(pw) && <Check size={8} color="#10B981"/>}
                      </div>
                      <span style={{ fontSize: 10.5, color: c.test(pw) ? "#10B981" : "rgba(19,13,46,0.35)", fontWeight: 500 }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "12px 0", userSelect: "none" }}>
              <div onClick={() => setAgreedToTos(v => !v)}
                style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${agreedToTos ? "#6B35E8" : "rgba(19,13,46,0.2)"}`, background: agreedToTos ? "#6B35E8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.12s ease", cursor: "pointer" }}>
                {agreedToTos && <Check size={10} color="#fff"/>}
              </div>
              <span style={{ fontSize: 12, color: "rgba(19,13,46,0.6)", lineHeight: 1.5 }}>
                I agree to DropOS{" "}
                <Link href="/terms" style={{ color: "#6B35E8", textDecoration: "none", fontWeight: 600 }}>Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" style={{ color: "#6B35E8", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>
              </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={reg.isPending || !agreedToTos}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", borderRadius: 12, background: "#130D2E", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", border: "none", cursor: (reg.isPending || !agreedToTos) ? "not-allowed" : "pointer", opacity: (!agreedToTos) ? 0.5 : 1, transition: "all 0.15s ease", boxShadow: "0 4px 16px rgba(19,13,46,0.15)" }}
              onMouseEnter={e => { if (!reg.isPending && agreedToTos) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(19,13,46,0.22)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(19,13,46,0.15)"; }}>
              {reg.isPending ? "Creating account…" : "Create account"}
              {!reg.isPending && <ArrowRight size={14}/>}
            </button>
          </form>

          {/* KIRO note */}
          <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 12, background: "rgba(107,53,232,0.05)", border: "1px solid rgba(107,53,232,0.1)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Zap size={14} style={{ color: "#8B5CF6", marginTop: 1, flexShrink: 0 }}/>
            <p style={{ fontSize: 12, color: "rgba(19,13,46,0.6)", margin: 0, lineHeight: 1.5 }}>
              After signing up, <strong style={{ color: "#6B35E8", fontWeight: 700 }}>KIRO</strong> will help you build your first store in under 5 minutes — no experience needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
