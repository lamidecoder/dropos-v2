"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import {
  MessageCircle, Phone, Zap, Globe, Settings2, CheckCircle,
  Save, ExternalLink, AlertCircle, Eye, EyeOff, ToggleLeft, ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";

const tx   = "[color:var(--text-primary)]";
const sub  = "text-secondary";
const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
const inp  = "[background:var(--bg-card)] [border-color:var(--border)] [color:var(--text-primary)] border rounded-xl px-3 py-2.5 text-sm outline-none w-full focus:[border-color:var(--accent)] transition-colors";

const PROVIDERS = [
  {
    id: "whatsapp",
    name: "WhatsApp Button",
    desc: "A floating WhatsApp button that opens a chat with your number",
    icon: "💬",
    color: "#25d366",
    idLabel: "WhatsApp Number",
    idPlaceholder: "+2348012345678",
    idHelp: "Include country code, e.g. +234...",
    setupUrl: null,
  },
  {
    id: "tawk",
    name: "Tawk.to",
    desc: "Free live chat. Get your Property ID from tawk.to dashboard.",
    icon: "🦅",
    color: "#03b8f5",
    idLabel: "Property ID",
    idPlaceholder: "5e123abc4b1b94133e6481ef/default",
    idHelp: "Found in Administration → Property Settings",
    setupUrl: "https://tawk.to",
  },
  {
    id: "crisp",
    name: "Crisp",
    desc: "Modern live chat with free tier. Get your Website ID from crisp.chat.",
    icon: "💙",
    color: "#1972f5",
    idLabel: "Website ID",
    idPlaceholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    idHelp: "Found in Settings → Website Settings",
    setupUrl: "https://crisp.chat",
  },
  {
    id: "tidio",
    name: "Tidio",
    desc: "AI-powered chat and chatbots. Get your public key from Tidio.",
    icon: "🤖",
    color: "#0000f0",
    idLabel: "Public Key",
    idPlaceholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    idHelp: "Found in Settings → Developer",
    setupUrl: "https://tidio.com",
  },
];

// WhatsApp notification settings (uses existing store fields)
export default function ChatSettingsPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const qc      = useQueryClient();

  const [liveChatProvider, setLiveChatProvider] = useState("");
  const [liveChatId,       setLiveChatId]       = useState("");
  const [liveChatEnabled,  setLiveChatEnabled]  = useState(false);
  const [whatsappEnabled,  setWhatsappEnabled]  = useState(false);
  const [whatsappPhone,    setWhatsappPhone]    = useState("");
  const [smsPhone,         setSmsPhone]         = useState("");
  const [smsEnabled,       setSmsEnabled]       = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ["store-settings", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  useEffect(() => {
    if (!store) return;
    setLiveChatProvider(store.liveChatProvider || "");
    setLiveChatId(store.liveChatId || "");
    setLiveChatEnabled(!!store.liveChatEnabled);
    setWhatsappEnabled(!!store.whatsappEnabled);
    setWhatsappPhone(store.whatsappPhone || "");
    setSmsPhone(store.smsPhone || "");
    setSmsEnabled(!!store.smsEnabled);
  }, [store]);

  const saveMut = useMutation({
    mutationFn: () => api.patch(`/stores/${storeId}`, {
      liveChatProvider: liveChatEnabled ? liveChatProvider : null,
      liveChatId:       liveChatEnabled ? liveChatId : null,
      liveChatEnabled,
      whatsappEnabled,
      whatsappPhone,
      smsPhone,
      smsEnabled,
    }),
    onSuccess: () => { toast.success("Chat settings saved"); qc.invalidateQueries({ queryKey: ["store-settings"] }); },
    onError:   (e: any) => toast.error(e.response?.data?.message || "Save failed"),
  });

  const selectedProvider = PROVIDERS.find(p => p.id === liveChatProvider);

  if (isLoading) return (
    
      <div className="py-16 text-center text-secondary">Loading…</div>
    
  );

  return (
    
      <div className="space-y-6 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Chat & Contact</h1>
            <p className={`text-sm mt-1 ${sub}`}>Add a live chat widget or WhatsApp button to your storefront</p>
          </div>
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Save size={14} /> {saveMut.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {/* WhatsApp alert notifications */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#25d36618" }}>
                <span className="text-lg">💬</span>
              </div>
              <div>
                <p className={`font-bold text-sm ${tx}`}>WhatsApp Order Alerts</p>
                <p className={`text-xs ${sub}`}>Get notified via WhatsApp for new orders & updates</p>
              </div>
            </div>
            <button onClick={() => setWhatsappEnabled(p => !p)}
              className={`transition-colors ${whatsappEnabled ? "text-emerald-400" : sub}`}>
              {whatsappEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
          {whatsappEnabled && (
            <div>
              <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Your WhatsApp Number</label>
              <input value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)}
                className={inp} placeholder="+2348012345678" />
              <p className={`text-xs ${sub} mt-1`}>We'll send order notifications here via WhatsApp</p>
            </div>
          )}
        </div>

        {/* SMS alerts */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
                <Phone size={16} className="[color:var(--accent)]" />
              </div>
              <div>
                <p className={`font-bold text-sm ${tx}`}>SMS Order Alerts</p>
                <p className={`text-xs ${sub}`}>Receive SMS text message for new orders</p>
              </div>
            </div>
            <button onClick={() => setSmsEnabled(p => !p)}
              className={`transition-colors ${smsEnabled ? "text-emerald-400" : sub}`}>
              {smsEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
          {smsEnabled && (
            <div>
              <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Your Phone Number</label>
              <input value={smsPhone} onChange={e => setSmsPhone(e.target.value)}
                className={inp} placeholder="+2348012345678" />
            </div>
          )}
        </div>

        {/* Live chat widget */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                <MessageCircle size={16} className="text-[var(--text-primary)]" />
              </div>
              <div>
                <p className={`font-bold text-sm ${tx}`}>Live Chat Widget</p>
                <p className={`text-xs ${sub}`}>Add a chat bubble to your storefront</p>
              </div>
            </div>
            <button onClick={() => setLiveChatEnabled(p => !p)}
              className={`transition-colors ${liveChatEnabled ? "text-emerald-400" : sub}`}>
              {liveChatEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>

          {liveChatEnabled && (
            <div className="space-y-4">
              {/* Provider selection */}
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-2.5`}>Chat Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.map(p => (
                    <button key={p.id} onClick={() => setLiveChatProvider(p.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${liveChatProvider === p.id ? "border-2" : ""}`}
                      style={{
                        borderColor: liveChatProvider === p.id ? p.color : "var(--border)",
                        background:  liveChatProvider === p.id ? `${p.color}10` : "var(--bg-card)",
                      }}>
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <p className={`text-xs font-bold ${tx}`}>{p.name}</p>
                        <p className={`text-[10px] ${sub} line-clamp-1`}>{p.desc.split(".")[0]}</p>
                      </div>
                      {liveChatProvider === p.id && <CheckCircle size={12} className="ml-auto flex-shrink-0" style={{ color: p.color }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID input */}
              {selectedProvider && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-xs font-semibold ${sub}`}>{selectedProvider.idLabel}</label>
                    {selectedProvider.setupUrl && (
                      <a href={selectedProvider.setupUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs [color:var(--accent)] flex items-center gap-1 hover:opacity-80">
                        Get account <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <input value={liveChatId} onChange={e => setLiveChatId(e.target.value)}
                    className={inp} placeholder={selectedProvider.idPlaceholder} />
                  <p className={`text-xs ${sub} mt-1`}>{selectedProvider.idHelp}</p>
                </div>
              )}

              {/* Preview */}
              {liveChatId && selectedProvider && (
                <div className="rounded-xl p-3 border flex items-center gap-3"
                  style={{ background: `${selectedProvider.color}08`, borderColor: `${selectedProvider.color}20` }}>
                  <CheckCircle size={14} style={{ color: selectedProvider.color }} className="flex-shrink-0" />
                  <p className={`text-xs ${sub}`}>
                    {selectedProvider.name} widget will appear on your storefront after saving.
                    {selectedProvider.id === "whatsapp" && " Clicking it opens a WhatsApp chat with " + liveChatId}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* How the widget works */}
        {liveChatEnabled && selectedProvider && (
          <div className={`rounded-xl border p-4 ${card} flex items-start gap-3`}>
            <AlertCircle size={14} className="[color:var(--accent)] mt-0.5 flex-shrink-0" />
            <div className={`text-xs ${sub} space-y-1`}>
              <p className="font-bold [color:var(--text-primary)]">How it works</p>
              {selectedProvider.id === "whatsapp" && <p>A floating WhatsApp button appears bottom-right. Clicking opens wa.me/{liveChatId || "your-number"} in WhatsApp.</p>}
              {selectedProvider.id === "tawk"     && <p>Tawk.to script is injected into your storefront. The chat bubble handles everything — agents log in at tawk.to/chat.</p>}
              {selectedProvider.id === "crisp"    && <p>Crisp widget script is injected. Manage chats from your Crisp inbox at app.crisp.chat.</p>}
              {selectedProvider.id === "tidio"    && <p>Tidio loads your chatbot + live chat automatically. Manage from app.tidio.com.</p>}
            </div>
          </div>
        )}
      </div>
    
  );
}
