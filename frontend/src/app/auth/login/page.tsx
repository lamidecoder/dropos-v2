"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Check } from "lucide-react";
import { useLogin } from "../../../hooks/useAuth";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
type Form = z.infer<typeof schema>;

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

/* Testimonial shown in the left panel */
const TESTIMONIALS = [
  { name: "Chioma A.", city: "Lagos", text: "Made ₦340,000 in my first month. KIRO imported 40 products in 10 minutes.", avatar: "CA" },
  { name: "Emeka O.", city: "Abuja", text: "Left my 9-5 after 3 months on DropOS. The AI ads literally do the marketing.", avatar: "EO" },
  { name: "Fatima B.", city: "Kano",  text: "Orders from 6 states in my first week. Set it up on my phone.", avatar: "FB" },
];

function LoginInner() {
  const [show, setShow] = useState(false);
  const [testimonialIdx] = useState(() => Math.floor(Math.random() * TESTIMONIALS.length));
  const login  = useLogin();
  const params = useSearchParams();
  const justRegistered = params.get("registered");
  const urlError = params.get("error") ? decodeURIComponent(params.get("error") as string) : null;

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Form) => login.mutate(data);

  const handleGoogle = () => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
    window.location.href = `${base}/api/auth/google`;
  };

  const testimonial = TESTIMONIALS[testimonialIdx];

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
        @media (max-width: 768px) { .auth-left { display: none !important; } .auth-right { width: 100% !important; } }
      `}</style>

      {/* LEFT — testimonial panel */}
      <div className="auth-left" style={{
        width: "44%", position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #2D1B69 0%, #1A0B4A 55%, #0D0625 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 52px",
      }}>
        {/* Glows */}
        <div style={{ position: "absolute", top: "-200px", right: "-150px", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: "-80px", left: "-40px", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,53,232,0.2) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }}/>

        {/* Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="#2D1B69"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>DropOS</span>
        </motion.div>

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 42, fontWeight: 500, color: "#fff", margin: "0 0 32px", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
            Welcome back to <em style={{ fontStyle: "italic", color: "#C4B5FD", fontWeight: 400 }}>commerce</em>.
          </motion.h1>

          {/* Testimonial card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ padding: "20px 22px", borderRadius: 18, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: "0 0 16px", fontStyle: "italic" }}>
              "{testimonial.text}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6B35E8,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{testimonial.avatar}</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{testimonial.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>{testimonial.city}, Nigeria</p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#FBBF24", fontSize: 12 }}>★</span>)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ position: "relative", zIndex: 1, display: "flex", gap: 20 }}>
          {["Privacy", "Terms"].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.06em" }}>{l}</Link>
          ))}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>© 2026 DropOS</span>
        </motion.div>
      </div>

      {/* RIGHT — form */}
      <div className="auth-right" style={{ width: "56%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", background: "#FAFAFC" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, fontWeight: 500, color: "#130D2E", margin: "0 0 4px", letterSpacing: "-0.025em" }}>
            Sign in
          </h2>
          <p style={{ fontSize: 14, color: "rgba(19,13,46,0.5)", margin: "0 0 24px" }}>
            New to DropOS?{" "}
            <Link href="/auth/register" style={{ color: "#6B35E8", fontWeight: 600, textDecoration: "none" }}>Create an account</Link>
          </p>

          {/* Alerts */}
          {urlError && (
            <div style={{ padding: "11px 14px", borderRadius: 11, marginBottom: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 12.5, color: "#991B1B", margin: 0, fontWeight: 500 }}>{urlError}</p>
            </div>
          )}
          {justRegistered && (
            <div style={{ padding: "11px 14px", borderRadius: 11, marginBottom: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", gap: 8, alignItems: "center" }}>
              <Check size={14} style={{ color: "#10B981", flexShrink: 0 }}/>
              <p style={{ fontSize: 12.5, color: "#065F46", margin: 0, fontWeight: 500 }}>Account created. Sign in to continue.</p>
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} type="button"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "#fff", border: "1px solid rgba(19,13,46,0.08)", fontSize: 14, fontWeight: 600, color: "#130D2E", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(19,13,46,0.15)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(19,13,46,0.06)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(19,13,46,0.08)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
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
            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#130D2E", marginBottom: 5 }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.3)", pointerEvents: "none" }}/>
                <input {...register("email")} type="email" placeholder="you@example.com"
                  style={inp}
                  onFocus={e => { e.target.style.borderColor = "#6B35E8"; e.target.style.boxShadow = "0 0 0 3px rgba(107,53,232,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(19,13,46,0.1)"; e.target.style.boxShadow = "none"; }}/>
              </div>
              {errors.email && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#130D2E" }}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: "#6B35E8", textDecoration: "none", fontWeight: 500 }}>Forgot?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.3)", pointerEvents: "none" }}/>
                <input {...register("password")} type={show ? "text" : "password"} placeholder="Enter your password"
                  style={{ ...inp, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = "#6B35E8"; e.target.style.boxShadow = "0 0 0 3px rgba(107,53,232,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(19,13,46,0.1)"; e.target.style.boxShadow = "none"; }}/>
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(19,13,46,0.4)", cursor: "pointer", padding: 0 }}>
                  {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={login.isPending}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", borderRadius: 12, marginTop: 20, background: "#130D2E", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", border: "none", cursor: login.isPending ? "wait" : "pointer", opacity: login.isPending ? 0.7 : 1, transition: "all 0.15s ease", boxShadow: "0 4px 16px rgba(19,13,46,0.15)" }}
              onMouseEnter={e => { if (!login.isPending) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(19,13,46,0.22)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(19,13,46,0.15)"; }}>
              {login.isPending ? "Signing in…" : "Sign in"}
              {!login.isPending && <ArrowRight size={14}/>}
            </button>
          </form>

          <p style={{ fontSize: 11, color: "rgba(19,13,46,0.3)", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
            By signing in you agree to our{" "}
            <Link href="/terms" style={{ color: "rgba(19,13,46,0.5)", textDecoration: "none" }}>Terms</Link>{" "}and{" "}
            <Link href="/privacy" style={{ color: "rgba(19,13,46,0.5)", textDecoration: "none" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F4F2FB" }}/>}>
      <LoginInner/>
    </Suspense>
  );
}
