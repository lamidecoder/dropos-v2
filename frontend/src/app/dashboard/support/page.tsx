"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { LifeBuoy, MessageSquare, Book, ExternalLink, Zap, Send, Loader2, Check, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

const FAQS = [
  { q:"How do I connect Paystack?",    a:"Go to Settings > Payments > Paystack. Enter your Paystack secret key and public key. Your store will be ready to accept payments instantly." },
  { q:"How does dropshipping work?",   a:"You list products in your store. When a customer orders, KIRO automatically places the order with your supplier who ships directly to your customer. You keep the margin." },
  { q:"Can I use a custom domain?",    a:"Yes. Go to Settings > Domain. Enter your domain and add the CNAME record pointing to your CNAME target (provided in Settings). SSL is automatic." },
  { q:"How do I get paid?",            a:"Customers pay via Paystack or Stripe directly into your account. DropOS never holds your money. Payouts happen within 1-3 business days." },
  { q:"Why is KIRO not responding?",   a:"Make sure ANTHROPIC_API_KEY is set in your Render environment variables. Go to Render > Environment and add the key from console.anthropic.com." },
  { q:"How do I import products?",     a:"Go to Import Products. Paste any AliExpress, CJ, or Zendrop product URL and KIRO will import it automatically with description and images." },
];

export default function SupportPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
    input:  isDark ? "rgba(255,255,255,0.05)" : "#F5F3FF",
  };
  const user = useAuthStore(s => s.user);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number|null>(null);
  const [sent, setSent] = useState(false);

  const sendMut = useMutation({
    mutationFn: () => api.post("/contact", {
      name: user?.name, email: user?.email,
      subject, message,
    }),
    onSuccess: () => { setSent(true); toast.success("Message sent! We reply within 24 hours."); },
    onError: () => toast.error("Failed to send - email us at hello@droposhq.com"),
  });

  const inp = { width:"100%", padding:"11px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" } as const;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-8">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Support</h1>
        <p className="text-sm" style={{color:t.muted}}>We respond within 24 hours. Usually faster.</p>
      </motion.div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon:"📚", label:"Docs",      href:"https://docs.droposhq.com",      desc:"Full documentation" },
          { icon:"💬", label:"Ask KIRO",  href:"/dashboard/kiro",                 desc:"AI help instantly"  },
          { icon:"📧", label:"Email",     href:"mailto:hello@droposhq.com",       desc:"hello@droposhq.com" },
        ].map(item => (
          <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all hover:scale-102"
            style={{background:t.card,border:`1px solid ${t.border}`,textDecoration:"none"}}>
            <span className="text-2xl">{item.icon}</span>
            <p className="text-sm font-bold" style={{color:t.text}}>{item.label}</p>
            <p className="text-xs" style={{color:t.muted}}>{item.desc}</p>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.08}}
        className="rounded-2xl overflow-hidden mb-8" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="px-5 py-4" style={{borderBottom:`1px solid ${t.border}`}}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{color:t.muted}}>Frequently Asked</p>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} style={{borderBottom:i<FAQS.length-1?`1px solid ${t.border}`:"none"}}>
            <button onClick={() => setOpenFaq(openFaq===i?null:i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              style={{background:"transparent",border:"none",cursor:"pointer"}}>
              <span className="text-sm font-semibold pr-4" style={{color:t.text}}>{faq.q}</span>
              <ChevronRight size={14} style={{color:t.muted,flexShrink:0,transform:openFaq===i?"rotate(90deg)":"rotate(0)",transition:"transform 0.2s"}}/>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4">
                <p className="text-sm leading-relaxed" style={{color:t.muted}}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Contact form */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.14}}
        className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="px-5 py-4" style={{borderBottom:`1px solid ${t.border}`}}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{color:t.muted}}>Send a Message</p>
        </div>
        {sent ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:"rgba(16,185,129,0.1)"}}>
              <Check size={28} color="#10B981"/>
            </div>
            <p className="font-bold text-base mb-2" style={{color:t.text}}>Message sent!</p>
            <p className="text-sm" style={{color:t.muted}}>We will reply to {user?.email} within 24 hours.</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" style={inp}/>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Describe your issue or question..." rows={5}
              style={{...inp,resize:"none",display:"block"}}/>
            <button onClick={() => sendMut.mutate()} disabled={!subject||!message||sendMut.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",opacity:!subject||!message?0.6:1}}>
              {sendMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Send size={13}/>}
              {sendMut.isPending ? "Sending..." : "Send Message"}
            </button>
          </div>
        )}
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
