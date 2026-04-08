"use client";
// ============================================================
// KAI — Complete State Store (10/10)
// Path: frontend/src/store/kai.store.ts
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  KaiMessage, KaiConversation, KaiQuickAction,
  KaiPulseAlert, KaiSkill, KaiGoal, KaiBrandVoice, KaiMemoryEntry,
} from "@/types/kai";

interface KaiState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;

  // Conversation
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: KaiMessage[];
  setMessages: (m: KaiMessage[]) => void;
  addMessage: (m: KaiMessage) => void;
  updateLastMessage: (content: string) => void;
  conversations: KaiConversation[];
  setConversations: (c: KaiConversation[]) => void;

  // Greeting
  greeting: string;
  contextLine: string;
  quickActions: KaiQuickAction[];
  setGreeting: (g: string, c: string, a: KaiQuickAction[]) => void;

  // Streaming
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // Pulse alerts
  pulseAlerts: KaiPulseAlert[];
  setPulseAlerts: (a: KaiPulseAlert[]) => void;
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  markAlertRead: (id: string) => void;

  // Skills
  skills: KaiSkill[];
  globalSkills: KaiSkill[];
  setSkills: (s: KaiSkill[], g: KaiSkill[]) => void;
  showSkills: boolean;
  setShowSkills: (v: boolean) => void;

  // Goals
  goals: KaiGoal[];
  setGoals: (g: KaiGoal[]) => void;

  // Memory
  memories: KaiMemoryEntry[];
  setMemories: (m: KaiMemoryEntry[]) => void;

  // UI tabs
  activeTab: "chat" | "pulse" | "skills" | "memory" | "goals";
  setActiveTab: (t: "chat" | "pulse" | "skills" | "memory" | "goals") => void;

  startNewConversation: () => void;
}

export const useKaiStore = create<KaiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      activeConversationId: null,
      setActiveConversationId: (id) => set({ activeConversationId: id, messages: [] }),
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
      updateLastMessage: (content) =>
        set((s) => {
          const msgs = [...s.messages];
          if (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant") {
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
          }
          return { messages: msgs };
        }),
      conversations: [],
      setConversations: (conversations) => set({ conversations }),

      greeting: "Good morning",
      contextLine: "What are we building today?",
      quickActions: [],
      setGreeting: (greeting, contextLine, quickActions) =>
        set({ greeting, contextLine, quickActions }),

      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }),
      isLoading: false,
      setIsLoading: (v) => set({ isLoading: v }),

      pulseAlerts: [],
      setPulseAlerts: (a) => set({ pulseAlerts: a }),
      unreadCount: 0,
      setUnreadCount: (n) => set({ unreadCount: n }),
      markAlertRead: (id) =>
        set((s) => ({
          pulseAlerts: s.pulseAlerts.map(a => a.id === id ? { ...a, read: true } : a),
          unreadCount: Math.max(0, s.unreadCount - 1),
        })),

      skills: [],
      globalSkills: [],
      setSkills: (skills, globalSkills) => set({ skills, globalSkills }),
      showSkills: false,
      setShowSkills: (v) => set({ showSkills: v }),

      goals: [],
      setGoals: (goals) => set({ goals }),

      memories: [],
      setMemories: (memories) => set({ memories }),

      activeTab: "chat",
      setActiveTab: (activeTab) => set({ activeTab }),

      startNewConversation: () =>
        set({ activeConversationId: null, messages: [], activeTab: "chat" }),
    }),
    {
      name: "dropos-kai-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarOpen: s.sidebarOpen }),
    }
  )
);
