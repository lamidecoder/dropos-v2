"use client";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { ExternalLink, Building2 } from "lucide-react";
import { PageHeader, DataTable } from "../../../components/admin/AdminTable";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B" };
const t = { text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

export default function AdminPaystackPage() {
  const { data:raw, isLoading } = useQuery<any>({
    queryKey: ["admin-paystack-subs"],
    queryFn: () => adminAPI.get("/admin/paystack/subaccounts").then((r:any) => r.data.data||[]),
  });

  const stores = raw || [];

  const rows = stores.map((s: any) => ({
    store: (
      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"rgba(245,158,11,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Building2 size={13} color={V.amber}/>
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{s.name}</p>
          <p style={{ fontSize:10, color:t.muted, margin:0 }}>/{s.slug}</p>
        </div>
      </div>
    ),
    owner:   <div><p style={{ fontSize:12, color:t.text, margin:0 }}>{s.owner?.name}</p><p style={{ fontSize:10, color:t.muted, margin:0 }}>{s.owner?.email}</p></div>,
    code:    <code style={{ fontSize:11, color:V.amber, background:"rgba(245,158,11,0.08)", padding:"2px 8px", borderRadius:6 }}>{s.paystackSubaccountCode}</code>,
    orders:  <span style={{ fontSize:13, fontWeight:700, color:t.text }}>{s._count?.orders||0}</span>,
    link:    (
      <a href={`https://dashboard.paystack.com/#/subaccounts`} target="_blank" rel="noreferrer"
        style={{ padding:"5px 8px", borderRadius:7, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.15)", color:V.amber, textDecoration:"none", display:"flex", alignItems:"center" }}>
        <ExternalLink size={11}/>
      </a>
    ),
  }));

  return (
    <div>
      <PageHeader title="Paystack Subaccounts" sub={`${stores.length} stores with active Paystack subaccounts`}/>

      {stores.length === 0 && !isLoading ? (
        <div style={{ padding:"60px 0", textAlign:"center" }}>
          <Building2 size={32} style={{ color:t.muted, margin:"0 auto 12px" }}/>
          <p style={{ fontSize:15, fontWeight:700, color:t.text, margin:"0 0 6px" }}>No subaccounts yet</p>
          <p style={{ fontSize:13, color:t.muted }}>Once merchants verify their Paystack accounts, subaccounts will appear here.</p>
        </div>
      ) : (
        <DataTable
          loading={isLoading}
          cols={[
            { key:"store",  label:"Store",      width:"2fr"           },
            { key:"owner",  label:"Owner",      width:"1.5fr", hide:"sm" },
            { key:"code",   label:"Sub. Code",  width:"1.5fr"         },
            { key:"orders", label:"Orders",     width:"80px",  hide:"md" },
            { key:"link",   label:"",           width:"40px"          },
          ]}
          rows={rows}
          empty="No subaccounts found"
        />
      )}

      <div style={{ marginTop:20, padding:"16px 20px", borderRadius:14, background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.12)" }}>
        <p style={{ fontSize:12, color:"rgba(245,158,11,0.7)", margin:0, lineHeight:1.6 }}>
          💡 Paystack subaccounts are created per merchant once their business account is verified. For direct management, visit <a href="https://dashboard.paystack.com" target="_blank" rel="noreferrer" style={{ color:V.amber }}>dashboard.paystack.com</a>
        </p>
      </div>
    </div>
  );
}
