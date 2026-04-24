"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ClassicTemplate  = dynamic(() => import("./ClassicTemplate"),  { ssr: false });
const ModernTemplate   = dynamic(() => import("./ModernTemplate"),   { ssr: false });
const MinimalTemplate  = dynamic(() => import("./MinimalTemplate"),  { ssr: false });
const BoldTemplate     = dynamic(() => import("./BoldTemplate"),     { ssr: false });
const ElegantTemplate  = dynamic(() => import("./ElegantTemplate"),  { ssr: false });
const AbandonedCartTracker = dynamic(() => import("../AbandonedCartTracker"), { ssr: false });

export type TemplateProps = {
  store: any;
  products?: any[];
  product?: any;
  cart?: any;
  onAddToCart?: (product: any) => void;
  onRemoveFromCart?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, qty: number) => void;
  onCheckout?: () => void;
  page?: "home" | "product" | "cart" | "checkout" | "confirmation";
  [key: string]: any;
};

const TEMPLATE_MAP: Record<string, any> = {
  classic: ClassicTemplate,
  modern:  ModernTemplate,
  minimal: MinimalTemplate,
  bold:    BoldTemplate,
  elegant: ElegantTemplate,
};

export function TemplateRenderer(props: TemplateProps) {
  const theme     = props.store?.theme || "classic";
  const Component = TEMPLATE_MAP[theme] || ClassicTemplate;
  return (
    <div className="template-root">
      <Suspense fallback={<div className="min-h-screen" style={{ background: "#06040D" }} />}>
        <Component {...props} />
      </Suspense>
      <AbandonedCartTracker store={props.store} exitDiscount={10} idleMinutes={30} />
    </div>
  );
}
