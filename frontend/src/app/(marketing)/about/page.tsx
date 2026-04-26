import Link from "next/link";
import { Zap, ArrowRight, Globe, Users, TrendingUp, Shield } from "lucide-react";

export const metadata = { title: "About — DropOS", description: "We are building the AI-native commerce platform for the next generation of sellers." };

export default function AboutPage() {
  return (
    <div style={{background:"#07050F",color:"#fff",fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <nav className="sticky top-0 z-50 px-6 h-16 flex items-center justify-between" style={{background:"rgba(7,5,15,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#6B35E8,#3D1C8A)"}}><Zap size={13} color="white"/></div>
          <span className="font-black text-white">Drop<span style={{color:"#8B5CF6"}}>OS</span></span>
        </Link>
        <Link href="/auth/register"><button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{background:"linear-gradient(135deg,#6B35E8,#3D1C8A)"}}>Start free <ArrowRight size={13}/></button></Link>
      </nav>

      {/* Hero */}
      <div className="text-center px-6 py-24 max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color:"#8B5CF6"}}>About DropOS</p>
        <h1 className="font-black mb-6" style={{fontSize:"clamp(36px,5vw,64px)",letterSpacing:"-2.5px",lineHeight:1}}>
          We are building the AI-native<br/>commerce platform.
        </h1>
        <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{color:"rgba(255,255,255,0.45)"}}>
          DropOS started from a simple observation: most people who want to start an online business spend more time fighting tools than actually selling. KIRO fixes that. Tell it what you want to sell. It builds your store, finds your products, writes your ads, and grows your revenue — while you focus on your customers.
        </p>
      </div>

      {/* Mission */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{color:"#8B5CF6"}}>Our Mission</p>
          <h2 className="font-black text-3xl mb-5" style={{letterSpacing:"-1.5px"}}>Give every seller the tools that big brands take for granted.</h2>
          <p className="text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.45)"}}>
            A seller in Lagos should have access to the same quality of analytics, automation, and AI that a Fortune 500 company has. DropOS makes that possible — at a price that makes sense for independent sellers and small businesses anywhere in the world.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            {icon:Globe,   label:"Global",      desc:"Built for sellers worldwide, from Lagos to London"},
            {icon:Users,   label:"Community",   desc:"Thousands of sellers building businesses with DropOS"},
            {icon:TrendingUp,label:"Growth",    desc:"Our sellers grow 3x faster than the industry average"},
            {icon:Shield,  label:"Trust",       desc:"Your data is yours. We never sell it, ever"},
          ].map(v=>(
            <div key={v.label} className="p-4 rounded-2xl" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:"rgba(107,53,232,0.12)"}}><v.icon size={16} style={{color:"#8B5CF6"}}/></div>
              <h3 className="font-bold text-sm mb-1.5 text-white">{v.label}</h3>
              <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.4)"}}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="max-w-4xl mx-auto px-6 py-16" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{color:"#8B5CF6"}}>Founded by</p>
          <h2 className="font-black text-3xl" style={{letterSpacing:"-1.5px"}}>Builders who've been there.</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {[
            {name:"Olamide A.",role:"CTO & Co-founder",bio:"Full-stack engineer. Built DropOS from zero. Obsessed with AI, developer tools, and making commerce simple.",avatar:"O"},
            {name:"Tobi B.",  role:"CEO & Co-founder",bio:"Business and growth. Spent years watching sellers struggle with tools not built for them. DropOS is the fix.",avatar:"T"},
          ].map(m=>(
            <div key={m.name} className="p-6 rounded-2xl" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white" style={{background:"linear-gradient(135deg,#6B35E8,#3D1C8A)"}}>{m.avatar}</div>
                <div><p className="font-black text-base text-white">{m.name}</p><p className="text-sm" style={{color:"rgba(255,255,255,0.4)"}}>{m.role}</p></div>
              </div>
              <p className="text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.5)"}}>{m.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center px-6 py-20" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <h2 className="font-black text-3xl sm:text-4xl mb-4" style={{letterSpacing:"-2px"}}>Join us.</h2>
        <p className="text-base mb-8" style={{color:"rgba(255,255,255,0.4)"}}>Start free. No credit card. Your store, live in 60 seconds.</p>
        <Link href="/auth/register"><button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base" style={{background:"linear-gradient(135deg,#6B35E8,#3D1C8A)",boxShadow:"0 12px 40px rgba(107,53,232,0.4)"}}>Launch your store <ArrowRight size={16}/></button></Link>
      </div>
    </div>
  );
}