import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, Bot, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api, OWNER_EMAIL, ASSISTANT_NAME } from "../lib/api";

function YourAssistantBrain({ onAppCreated, agreed }) {
  const [messages, setMessages] = useState([{ role: "ai", text: `Bolo kya app banana hai?`, ts: Date.now() }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages.length]);

  const send = async () => {
    const msg = input.trim(); if(!msg) return;
    setMessages(m => [...m, { role: "user", text: msg, ts: Date.now() }]); setInput("");
    try { const res = await api.assistantChat(msg, OWNER_EMAIL); setMessages(m => [...m, { role: "ai", text: res.reply, ts: Date.now(), appId: res.appId }]); onAppCreated?.(res); } catch {}
  };

  return (
    <div className="card-purple flex flex-col h-[540px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m,i) => <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${m.role==="user"?"bg-purple-600 text-white":"bg-white text-zinc-900"}`}>{m.text}</div></div>)}
      </div>
      <div className="p-3 border-t border-purple-900/40 flex gap-2">
        <input ref={inputRef} type="text" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); send(); }}} placeholder="Yaha likho..." className="flex-1 bg-black border border-purple-700/40 rounded-xl px-3 py-3 text-sm text-white focus:outline-none" />
        <button onClick={send} className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
export default React.memo(YourAssistantBrain);
