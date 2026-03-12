"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, CheckCircle } from "lucide-react";
import { useRegister } from "@/hooks/useAuth";

const schema = z.object({
  name:     z.string().min(2, "Name too short"),
  email:    z.string().email("Invalid email"),
  password: z.string()
    .min(8,    "Min 8 characters")
    .regex(/[A-Z]/, "Need one uppercase")
    .regex(/[a-z]/, "Need one lowercase")
    .regex(/\d/,    "Need one number"),
  phone:    z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputStyle = {
  background: "var(--bg-secondary)",
  border:     "1px solid var(--border)",
  color:      "var(--text-primary)",
};

export default function RegisterPage() {
  const [show, setShow] = useState(false);
  const register        = useRegister();

  const { register: reg, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const pwd = watch("password") || "";
  const checks = [
    { label: "8+ characters", ok: pwd.length >= 8 },
    { label: "Uppercase",     ok: /[A-Z]/.test(pwd) },
    { label: "Lowercase",     ok: /[a-z]/.test(pwd) },
    { label: "Number",        ok: /\d/.test(pwd) },
  ];

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--accent)";
    e.target.style.boxShadow   = "0 0 0 3px var(--accent-dim)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow   = "none";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(124,58,237,0.06),transparent 70%)" }} />
      </div>

      <div className="animate-fade w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Get started free</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>14-day trial · No credit card required</p>
        </div>

        <div className="rounded-2xl p-7" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
          <form onSubmit={handleSubmit((d) => register.mutate(d))} className="space-y-4">
            {([
              { name: "name"  as const, label: "Full Name",        type: "text",  ph: "John Doe"          },
              { name: "email" as const, label: "Email address",    type: "email", ph: "you@example.com"   },
              { name: "phone" as const, label: "Phone (optional)", type: "tel",   ph: "+1 234 567 8900"   },
            ] as const).map(({ name, label, type, ph }) => (
              <div key={name}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
                <input {...reg(name)} type={type} placeholder={ph}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                {errors[name] && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors[name]?.message}</p>}
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input {...reg("password")} type={show ? "text" : "password"} placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwd && (
                <div className="grid grid-cols-2 gap-1 mt-2.5">
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5 text-xs"
                      style={{ color: c.ok ? "var(--success)" : "var(--text-tertiary)" }}>
                      <CheckCircle size={11} style={{ color: c.ok ? "var(--success)" : "var(--border-strong)" }} />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={register.isPending}
              className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] hover:opacity-90 active:scale-[.98] disabled:opacity-60 transition-all"
              style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
              {register.isPending ? "Creating account…" : "Create Free Account →"}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: "var(--text-tertiary)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold" style={{ color: "var(--accent)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
