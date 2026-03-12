"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24", label: "Pending"    },
  PROCESSING: { bg: "rgba(59,130,246,0.1)",  color: "#60a5fa", label: "Processing" },
  SHIPPED:    { bg: "rgba(124,58,237,0.1)", color: "#7C3AED", label: "Shipped"  },
  DELIVERED:  { bg: "rgba(16,185,129,0.1)",  color: "#10b981", label: "Delivered"  },
  CANCELLED:  { bg: "rgba(239,68,68,0.1)",   color: "#ef4444", label: "Cancelled"  },
  COMPLETED:  { bg: "rgba(16,185,129,0.1)",  color: "#10b981", label: "Completed"  },
};

export function RecentOrdersTable({ orders }: { orders?: any[] }) {
  const rows = orders || [];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Recent Orders</h3>
        <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: "var(--accent)" }}>
          View all <ArrowRight size={11} />
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>No orders yet</div>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {rows.map((o: any) => {
            const st = STATUS_STYLES[o.status] || STATUS_STYLES.PENDING;
            return (
              <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{o.orderNumber}</div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>{o.customerName}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: st.bg, color: st.color }}>{st.label}</span>
                <div className="text-xs font-bold flex-shrink-0" style={{ color: "var(--success)" }}>${Number(o.total).toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
