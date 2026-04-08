// Path: frontend/src/app/admin/waitlist/page.tsx
// You see ALL signups here - name, email, whatsapp, when they joined
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Entry {
  id: string; name: string; email: string;
  whatsapp?: string; referralCode: string;
  source?: string; createdAt: string;
  _count?: { referrals: number };
}

export default function WaitlistAdminPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/waitlist/admin")
      .then(r => { setEntries(r.data.data.entries); setTotal(r.data.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const rows = ["Name,Email,WhatsApp,Source,Joined"]
      .concat(entries.map(e =>
        `"${e.name}","${e.email}","${e.whatsapp || ""}","${e.source || ""}","${new Date(e.createdAt).toLocaleDateString()}"`
      ));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "dropos-waitlist.csv"; a.click();
  };

  return (
    <DashboardLayout>
      <div className="dash-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Waitlist</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "4px" }}>
              {total} people waiting to join DropOS
            </p>
          </div>
          <button onClick={exportCSV}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
            Export CSV
          </button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Name","Email","WhatsApp","Source","Joined"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
                  Loading...
                </td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "60px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "14px" }}>
                  No signups yet. Post those flyers! 🚀
                </td></tr>
              ) : entries.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 20px", color: "#fff", fontSize: "14px", fontWeight: 500 }}>{e.name}</td>
                  <td style={{ padding: "14px 20px", color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>{e.email}</td>
                  <td style={{ padding: "14px 20px", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                    {e.whatsapp
                      ? <a href={`https://wa.me/${e.whatsapp.replace(/\D/g,"")}`} target="_blank"
                          style={{ color: "#34d399", textDecoration: "none" }}>{e.whatsapp}</a>
                      : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)",
                      fontSize: "11px", padding: "3px 10px", borderRadius: "100px" }}>
                      {e.source || "direct"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                    {new Date(e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
