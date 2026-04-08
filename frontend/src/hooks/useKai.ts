"use client";
// ============================================================
// KAI — Complete Hook (10/10)
// Path: frontend/src/hooks/useKai.ts
// ============================================================
import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useKaiStore } from "@/store/kai.store";
import type { KaiMessage } from "@/types/kai";

export function useKai() {
  const user      = useAuthStore(s => s.user);
  const storeId   = user?.stores?.[0]?.id || "";
  const qc        = useQueryClient();
  const abortRef  = useRef<AbortController | null>(null);

  const {
    messages, addMessage, updateLastMessage, setMessages,
    activeConversationId, setActiveConversationId,
    setConversations, setGreeting, setUnreadCount,
    setPulseAlerts, setSkills, setGoals, setMemories,
    setIsStreaming, setIsLoading, startNewConversation,
  } = useKaiStore();

  // ── Greeting ──────────────────────────────────────────────
  const { data: greetingData } = useQuery({
    queryKey: ["kai-greeting", storeId],
    queryFn: async () => {
      const res = await api.get(`/kai/greeting?storeId=${storeId}`);
      return res.data.data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data: any) => {
      if (data) {
        setGreeting(data.greeting, data.contextLine, data.quickActions || []);
        setUnreadCount(data.unreadAlerts || 0);
      }
    },
  });

  // ── Conversations ──────────────────────────────────────────
  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ["kai-conversations", storeId],
    queryFn: async () => {
      const res = await api.get(`/kai/conversations?storeId=${storeId}`);
      return res.data.data;
    },
    enabled: !!storeId,
    onSuccess: (data: any) => setConversations(data || []),
  });

  // ── Pulse Alerts ───────────────────────────────────────────
  const { refetch: refetchAlerts } = useQuery({
    queryKey: ["kai-pulse", storeId],
    queryFn: async () => {
      const res = await api.get(`/kai/pulse?storeId=${storeId}`);
      return res.data.data;
    },
    enabled: !!storeId,
    refetchInterval: 5 * 60 * 1000, // check every 5 min
    onSuccess: (data: any) => {
      setPulseAlerts(data || []);
      setUnreadCount((data || []).length);
    },
  });

  // ── Skills ─────────────────────────────────────────────────
  const { refetch: refetchSkills } = useQuery({
    queryKey: ["kai-skills", storeId],
    queryFn: async () => {
      const res = await api.get(`/kai/skills?storeId=${storeId}`);
      return res.data.data;
    },
    enabled: !!storeId,
    onSuccess: (data: any) => setSkills(data?.storeSkills || [], data?.globalSkills || []),
  });

  // ── Goals ──────────────────────────────────────────────────
  const { refetch: refetchGoals } = useQuery({
    queryKey: ["kai-goals", storeId],
    queryFn: async () => {
      const res = await api.get(`/kai/goals?storeId=${storeId}`);
      return res.data.data;
    },
    enabled: !!storeId,
    onSuccess: (data: any) => setGoals(data || []),
  });

  // ── Memory ─────────────────────────────────────────────────
  const { refetch: refetchMemories } = useQuery({
    queryKey: ["kai-memories", storeId],
    queryFn: async () => {
      const res = await api.get(`/kai/memories?storeId=${storeId}`);
      return res.data.data;
    },
    enabled: !!storeId,
    onSuccess: (data: any) => setMemories(data || []),
  });

  // ── Load Conversation ──────────────────────────────────────
  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/kai/conversation/${conversationId}`);
      const conv = res.data.data;
      setActiveConversationId(conv.id);
      setMessages(conv.messages || []);
    } finally {
      setIsLoading(false);
    }
  }, [setActiveConversationId, setMessages, setIsLoading]);

  // ── Send Message (streaming) ───────────────────────────────
  const sendMessage = useCallback(async (
    content: string,
    imageBase64?: string,
    imageMediaType?: string
  ) => {
    if (!storeId || !content.trim()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMsg: KaiMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    addMessage(userMsg);

    const kaiMsg: KaiMessage = {
      id: `kai-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    addMessage(kaiMsg);
    setIsStreaming(true);

    try {
      const token   = useAuthStore.getState().accessToken;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${baseURL}/kai/smart-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: content.trim(),
          conversationId: activeConversationId,
          storeId,
          imageBase64,
          imageMediaType,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("KAI request failed");

      const reader  = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText  = "";
      let newConvId: string | null = null;

      if (!reader) throw new Error("No stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n").filter(l => l.startsWith("data: "))) {
          try {
            const parsed = JSON.parse(line.slice(6).trim());
            if (parsed.token) { fullText += parsed.token; updateLastMessage(fullText); }
            if (parsed.conversationId && !activeConversationId) newConvId = parsed.conversationId;
            if (parsed.done) {
              if (newConvId) setActiveConversationId(newConvId);
              refetchConversations();
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError")
        updateLastMessage("I ran into an issue. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }, [storeId, activeConversationId, addMessage, updateLastMessage,
      setIsStreaming, setActiveConversationId, refetchConversations]);

  // ── Mutations ─────────────────────────────────────────────
  const executeActions = useMutation({
    mutationFn: async (actions: any[]) => {
      const res = await api.post("/kai/action", { storeId, conversationId: activeConversationId, actions });
      return res.data;
    },
  });

  const renameConversation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      await api.patch(`/kai/conversation/${id}`, { title });
    },
    onSuccess: () => refetchConversations(),
  });

  const pinConversation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      await api.patch(`/kai/conversation/${id}`, { pinned });
    },
    onSuccess: () => refetchConversations(),
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/kai/conversation/${id}`); },
    onSuccess: () => { startNewConversation(); refetchConversations(); },
  });

  const deleteAllConversations = useMutation({
    mutationFn: async () => { await api.delete("/kai/conversations/all", { data: { storeId } }); },
    onSuccess: () => { startNewConversation(); refetchConversations(); },
  });

  const markAlertRead = useMutation({
    mutationFn: async (alertId: string) => { await api.patch(`/kai/pulse/${alertId}/read`); },
    onSuccess: (_, alertId) => useKaiStore.getState().markAlertRead(alertId),
  });

  const createSkill = useMutation({
    mutationFn: async (data: any) => { await api.post("/kai/skills", { storeId, ...data }); },
    onSuccess: () => refetchSkills(),
  });

  const deleteSkill = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/kai/skills/${id}`); },
    onSuccess: () => refetchSkills(),
  });

  const createGoal = useMutation({
    mutationFn: async (data: any) => { await api.post("/kai/goals", { storeId, ...data }); },
    onSuccess: () => refetchGoals(),
  });

  const deleteMemory = useMutation({
    mutationFn: async (key: string) => { await api.delete(`/kai/memory/${key}`, { data: { storeId } }); },
    onSuccess: () => refetchMemories(),
  });

  return {
    storeId, greetingData,
    messages, conversations: conversationsData || [],
    activeConversationId,
    sendMessage, loadConversation, startNewConversation,
    executeActions, renameConversation, pinConversation,
    deleteConversation, deleteAllConversations,
    markAlertRead, createSkill, deleteSkill,
    createGoal, deleteMemory,
    refetchAlerts, refetchSkills, refetchGoals, refetchMemories,
  };
}
