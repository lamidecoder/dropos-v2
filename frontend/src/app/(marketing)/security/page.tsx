import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Server, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Security & Trust  -  DropOS",
  description: "How DropOS keeps your store, your data, and your customers safe.",
};

const PILLARS = [
  { icon:Lock,   color:"#8B5CF6", title:"Your data is yours",         points:["We never sell your data to third parties","We never use your store data to train AI models","You can export and delete all your data at any time","GDPR and NDPR compliant"] },
  { icon:Shield, color:"#10B981", title:"Payments are secure",         points:["Paystack and Stripe handle all card processing  -  we never see card numbers","PCI DSS compliance handled by our payment processors","All transactions encrypted end-to-end","Instant fraud detection on every transaction"] },
  { icon:Server, color:"#06B6D4", title:"Infrastructure you can trust",points:["Hosted on Render and Vercel  -  enterprise-grade infrastructure","SSL on every store and every API call","Daily automatic backups","99.9% uptime SLA"] },
  { icon:Eye,    color:"#F59E0B", title:"Full transparency",           points:["We disclose every tool and AI system we use","KIRO is powered by Anthropic Claude  -  we say this openly","No hidden fees, no surprise charges","Pricing is public and never changes without 30 days notice"] },
];

const TOOLS = [
  { name:"Anthropic Claude",  role:"Powers KIRO AI",            why:"Industry-leading AI safety. Your data is not used to train their models." },
  { name:"Fal.ai",            role:"Image Studio generation",   why:"Images processed on-demand. Not stored permanently by default."          },
  { name:"Paystack",          role:"Nigerian/African payments",  why:"CBN regulated. PCI DSS Level 1 certified."                               },
  { name:"Stripe",            role:"Global card payments",      why:"Used by millions of businesses globally. PCI DSS Level 1 certified."      },
  { name:"Cloudinary",        role:"Product image hosting",     why:"CDN delivery, secure storage, automatic optimisation."                    },
  { name:"Resend",            role:"Transactional emails",      why:"GDPR compliant. No email tracking without consent."                       },
  { name:"Render",            role:"Backend infrastructure",    why:"SOC 2 Type II certified. Data residency controls."                        },
  { name:"Vercel",            role:"Frontend hosting",          why:"SOC 2 certified. Global edge network. No data sold to advertisers."       },
];

export default function SecurityPage() {
  return (
    <div>
      <section className="text-center px-6 pb-16">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background:"rgba(107,53,232,0.1)", border:"1px solid rgba(107,53,232,0.2)" }}>
          <Shield size={24} style={{ color:"#8B5CF6" }}/>
        </div>
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color:"#8B5CF6" }}>Security & Trust</p>
        <h1 className="font-black mb-5" style={{ fontSize:"clamp(28px,4vw,48px)", letterSpacing:"-2px", color:"var(--text-primary)" }}>
          We take your trust seriously.
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color:"var(--text-secondary)" }}>
          You are trusting us with your business and your customers. Here is exactly how we protect both.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {PILLARS.map(pillar => (
            <div key={pillar.title} className="p-6 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background:`${pillar.color}12` }}>
                <pillar.icon size={18} style={{ color:pillar.color }}/>
              </div>
              <h2 className="font-bold text-base mb-4" style={{ color:"var(--text-primary)" }}>{pillar.title}</h2>
              <div className="space-y-2.5">
                {pillar.points.map(pt => (
                  <div key={pt} className="flex items-start gap-2.5">
                    <Check size={11} style={{ color:pillar.color, flexShrink:0, marginTop:3 }} strokeWidth={3}/>
                    <span className="text-sm" style={{ color:"var(--text-secondary)" }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-black text-2xl mb-2" style={{ letterSpacing:"-1px", color:"var(--text-primary)" }}>Tools we use  -  fully disclosed</h2>
        <p className="text-sm mb-8" style={{ color:"var(--text-secondary)" }}>
          We believe in transparency. Every third-party tool that touches your data, and why we chose it.
        </p>
        <div className="space-y-3 mb-12">
          {TOOLS.map(tool => (
            <div key={tool.name} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm" style={{ background:"var(--bg-secondary)", color:"var(--text-primary)" }}>
                {tool.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-0.5">
                  <p className="font-bold text-sm" style={{ color:"var(--text-primary)" }}>{tool.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(107,53,232,0.08)", color:"#8B5CF6" }}>{tool.role}</span>
                </div>
                <p className="text-xs" style={{ color:"var(--text-tertiary)" }}>{tool.why}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl text-center" style={{ background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.15)" }}>
          <h3 className="font-bold text-base mb-2" style={{ color:"var(--text-primary)" }}>Questions about security?</h3>
          <p className="text-sm mb-4" style={{ color:"var(--text-secondary)" }}>We respond to every security question within 24 hours.</p>
          <Link href="/contact">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background:"linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              Contact us <ArrowRight size={13}/>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
