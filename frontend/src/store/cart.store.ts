import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  storeId: string;
  storeSlug: string;
}

interface CartStore {
  items:           CartItem[];
  isOpen:          boolean;
  capturedEmail:   string | null;
  capturedName:    string | null;
  lastActivity:    number | null;
  pendingOrderId:  string | null;  // real UUID stored before external gateway redirect
  pendingSlug:     string | null;  // store slug stored before external gateway redirect
  addItem:         (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem:      (productId: string, variantId?: string) => void;
  updateQty:       (productId: string, qty: number, variantId?: string) => void;
  clearCart:       () => void;
  openCart:        () => void;
  closeCart:       () => void;
  toggleCart:      () => void;
  setCaptured:     (email: string, name?: string) => void;
  clearCaptured:   () => void;
  setPendingOrder: (orderId: string, slug: string) => void;
  clearPending:    () => void;
  total:           () => number;
  count:           () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:          [],
      isOpen:         false,
      capturedEmail:  null,
      capturedName:   null,
      lastActivity:   null,
      pendingOrderId: null,
      pendingSlug:    null,

      addItem: (item) => {
        set((state) => {
          const key = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
          const existing = state.items.find((i) =>
            (i.variantId ? `${i.productId}-${i.variantId}` : i.productId) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                (i.variantId ? `${i.productId}-${i.variantId}` : i.productId) === key
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
              isOpen:       true,
              lastActivity: Date.now(),
            };
          }
          return {
            items:        [...state.items, { ...item, quantity: item.quantity || 1 }],
            isOpen:       true,
            lastActivity: Date.now(),
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter((i) =>
            variantId ? !(i.productId === productId && i.variantId === variantId) : i.productId !== productId
          ),
          lastActivity: Date.now(),
        }));
      },

      updateQty: (productId, qty, variantId) => {
        if (qty <= 0) { get().removeItem(productId, variantId); return; }
        set((state) => ({
          items: state.items.map((i) =>
            (variantId ? i.productId === productId && i.variantId === variantId : i.productId === productId)
              ? { ...i, quantity: qty }
              : i
          ),
          lastActivity: Date.now(),
        }));
      },

      clearCart:     () => set({ items: [], lastActivity: null }),
      openCart:      () => set({ isOpen: true }),
      closeCart:     () => set({ isOpen: false }),
      toggleCart:    () => set((s) => ({ isOpen: !s.isOpen })),
      setCaptured:   (email, name) => set({ capturedEmail: email, capturedName: name || null }),
      clearCaptured: () => set({ capturedEmail: null, capturedName: null }),
      setPendingOrder: (orderId, slug) => set({ pendingOrderId: orderId, pendingSlug: slug }),
      clearPending:  () => set({ pendingOrderId: null, pendingSlug: null }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "dropos-cart" }
  )
);
