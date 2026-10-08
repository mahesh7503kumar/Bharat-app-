import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bot, Blocks, ShieldCheck, Sparkles, Crown, Rocket } from "lucide-react";
import { api, ASSISTANT_NAME, APP_VERSION } from "../lib/api";
import YourAssistantBrain from "../components/YourAssistantBrain";
import BuilderCanvas from "../components/BuilderCanvas";
import LegalShield, { LegalFooter } from "../components/LegalShield";

export default function Home() {
  const [tab, setTab] = useState("assistant");
  const [aiModel, setAiModel] = useState("ChatGPT");
  const [agreed, setAgreed] = useState(false);
  const [banner, setBanner] = useState(null);
  const [payConfig, setPayConfig] = useState({});
  const [recent, setRecent] = useState([]);

  const refreshRecent = useCallback(() => {
    api.apps().then((a) => setRecent(a.slice(0, 4))).catch(() => {});
  }, []);

  useEffect(() => {
    api.banner().then(setBanner).catch(() => {});
    api.config("payment").then(setPayConfig).catch(() => {});
    refreshRecent();
  }, [refreshRecent]);

  // UPDATE BUTTON KA REAL FIX
  const handleUpdate = useCallback(async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.pathname + '?v=' + Date.now();
    setTimeout(() => window.location.reload(), 300);
  }, []);

  return (
    <div className="min-h-screen bharat-glow">
      {/* Global banner - AB UPDATE BUTTON WORK KAREGA */}
      {banner?.active && banner?.text && (
        <div className="text-center text-xs font-semibold py-2 px-3 flex items-center justify-center gap-3" style={{ background: banner.bgColor || "#7c3aed", color: "#fff" }}>
          <span>{banner.text}</span>
          {banner.text.toLowerCase().includes('update') && (
            <button onClick={handleUpdate} className="bg-white text-purple-700 rounded-full px-3 py-1 text-[11px] font-extrabold animate-pulse">Update Now</button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-purple-900/40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-amber-400 flex items-center justify-center">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-white text-lg leading-none">{ASSISTANT_NAME}</div>
              <div className="text-[10px] text-zinc-400">Bharat App Builder v{APP_VERSION}</div>
            </div>
          </div>
          <Link to="/superadmin" data-testid="superadmin-nav-link" className="flex items-center gap-2 text-xs font-bold gold-text border gold-border rounded-full px-4 py-2 hover:bg-amber-400/10">
            <Crown className="w-4 h-4" /> Super Admin
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6 fadeup">
        <div className="caption text-amber-400/90 font-mono text-xs tracking-widest uppercase mb-3">India's #1 No-Code Mini-App Engine</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl">
          Build any app by just <span className="text-purple-500">talking</span> to <span className="text-amber-400">{ASSISTANT_NAME}</span>
        </h1>
        <p className="text-zinc-400 mt-4 max-w-xl text-base">Drag-drop blocks, generate apps with voice in Hindi/English, add UPI · Razorpay · PhonePe · AdMob, and export a Play-Store-ready APK. Entertainment & virtual coins only.</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {[["45+ Blocks", Blocks], ["Voice AI", Sparkles], ["3-Lock Admin", ShieldCheck], ["APK Export", Rocket]].map(([t, Icon], i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-zinc-300 bg-white/5 border border-purple-700/20 rounded-full px-3 py-1.5"><Icon className="w-3.5 h-3.5 text-amber-400" /> {t}</span>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="card-purple p-4 mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">Super AI Assistant</div>
              <p className="text-xs text-zinc-400 mt-1">Choose your preferred AI assistant to get started.</p>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="AI assistant providers">
              {["ChatGPT", "Emergent", "Gemini", "Meta AI"].map((model) => (
                <button
                  key={model}
                  type="button"
                  role="tab"
                  aria-selected={aiModel === model}
                  onClick={() => setAiModel(model)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${aiModel === model ? "btn-purple text-white" : "bg-white/5 text-zinc-300 border border-purple-700/20 hover:border-purple-500"}`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button data-testid="tab-assistant" onClick={() => setTab("assistant")} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold ${tab === "assistant"? "btn-purple" : "bg-white/5 text-zinc-300 border border-purple-700/20"}`}><Bot className="w-4 h-4" /> Your Assistant</button>
          <button data-testid="tab-builder" onClick={() => setTab("builder")} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold ${tab === "builder"? "btn-purple" : "bg-white/5 text-zinc-300 border border-purple-700/20"}`}><Blocks className="w-4 h-4" /> Drag-Drop Builder</button>
        </div>
        <div className="mb-4"><LegalShield agreed={agreed} setAgreed={setAgreed} /></div>
        {tab === "assistant"? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <YourAssistantBrain agreed={agreed} onAppCreated={refreshRecent} />
            <div className="card-purple p-4">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-3">Recent Apps</div>
              {recent.length === 0 && <div className="text-xs text-zinc-500">No apps yet — ask Your Assistant to build one!</div>}
              <div className="space-y-2">{recent.map((a) => (<Link key={a.appId} to={`/preview/${a.appId}`} className="flex items-center justify-between bg-black border border-purple-700/20 rounded-lg px-3 py-2 hover:border-purple-500"><div><div className="text-sm text-white">{a.appName}</div><div className="text-[10px] text-zinc-500">{(a.blocks || []).length} blocks {a.illegalFlagged? "• ⚠️ virtual-forced" : ""}</div></div><span className="text-[10px] gold-text">Preview →</span></Link>))}</div>
            </div>
          </div>
        ) : (<BuilderCanvas agreed={agreed} config={payConfig} />)}
      </section>
      <LegalFooter />
    </div>
  );
}
