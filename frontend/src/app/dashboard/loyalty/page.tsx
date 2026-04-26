"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Star, Gift, Zap, Users, TrendingUp, Check } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };
const TM = {
  dark:  { card:"#181230", border:"rgba(255,255,255,0.06)", text:"#fff", muted:"rgba(255,255,255,0.38)", faint:"rgba(255,255,255,0.04)" },
  light: { card:"#fff",    border:"rgba(15,5,32,0.07)",    text:"#0D0918", muted:"rgba(13,9,24,0.45)", faint:"rgba(15,5,32,0.03)" },
};

const TIERS = [
  { name:"Bronze", color:"#CD7F32", minPoints:0,    perks:["1 point per ₦100 spent","Birthday discount 5%"] },
  { name:"Silver", color:"#9E9E9E", minPoints:500,  perks:["1.5x points multiplier","Free shipping over ₦10k","Early access to sales"] },
  { name:"Gold",   color:"#F59E0B", minPoints:2000, perks:["2x points multiplier","Free shipping always","VIP support","Exclusive products"] },
];

export default function LoyaltyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? TM.dark : TM.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [tab, setTab] = useState<"overview"|"settings">("overview");
  const [settings, setSettings] = useState({ pointsPerNaira:"1", redeemRate:"100", enabled:true });

  const { data } = useQuery({
    queryKey: ["loyalty", storeId],
    queryFn:  () => api.get(`/loyalty/${storeId}/stats`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const saveMut = useMutation({
    mutationFn: () => api.put(`/loyalty/${storeId}/settings`, settings),
    onSuccess: () => toast.success("Saved"),
    onError:   () => toast.error("Backend offline"),
  });

  const stats = data || { totalMembers:0, totalPointsIssued:0, totalRedeemed:0, activeThisMonth:0 };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color:t.text }}>Loyalty Programme</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color:t.muted }}>Reward customers who keep coming back</p>
        </div>
        <div className="flex gap-2">
          {(["overview","settings"] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)} className="px-4 py-2 rounded-xl text-xs font-semibold capitalize"
              style={{ background:tab===tb?V.v500:t.card, color:tab===tb?"#fff":t.muted, border:`1px solid ${tab===tb?V.v500:t.border}` }}>
              {tb}
            </button>
          ))}
        </div>
      </motion.div>

      {tab === "overview" && <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:"Members",          value:stats.totalMembers,       color:V.v400,  icon:Users },
            { label:"Points Issued",    value:stats.totalPointsIssued,  color:V.amber, icon:Star },
            { label:"Points Redeemed",  value:stats.totalRedeemed,      color:V.green, icon:Gift },
            { label:"Active This Month",value:stats.activeThisMonth,    color:V.v300,  icon:TrendingUp },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background:`${s.color}15` }}>
                <s.icon size={14} style={{ color:s.color }} />
              </div>
              <p className="text-xl font-black mb-0.5" style={{ color:t.text }}>{(s.value||0).toLocaleString()}</p>
              <p className="text-xs" style={{ color:t.muted }}>{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-sm font-bold mb-3" style={{ color:t.text }}>Membership Tiers</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {TIERS.map((tier,i) => (
            <motion.div key={tier.name} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              className="p-5 rounded-2xl" style={{ background:t.card, border:`1px solid ${tier.color}30` }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${tier.color}20` }}>
                  <Star size={16} style={{ color:tier.color }} />
                </div>
                <div>
                  <p className="font-black text-sm" style={{ color:t.text }}>{tier.name}</p>
                  <p className="text-xs" style={{ color:t.muted }}>{tier.minPoints>0?`${tier.minPoints.toLocaleString()}+ pts`:"Starting tier"}</p>
                </div>
              </div>
              {tier.perks.map(perk => (
                <div key={perk} className="flex items-center gap-2 mb-1.5">
                  <Check size={10} style={{ color:tier.color, flexShrink:0 }} strokeWidth={3} />
                  <span className="text-xs" style={{ color:t.muted }}>{perk}</span>
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="p-5 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
          <div className="flex items-center gap-2 mb-4"><Zap size={14} color={V.v400} /><h3 className="text-sm font-bold" style={{ color:t.text }}>KIRO manages this automatically</h3></div>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[{e:"🛒",t:"Customer buys",d:"Points added automatically at checkout"},{e:"⭐",t:"Points accumulate",d:"Tiers unlocked as balance grows"},{e:"🎁",t:"Customer redeems",d:"Apply points as discount at checkout"}].map(s => (
              <div key={s.t}><div className="text-2xl mb-2">{s.e}</div><p className="text-xs font-bold mb-1" style={{ color:t.text }}>{s.t}</p><p className="text-xs" style={{ color:t.muted }}>{s.d}</p></div>
            ))}
          </div>
        </div>
      </>}

      {tab === "settings" && (
        <div className="max-w-lg space-y-4">
          <div className="p-5 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
            <h3 className="text-sm font-bold mb-4" style={{ color:t.text }}>Points Configuration</h3>
            <div className="space-y-4">
              {[
                { label:"Points per ₦100 spent", key:"pointsPerNaira", hint:"1 = earn 1 point per ₦100" },
                { label:"Points to redeem ₦100", key:"redeemRate",     hint:"100 = 100 points = ₦100 off" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-2" style={{ color:t.muted }}>{f.label}</label>
                  <input type="number" value={(settings as any)[f.key]} onChange={e => setSettings(s => ({ ...s, [f.key]:e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background:t.faint, border:`1px solid ${t.border}`, color:t.text, fontFamily:"inherit" }} />
                  <p className="text-xs mt-1" style={{ color:t.muted }}>{f.hint}</p>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-semibold" style={{ color:t.text }}>Programme active</p><p className="text-xs" style={{ color:t.muted }}>Customers earn and redeem points</p></div>
                <button onClick={() => setSettings(s => ({ ...s, enabled:!s.enabled }))}
                  style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative", background:settings.enabled?V.v500:"rgba(128,128,128,0.2)", transition:"all 0.2s" }}>
                  <div style={{ position:"absolute", top:2, left:settings.enabled?22:2, width:20, height:20, borderRadius:"50%", background:"white", transition:"left 0.2s" }} />
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)` }}>
            {saveMut.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
}
