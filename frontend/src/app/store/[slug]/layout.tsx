import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Store", template: "%s | Powered by DropOS" },
  description: "Shop the best products",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
