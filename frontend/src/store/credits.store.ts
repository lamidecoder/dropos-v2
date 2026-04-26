import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CreditsState {
  balance:      number;
  plan:         "FREE" | "GROWTH" | "PRO";
  monthlyLimit: number;
  usedThisMonth: number;
  lastRefresh:  string | null;
  // Actions
  setBalance:   (b: number) => void;
  setPlan:      (p: "FREE" | "GROWTH" | "PRO") => void;
  deduct:       (amount: number) => boolean; // returns false if insufficient
  setFromAPI:   (data: { balance: number; plan: string; monthlyLimit: number; usedThisMonth: number }) => void;
}

const PLAN_LIMITS: Record<string, number> = {
  FREE:   500,
  GROWTH: 3000,
  PRO:    10000,
};

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      balance:       500,
      plan:          "FREE",
      monthlyLimit:  500,
      usedThisMonth: 0,
      lastRefresh:   null,

      setBalance:  (balance)  => set({ balance }),
      setPlan:     (plan)     => set({ plan, monthlyLimit: PLAN_LIMITS[plan] || 500 }),

      deduct: (amount) => {
        const { balance } = get();
        if (balance < amount) return false;
        set(s => ({ balance: s.balance - amount, usedThisMonth: s.usedThisMonth + amount }));
        return true;
      },

      setFromAPI: ({ balance, plan, monthlyLimit, usedThisMonth }) => {
        set({ balance, plan: plan as any, monthlyLimit, usedThisMonth });
      },
    }),
    { name: "dropos-credits" }
  )
);

// Credit costs for each feature
export const CREDIT_COSTS = {
  kiro_message:     1,
  image_generate:   5,
  image_lifestyle:  8,
  image_background: 3,
  tiktok_script:    3,
  ad_copy:          2,
  product_desc:     2,
  competitor_spy:   5,
  product_research: 4,
  store_build:      20,
  video_short:      20,
  video_standard:   50,
  video_hd:         100,
} as const;
