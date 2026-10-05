import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, Bot, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api, OWNER_EMAIL, ASSISTANT_NAME } from "../lib/api";
import { detectIllegal } from "./LegalShield";

export default function YourAssistantBrain({ onAppCreated, agreed }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `Namaste! Main ${ASSISTANT_NAME} hoon. Bolo kya app banana hai? 🚀`, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // FIX 1: Sirf message aane pe scroll karo, typing pe nahi
  useEffect(() => {
    if (scrollRef.current && messages.length > 1) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // FIX 2: Input stable rakho - har baar re-create mat karo
  const handleChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const startMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast.error("Voice not supported");
    const rec = new SR();
    rec.lang = "hi-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      inputRef.current?.focus();
    };
    rec.start();
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg) return;
    if (!agreed) return toast.error("Please accept Legal Shield first");
    const illegal = detectIllegal(msg);
    if (illegal.length) toast.warning("Illegal keyword - VIRTUAL ONLY mode");

    setMessages((m) => [...m, { role: "user", text: msg, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    try {
      const res = await api.assistantChat(msg, OWNER_EMAIL);
      await new Promise((r) => setTimeout(r, 1200));
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", text: res.reply, ts: Date.now(), appId: res.appId, appName: res.appName }]);
      toast.success("App Created");
      onAppCreated?.(res);
    } catch (e) {
      setTyping(false);
      toast.error("Try again");
    }
  };

  return (
    <div className="card-purple flex flex-col h-[540px]">
      <div className="glass flex items-center gap-3 p-3 border-b border-purple-900/40 rounded-t-2xl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center"><Bot className="w-5 h-5 text-black" /></div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
        </div>
        <div><div className="text-sm font-bold text-white">{ASSISTANT_NAME}</div><div className="text-[10px] text-zinc-400">Owner {OWNER_EMAIL} • Online</div></div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user"? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${m.role === "user"? "bg-purple-600 text-white rounded-br-sm" : "bg-white text-zinc-900 rounded-bl-sm"}`}>
              <div>{m.text}</div>
              {m.appId && <button onClick={() => navigate(`/preview/${m.appId}`)} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-purple-700"><ExternalLink className="w-3 h-3" /> Preview "{m.appName}"</button>}
              <div className={`text-[9px] mt-1 ${m.role === "user"? "text-purple-200" : "text-zinc-400"}`}>{new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-white rounded-2xl px-3 py-2 text-[10px] text-zinc-500">typing...</div></div>}
      </div>

      {/* FIXED INPUT - Keyboard kabhi gayab nahi hoga */}
      <div className="p-3 border-t border-purple-900/40 flex items-end gap-2">
        <textarea
          ref={inputRef}
          key="assistant-input-fixed-key"
          value={input}
          onChange={handleChange}
          onKeyDown={(e) => { if (e.key === "Enter" &&!e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Bolo kya banana hai..."
          className="flex-1 resize-none bg-black border border-purple-700/40 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
        />
        <button onClick={startMic} className={`w-9 h-9 rounded-full flex items-center justify-center ${listening? "bg-red-500 animate-pulse" : "bg-[#1a1a22] border border-purple-700/40"}`}><Mic className="w-4 h-4 text-white" /></button>
        <button onClick={send} className="w-9 h-9 rounded-full btn-purple flex items-center justify-center"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
