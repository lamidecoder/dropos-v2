"use client";
import { ReactNode } from "react";

const t = {
  border: "rgba(255,255,255,0.07)",
  text:   "rgba(255,255,255,0.9)",
  muted:  "rgba(255,255,255,0.4)",
  card:   "rgba(255,255,255,0.03)",
};

// Responsive stat card grid
export function StatGrid({ children, cols=4 }: { children:ReactNode; cols?:number }) {
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:12, marginBottom:24 }} className="adm-stat-grid">
        {children}
      </div>
      <style>{`
        @media(max-width:900px){ .adm-stat-grid{ grid-template-columns:1fr 1fr!important; } }
        @media(max-width:480px){ .adm-stat-grid{ gap:8px!important; } }
      `}</style>
    </>
  );
}

// Stat card
export function StatCard({ label, value, color, icon:Icon, sub }: any) {
  return (
    <div style={{ padding:18, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={15} color={color}/>
        </div>
        {sub !== undefined && (
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:sub>=0?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", color:sub>=0?"#10B981":"#EF4444" }}>
            {sub>=0?"+":""}{sub}%
          </span>
        )}
      </div>
      <p style={{ fontSize:22, fontWeight:900, color:t.text, letterSpacing:"-0.05em", margin:"0 0 3px", lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:11, color:t.muted, margin:0 }}>{label}</p>
    </div>
  );
}

// Badge pill
export function Badge({ label, color, bg }: { label:string; color:string; bg:string }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:bg, color, display:"inline-block", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

// Filter bar — wraps on mobile
export function FilterBar({ children }: { children:ReactNode }) {
  return (
    <>
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }} className="adm-filter">
        {children}
      </div>
      <style>{`
        @media(max-width:640px){ .adm-filter>div,.adm-filter>select,.adm-filter>input{ width:100%!important; flex:none!important; } }
      `}</style>
    </>
  );
}

// Search input
export function SearchInput({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return (
    <div style={{ flex:1, minWidth:200, display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:`1px solid ${t.border}` }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder||"Search..."}
        style={{ flex:1, background:"transparent", border:"none", outline:"none", color:t.text, fontSize:13, fontFamily:"inherit" }}/>
    </div>
  );
}

// Select filter
export function SelectFilter({ value, onChange, options }: { value:string; onChange:(v:string)=>void; options:{value:string;label:string}[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding:"9px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.6)", fontSize:13, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Page header
export function PageHeader({ title, sub, action }: { title:string; sub:string; action?:ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22, gap:12, flexWrap:"wrap" }}>
      <div>
        <h1 style={{ fontSize:"clamp(18px,3vw,24px)", fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 3px" }}>{title}</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>{sub}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Pagination
export function Pagination({ page, pages, total, onPage }: { page:number; pages:number; total:number; onPage:(p:number)=>void }) {
  if (!pages || pages <= 1) return null;
  const range = Array.from({ length: Math.min(pages, 5) }, (_, i) => {
    if (pages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= pages - 2) return pages - 4 + i;
    return page - 2 + i;
  }).filter(p => p >= 1 && p <= pages);

  const btnStyle = (active: boolean): any => ({
    minWidth:32, height:32, padding:"0 10px", borderRadius:8,
    border:`1px solid ${active?"rgba(107,53,232,0.5)":"rgba(255,255,255,0.07)"}`,
    background:active?"rgba(107,53,232,0.15)":"transparent",
    color:active?"#A78BFA":"rgba(255,255,255,0.4)",
    cursor:"pointer", fontSize:12, fontWeight:active?700:400,
  });

  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, flexWrap:"wrap", gap:10 }}>
      <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>{(total||0).toLocaleString()} total</span>
      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
        <button onClick={() => onPage(page-1)} disabled={page===1} style={{ ...btnStyle(false), opacity:page===1?0.3:1 }}>←</button>
        {range.map(p => <button key={p} onClick={() => onPage(p)} style={btnStyle(p===page)}>{p}</button>)}
        <button onClick={() => onPage(page+1)} disabled={page>=pages} style={{ ...btnStyle(false), opacity:page>=pages?0.3:1 }}>→</button>
      </div>
    </div>
  );
}

// Responsive data table — on mobile collapses to card-style rows
export function DataTable({ cols, rows, loading, empty="No records found" }: {
  cols: { key:string; label:string; width?:string; hide?:"sm"|"md" }[];
  rows: { [key:string]:ReactNode }[];
  loading?: boolean;
  empty?:   string;
}) {
  const tplCols = cols.map(c => c.width || "1fr").join(" ");
  const hdrs    = cols.map(c => (
    <span key={c.key} className={c.hide?`adm-col-hide-${c.hide}`:""} style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"rgba(255,255,255,0.25)", textTransform:"uppercase" }}>
      {c.label}
    </span>
  ));

  return (
    <div style={{ borderRadius:16, border:`1px solid ${t.border}`, overflow:"hidden", overflowX:"auto" }}>
      <div style={{ minWidth:480 }}>
        <div style={{ display:"grid", gridTemplateColumns:tplCols, gap:0, padding:"9px 16px", background:"rgba(255,255,255,0.02)", borderBottom:`1px solid ${t.border}` }}>
          {hdrs}
        </div>
        {loading ? (
          <div style={{ padding:"40px 0", textAlign:"center", color:t.muted, fontSize:13 }}>Loading...</div>
        ) : rows.length === 0 ? (
          <div style={{ padding:"40px 0", textAlign:"center", color:t.muted, fontSize:13 }}>{empty}</div>
        ) : rows.map((row, i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:tplCols, gap:0, padding:"12px 16px", borderBottom:`1px solid rgba(255,255,255,0.04)`, alignItems:"center" }}>
            {cols.map(c => (
              <div key={c.key} className={c.hide?`adm-col-hide-${c.hide}`:""} style={{ overflow:"hidden", minWidth:0 }}>
                {row[c.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        @media(max-width:768px){ .adm-col-hide-md{ display:none!important; } }
        @media(max-width:540px){ .adm-col-hide-sm{ display:none!important; } }
      `}</style>
    </div>
  );
}
