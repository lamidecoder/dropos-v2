"use client";

// Mobile bottom navigation bar - visible on screens < 640px
// Shows the 5 most important nav items with active state

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, BarChart2, MoreHorizontal,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Home"      },
  { href: "/dashboard/orders",     icon: ShoppingBag,     label: "Orders"    },
  { href: "/dashboard/products",   icon: Package,         label: "Products"  },
  { href: "/dashboard/analytics",  icon: BarChart2,       label: "Analytics" },
  { href: "/dashboard/settings",   icon: MoreHorizontal,  label: "More"      },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav sm:hidden">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all"
            style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}>
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold">{label}</span>
            {active && (
              <span className="absolute bottom-0 w-8 h-0.5 rounded-full"
                style={{ background: "var(--accent)" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
