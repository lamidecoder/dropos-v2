"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, Check, Mail, Lock, User } from "lucide-react";
import { useRegister } from "../../../hooks/useAuth";

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
  { label: "8+ characters", test: (v: string) => v.length >= 8     },
  { label: "Uppercase",     test: (v: string) => /[A-Z]/.test(v)   },
  { label: "Number",        test: (v: string) => /\d/.test(v)      },
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

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw]         = useState("");
  const reg = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Form) => reg.mutate(data);

  const handleGoogle = () => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://dropos-v2.onrender.com";
    window.location.href = `${base}/api/auth/google`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F4F2FB", fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;800;900&display=swap');
        .auth-input { transition: all 0.15s ease; }
        .auth-input:focus { border-color: #6B35E8 !important; box-shadow: 0 0 0 3px rgba(107,53,232,0.08); outline: none; }
        .auth-input::placeholder { color: rgba(19,13,46,0.3); }
        @media (max-width: 768px) {
          .auth-visual { display: none !important; }
          .auth-form-pane { width: 100% !important; }
        }
      `}</style>

      {/* LEFT — visual panel */}
      <div className="auth-visual" style={{
        width: "44%",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px 56px",
        background: "linear-gradient(160deg, #2D1B69 0%, #1A0B4A 60%, #0D0625 100%)",
      }}>
        <div style={{
          position: "absolute", top: "-200px", right: "-150px",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 60%)",
          filter: "blur(80px)", pointerEvents: "none",
        }}/>
        <div style={{
          position: "absolute", bottom: "-100px", left: "-50px",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 60%)",
          filter: "blur(60px)", pointerEvents: "none",
        }}/>

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="#2D1B69"/>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>DropOS</span>
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em",
            color: "#fff", margin: "0 0 18px", lineHeight: 1.08,
          }}>
            Start selling in <em style={{ fontStyle: "italic", fontWeight: 400, color: "#C4B5FD" }}>minutes</em>.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.65)", margin: 0, maxWidth: 380 }}>
            Join African merchants building real businesses with AI.
            Launch your store today. No credit card needed.
          </p>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
            © 2026 DROPOS
          </span>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)" }} />
          <Link href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.05em" }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.05em" }}>
            Terms
          </Link>
        </div>
      </div>

      {/* RIGHT — form pane */}
      <div className="auth-form-pane" style={{
        width: "56%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 24px",
        background: "#FAFAFC",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2D1B69", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#130D2E", letterSpacing: "-0.02em" }}>DropOS</span>
          </div>

          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 32, fontWeight: 500, letterSpacing: "-0.025em",
            color: "#130D2E", margin: "0 0 6px", lineHeight: 1.15,
          }}>
            Create account
          </h2>
          <p style={{ fontSize: 14, color: "rgba(19,13,46,0.55)", margin: "0 0 28px" }}>
            Already have an account? <Link href="/auth/login" style={{ color: "#6B35E8", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>

          <button onClick={handleGoogle} type="button"
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "13px 16px", borderRadius: 12,
              background: "#fff", border: "1px solid rgba(19,13,46,0.08)",
              fontSize: 14, fontWeight: 600, color: "#130D2E",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(19,13,46,0.16)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(19,13,46,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(19,13,46,0.08)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <GoogleIcon /> Sign up with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(19,13,46,0.08)" }} />
            <span style={{ fontSize: 11, color: "rgba(19,13,46,0.4)", fontWeight: 500, letterSpacing: "0.05em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(19,13,46,0.08)" }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#130D2E", marginBottom: 6 }}>
                Full name
              </label>
              <div style={{ position: "relative" }}>
                <User size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.35)" }}/>
                <input {...register("name")} type="text"
                  className="auth-input"
                  placeholder="Olamide Sotunde"
                  style={{
                    width: "100%", padding: "13px 14px 13px 40px",
                    borderRadius: 12, border: "1px solid rgba(19,13,46,0.1)",
                    background: "#fff", fontSize: 14, color: "#130D2E",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              {errors.name && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 5 }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#130D2E", marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.35)" }}/>
                <input {...register("email")} type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  style={{
                    width: "100%", padding: "13px 14px 13px 40px",
                    borderRadius: 12, border: "1px solid rgba(19,13,46,0.1)",
                    background: "#fff", fontSize: 14, color: "#130D2E",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              {errors.email && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 5 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#130D2E", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(19,13,46,0.35)" }}/>
                <input {...register("password", { onChange: e => setPw(e.target.value) })}
                  type={showPw ? "text" : "password"}
                  className="auth-input"
                  placeholder="Create a strong password"
                  style={{
                    width: "100%", padding: "13px 44px 13px 40px",
                    borderRadius: 12, border: "1px solid rgba(19,13,46,0.1)",
                    background: "#fff", fontSize: 14, color: "#130D2E",
                    fontFamily: "inherit",
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(19,13,46,0.4)", cursor: "pointer", padding: 0 }}>
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 5 }}>{errors.password.message}</p>}
            </div>

            {/* Password strength indicators */}
            {pw && (
              <div style={{ display: "flex", gap: 12, marginBottom: 16, padding: "10px 12px", background: "rgba(107,53,232,0.03)", borderRadius: 10 }}>
                {pwChecks.map(c => {
                  const passed = c.test(pw);
                  return (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: passed ? "#10B981" : "rgba(19,13,46,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                        {passed && <Check size={9} color="#fff" strokeWidth={3}/>}
                      </div>
                      <span style={{ fontSize: 11, color: passed ? "#10B981" : "rgba(19,13,46,0.4)", fontWeight: 500 }}>{c.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <button type="submit" disabled={reg.isPending}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "14px 16px", borderRadius: 12, marginTop: 16,
                background: "#130D2E", color: "#fff",
                fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                border: "none", cursor: reg.isPending ? "wait" : "pointer",
                opacity: reg.isPending ? 0.7 : 1,
                transition: "all 0.15s ease",
                boxShadow: "0 4px 16px rgba(19,13,46,0.15)",
              }}
              onMouseEnter={e => { if (!reg.isPending) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(19,13,46,0.22)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(19,13,46,0.15)"; }}>
              {reg.isPending ? "Creating account…" : "Create account"}
              {!reg.isPending && <ArrowRight size={14}/>}
            </button>
          </form>

          <p style={{ fontSize: 11, color: "rgba(19,13,46,0.35)", textAlign: "center", marginTop: 24, lineHeight: 1.5 }}>
            By creating an account, you agree to our{" "}
            <Link href="/terms" style={{ color: "rgba(19,13,46,0.55)", textDecoration: "none" }}>Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "rgba(19,13,46,0.55)", textDecoration: "none" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
