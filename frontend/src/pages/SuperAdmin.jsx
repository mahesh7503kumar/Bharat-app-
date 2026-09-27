import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import {
  Crown, Mail, Smartphone, ScanFace, ShieldAlert, Lock, Bot, Code2, ToggleRight,
  Megaphone, Users, Rocket, Copy, Wallet, Send, Save, Trash2, Ban, Eye, Plus,
  CheckCircle2, RefreshCw, Package, Download,
} from "lucide-react";
import { api, OWNER_EMAIL, ASSISTANT_NAME, safeOrigin } from "../lib/api";
import ErrorBoundary from "../components/ErrorBoundary";

const inp = "w-full bg-black border border-purple-700/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500";
const lbl = "text-[11px] text-zinc-400 mb-1 block";

/* ============ LOCK 1: EMAIL ============ */
function EmailLock({ onPass }) {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const submit = async () => {
    try {
      await api.verifyEmail(email);
      toast.success("Email verified ✅");
      onPass();
    } catch {
      toast.error(`Only Owner ${OWNER_EMAIL}`);
      await api.addLog({ event: "email_lock", status: "failed", email, detail: "intruder failed email_lock" }).catch(() => {});
      setTimeout(() => navigate("/"), 1500);
    }
  };
  return (
    <LockShell step={1} icon={Mail} title="Owner Email Verification" sub="Step 1 / 2">
      <label className={lbl}>Owner Email</label>
      <input data-testid="superadmin-3lock-email-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={OWNER_EMAIL} className={inp} />
      <button data-testid="email-lock-submit" onClick={submit} className="btn-purple w-full rounded-full py-2.5 mt-3 text-sm font-bold">Verify Email</button>
    </LockShell>
  );
}

/* ============ LOCK 2: MOBILE OTP ============ */
function OtpLock({ onPass }) {
  const [mobile, setMobile] = useState("");
  const [sent, setSent] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) return toast.error("Enter valid 10-digit mobile");
    const res = await api.sendOtp("+91" + mobile);
    setSent(true);
    setTimer(60);
    toast.success(`OTP sent to +91${mobile}`);
    if (res.devOtp) toast.message(`Console OTP (SMS fallback): ${res.devOtp}`, { duration: 8000 });
  };

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...digits]; n[i] = v; setDigits(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const verify = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
    try {
      await api.verifyOtp("+91" + mobile, otp);
      toast.success("Mobile verified via SMS OTP ✅");
      onPass();
    } catch {
      toast.error("Wrong OTP");
    }
  };

  return (
    <LockShell step={2} icon={Smartphone} title="🔐 Owner Mobile Verification" sub="Step 2 / 2 · Real SMS OTP">
      {!sent ? (
        <>
          <label className={lbl}>Mobile Number</label>
          <div className="flex gap-2">
            <span className="bg-black border border-purple-700/40 rounded-lg px-3 py-2 text-sm text-zinc-300">+91</span>
            <input data-testid="otp-mobile-input" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98xxxxxx10" className={inp} />
          </div>
          <button data-testid="send-otp-btn" onClick={sendOtp} className="btn-purple w-full rounded-full py-2.5 mt-3 text-sm font-bold">Send Real OTP</button>
        </>
      ) : (
        <>
          <label className={lbl}>Enter 6-digit OTP sent to +91{mobile}</label>
          <div className="flex gap-2 justify-between" data-testid="superadmin-3lock-otp-input">
            {digits.map((d, i) => (
              <input key={i} ref={(el) => (refs.current[i] = el)} value={d} onChange={(e) => setDigit(i, e.target.value)}
                maxLength={1} className="w-11 h-12 text-center text-lg bg-black border border-purple-700/40 rounded-lg text-white focus:border-purple-500 focus:outline-none" />
            ))}
          </div>
          <button data-testid="verify-otp-btn" onClick={verify} className="btn-purple w-full rounded-full py-2.5 mt-3 text-sm font-bold">Verify OTP</button>
          <button disabled={timer > 0} onClick={sendOtp} className="w-full text-xs text-zinc-400 mt-2 disabled:opacity-50">
            {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
          </button>
        </>
      )}
    </LockShell>
  );
}

/* ============ FACE ID LOCK REMOVED — 2-Lock flow (Email + SMS OTP) ============ */

function LockShell({ step, icon: Icon, title, sub, children }) {
  return (
    <div className="min-h-screen bharat-glow flex items-center justify-center p-4">
      <div className="card-purple p-6 max-w-sm w-full fadeup">
        <div className="flex items-center gap-1 mb-4">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-purple-500" : "bg-white/10"}`} />
          ))}
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-amber-400 flex items-center justify-center mx-auto mb-3">
          <Icon className="w-7 h-7 text-black" />
        </div>
        <h2 className="font-heading text-lg font-bold text-white text-center">{title}</h2>
        <p className="text-[11px] gold-text text-center mb-4">{sub}</p>
        {children}
        <p className="text-[10px] text-zinc-600 text-center mt-4 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> 2-Lock Fortified Gate · Owner {OWNER_EMAIL}
        </p>
      </div>
    </div>
  );
}

/* ============ TABS ============ */
function TabAI() {
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const mic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast.error("Voice not supported");
    const r = new SR(); r.lang = "hi-IN"; r.onresult = (e) => setMsg(e.results[0][0].transcript); r.start();
  };
  const gen = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    try { const b = await api.generateBlock(msg); setOut(b); toast.success(`Block "${b.blockName}" added to builder`); }
    catch { toast.error("Generation failed"); } finally { setBusy(false); }
  };
  return (
    <Card title="AI Command Box" icon={Bot}>
      <label className={lbl}>Bolo Your Assistant se kya add karna hai Builder me?</label>
      <textarea data-testid="tab-ai-command-input" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className={inp} placeholder="e.g. Add a countdown timer block for flash sales" />
      <div className="flex gap-2 mt-3">
        <button data-testid="tab-ai-mic" onClick={mic} className="rounded-full px-4 py-2 border border-purple-700/40 text-sm text-zinc-300 flex items-center gap-2"><Send className="w-4 h-4 rotate-90" /> Mic</button>
        <button data-testid="tab-ai-generate" onClick={gen} disabled={busy} className="btn-purple rounded-full px-5 py-2 text-sm font-bold flex items-center gap-2 disabled:opacity-50"><Bot className="w-4 h-4" /> {busy ? "Generating..." : "Generate Block"}</button>
      </div>
      {out && (
        <div className="mt-4 bg-black border border-purple-700/30 rounded-lg p-3">
          <div className="text-xs gold-text font-bold">{out.blockName} · {out.category}</div>
          <pre className="text-[10px] text-zinc-400 mt-2 overflow-x-auto font-mono">{out.blockCode}</pre>
        </div>
      )}
    </Card>
  );
}

function TabMonaco() {
  const [blocks, setBlocks] = useState([]);
  const [sel, setSel] = useState(null);
  const [code, setCode] = useState("// Select a block file");
  useEffect(() => { api.blocks().then(setBlocks); }, []);
  const open = (b) => { setSel(b); setCode(b.blockCode || `// ${b.blockName}\nexport const ${b.blockId} = () => null;`); };
  const save = async () => {
    if (!sel) return;
    await api.createBlock({ blockId: sel.blockId, blockName: sel.blockName, category: sel.category, blockCode: code });
    const latest = await api.latestUpdate();
    const parts = (latest.latestVersion || "1.0.0").split(".").map(Number); parts[2] = (parts[2] || 0) + 1;
    await api.publishUpdate({ version: parts.join("."), whatsNew: `Your Assistant updated ${sel.blockName}` });
    toast.success(`Saved & version bumped to ${parts.join(".")}`);
  };
  return (
    <Card title="Monaco Live Code Editor" icon={Code2}>
      <div className="grid grid-cols-[180px_1fr] gap-3">
        <div className="bg-black border border-purple-700/30 rounded-lg p-2 max-h-[420px] overflow-y-auto" data-testid="monaco-file-tree">
          <div className="text-[10px] text-zinc-500 mb-1">src/blocks/*</div>
          {blocks.map((b) => (
            <button key={b.blockId} onClick={() => open(b)} className={`w-full text-left text-[11px] px-2 py-1 rounded ${sel?.blockId === b.blockId ? "bg-purple-600 text-white" : "text-zinc-300 hover:bg-white/5"}`}>
              {b.blockId}.jsx
            </button>
          ))}
        </div>
        <div data-testid="superadmin-tab-monaco-editor">
          <Editor height="380px" theme="vs-dark" language="javascript" value={code} onChange={(v) => setCode(v || "")} options={{ fontSize: 12, minimap: { enabled: false } }} />
          <button data-testid="monaco-save-btn" onClick={save} className="btn-purple rounded-full px-5 py-2 text-sm font-bold mt-3 flex items-center gap-2"><Save className="w-4 h-4" /> Save + Bump Version</button>
        </div>
      </div>
    </Card>
  );
}

function TabRemote() {
  const [cfg, setCfg] = useState({});
  useEffect(() => { api.remoteConfig().then(setCfg); }, []);
  const toggle = async (k) => { const n = { ...cfg, [k]: !cfg[k] }; setCfg(n); await api.setRemoteConfig(n); toast.success(`${k} = ${n[k]}`); };
  const keys = ["trading_enabled", "gaming_enabled", "dating_enabled", "mehndi_enabled", "ride_enabled", "cloth_enabled", "grocery_enabled"];
  return (
    <Card title="Remote Config Toggles" icon={ToggleRight}>
      <div className="grid sm:grid-cols-2 gap-2">
        {keys.map((k) => (
          <button key={k} data-testid={`toggle-${k}`} onClick={() => toggle(k)} className="flex items-center justify-between bg-black border border-purple-700/30 rounded-lg px-3 py-2.5">
            <span className="text-sm text-zinc-300">{k.replace("_enabled", "").toUpperCase()}</span>
            <span className={`w-10 h-5 rounded-full relative transition-colors ${cfg[k] ? "bg-purple-600" : "bg-zinc-700"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${cfg[k] ? "left-5" : "left-0.5"}`} />
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function TabBanner() {
  const [b, setB] = useState({ text: "", imageUrl: "", link: "", bgColor: "#7c3aed", active: true });
  useEffect(() => { api.banner().then((d) => setB({ ...b, ...d })); }, []);
  const save = async () => { await api.setBanner(b); toast.success("Banner saved"); };
  return (
    <Card title="Global Banner Manager" icon={Megaphone}>
      <div className="space-y-3">
        <div><label className={lbl}>Banner Text</label><input data-testid="banner-text" value={b.text} onChange={(e) => setB({ ...b, text: e.target.value })} className={inp} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Image URL</label><input value={b.imageUrl} onChange={(e) => setB({ ...b, imageUrl: e.target.value })} className={inp} /></div>
          <div><label className={lbl}>Link</label><input value={b.link} onChange={(e) => setB({ ...b, link: e.target.value })} className={inp} /></div>
        </div>
        <div className="flex items-center gap-4">
          <div><label className={lbl}>BG Color</label><input type="color" value={b.bgColor} onChange={(e) => setB({ ...b, bgColor: e.target.value })} className="w-16 h-9 bg-black rounded" /></div>
          <label className="flex items-center gap-2 text-sm text-zinc-300 mt-4"><input type="checkbox" checked={b.active} onChange={(e) => setB({ ...b, active: e.target.checked })} className="accent-purple-600" /> Active</label>
        </div>
        <div className="rounded-lg p-3 text-center text-white text-sm" style={{ background: b.bgColor }}>{b.text || "Preview"}</div>
        <button data-testid="banner-save" onClick={save} className="btn-purple rounded-full px-5 py-2 text-sm font-bold"><Save className="w-4 h-4 inline mr-1" /> Save Banner</button>
      </div>
    </Card>
  );
}

function TabApps() {
  const [apps, setApps] = useState([]);
  const [q, setQ] = useState("");
  const load = () => api.apps().then(setApps);
  useEffect(() => { load(); }, []);
  const ban = async (id) => { await api.banApp(id); toast.success("App banned"); load(); };
  const del = async (id) => { await api.deleteApp(id); toast.success("App deleted"); load(); };
  const filtered = apps.filter((a) => (a.appName || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <Card title="User App Control" icon={Users}>
      <input data-testid="apps-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps..." className={inp + " mb-3"} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-zinc-500 text-left"><th className="py-2">App</th><th>User</th><th>Blocks</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.appId} className="border-t border-purple-900/20">
                <td className="py-2 text-white">{a.appName} {a.illegalFlagged && <span className="text-red-400">⚠️</span>}</td>
                <td className="text-zinc-400">{a.createdBy}</td>
                <td className="text-zinc-400">{(a.blocks || []).length}</td>
                <td>{a.banned ? <span className="text-red-400">Banned</span> : <span className="text-green-400">Active</span>}</td>
                <td className="flex gap-1 py-2">
                  <a href={`/preview/${a.appId}`} target="_blank" rel="noreferrer" className="p-1.5 rounded bg-white/5"><Eye className="w-3.5 h-3.5 text-zinc-300" /></a>
                  <button data-testid={`ban-app-${a.appId}`} onClick={() => ban(a.appId)} className="p-1.5 rounded bg-amber-500/20"><Ban className="w-3.5 h-3.5 text-amber-400" /></button>
                  <button onClick={() => del(a.appId)} className="p-1.5 rounded bg-red-600/20"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-xs text-zinc-500 py-4 text-center">No apps</div>}
      </div>
    </Card>
  );
}

function TabPublish() {
  const [f, setF] = useState({ version: "1.0.1", whatsNew: "Your Assistant Added New Features", apkUrl: "" });
  const [apkName, setApkName] = useState("");
  const [apkOut, setApkOut] = useState(null);
  const publish = async () => { await api.publishUpdate(f); toast.success(`Published v${f.version} + FCM push`); };
  const genConfig = async () => {
    if (!apkName.trim()) return toast.error("Enter app name");
    const c = await api.apkConfig({ appName: apkName });
    setApkOut(c);
    await api.publishUpdate({ version: f.version, whatsNew: f.whatsNew, apkUrl: f.apkUrl, appId: apkName, packageName: c.packageName });
    toast.success("APK config generated & saved");
  };
  const pwa = () => window.open(`https://www.pwabuilder.com/report?site=${safeOrigin()}`, "_blank");
  return (
    <Card title="Publish Update + APK Auto Generate" icon={Rocket}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className={lbl}>Version</label><input data-testid="publish-version" value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} className={inp} /></div>
        <div className="sm:col-span-2"><label className={lbl}>What's New</label><input data-testid="publish-whatsnew" value={f.whatsNew} onChange={(e) => setF({ ...f, whatsNew: e.target.value })} className={inp} /></div>
        <div className="sm:col-span-3"><label className={lbl}>APK URL</label><input data-testid="publish-apkurl" value={f.apkUrl} onChange={(e) => setF({ ...f, apkUrl: e.target.value })} placeholder="https://.../app.apk" className={inp} /></div>
      </div>
      <button data-testid="publish-btn" onClick={publish} className="btn-purple rounded-full px-5 py-2 text-sm font-bold mt-3 flex items-center gap-2"><Rocket className="w-4 h-4" /> Publish + FCM Push</button>

      <div className="mt-6 border-t border-purple-900/30 pt-4">
        <div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-amber-400" /><span className="font-heading font-bold text-white text-sm">📱 APK Auto Generate</span></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className={lbl}>App Name</label><input data-testid="apk-appname" value={apkName} onChange={(e) => setApkName(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Package</label><input readOnly value={apkName ? `com.bharat.${apkName.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "com.bharat.appname"} className={inp + " opacity-70"} /></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button data-testid="apk-gen-config" onClick={genConfig} className="btn-gold rounded-full px-4 py-2 text-sm font-bold">🔨 Generate APK Config</button>
          <button data-testid="apk-gen-pwa" onClick={pwa} className="rounded-full px-4 py-2 text-sm font-bold border border-purple-700/40 text-zinc-300 flex items-center gap-2"><Download className="w-4 h-4" /> 🌐 Generate PWA APK</button>
        </div>
        {apkOut && (
          <div className="mt-3 bg-black border border-purple-700/30 rounded-lg p-3">
            <div className="text-xs gold-text mb-1">Package: {apkOut.packageName}</div>
            <pre className="text-[11px] text-green-400 font-mono">{apkOut.steps.join("\n")}</pre>
          </div>
        )}
        <div className="mt-3 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3 text-xs text-amber-200">
          Play Store Pe Dalne Ke Liye:<br />1. Generate APK Config Dabao<br />2. Android Studio Me Build APK<br />3. Play Console Pe Upload
        </div>
      </div>
    </Card>
  );
}

function TabClone() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [reg, setReg] = useState([]);
  const load = () => api.buildersRegistry().then(setReg);
  useEffect(() => { load(); }, []);
  const clone = async () => {
    if (!name.trim() || !email.trim()) return toast.error("Enter builder name & owner email");
    setBusy(true);
    try {
      const r = await api.cloneBuilder(name, email);
      toast.success(`Naya Builder Ban Gaya: ${r.builderName} → ${r.superAdminUrl}`);
      setName(""); setEmail(""); load();
    } catch { toast.error("Clone failed"); } finally { setBusy(false); }
  };
  const del = async (id) => { await api.deleteBuilder(id); toast.success("Builder deleted"); load(); };
  return (
    <Card title="Clone Builder Factory" icon={Copy}>
      <div className="card-purple p-4 mb-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className={lbl}>New Builder Name</label><input data-testid="clone-name" value={name} onChange={(e) => setName(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>New Owner Email</label><input data-testid="clone-email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} /></div>
        </div>
        <button data-testid="clone-btn" onClick={clone} disabled={busy} className="btn-gold rounded-full px-5 py-2.5 text-sm font-bold mt-3 disabled:opacity-50">🚀 1-CLICK ME NAYA BUILDER BANAO + BECHO</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-zinc-500 text-left"><th className="py-2">Builder</th><th>Owner</th><th>CloneId</th><th>Status</th><th>Links</th><th></th></tr></thead>
          <tbody>
            {reg.map((r) => (
              <tr key={r.builderId} className="border-t border-purple-900/20">
                <td className="py-2 text-white">{r.builderName}</td>
                <td className="text-zinc-400">{r.ownerEmail}</td>
                <td className="text-zinc-500 font-mono">{r.builderId}</td>
                <td className="text-green-400">{r.status}</td>
                <td className="text-purple-400">{r.superAdminUrl}</td>
                <td>{r.builderId !== "main" && <button onClick={() => del(r.builderId)} className="p-1.5 rounded bg-red-600/20"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TabPayment() {
  const [c, setC] = useState({});
  const [showKey, setShowKey] = useState(false);
  const [analytics, setAnalytics] = useState({});
  useEffect(() => { api.config("payment").then(setC); api.analytics().then(setAnalytics); }, []);
  const up = (k, v) => setC((p) => ({ ...p, [k]: v }));
  const saveUpi = async () => { await api.setConfig("payment", { upiId: c.upiId }); toast.success("UPI saved — default for all apps"); };
  const saveRzp = async () => { await api.setConfig("payment", { razorpayKeyId: c.razorpayKeyId, razorpaySecret: c.razorpaySecret, razorpayEnabled: !!c.razorpayEnabled }); toast.success("Razorpay saved"); };
  const savePhonepe = async () => { await api.setConfig("payment", { phonepeMerchantId: c.phonepeMerchantId }); toast.success("PhonePe saved"); };
  const saveAdmob = async () => { await api.setConfig("payment", { adMobAppId: c.adMobAppId, bannerAdUnitId: c.bannerAdUnitId, interstitialAdUnitId: c.interstitialAdUnitId, rewardedAdUnitId: c.rewardedAdUnitId }); toast.success("AdMob saved"); };
  const testUpi = () => window.open(`upi://pay?pa=${c.upiId || OWNER_EMAIL}&am=1&cu=INR`, "_blank");
  const testRzp = () => {
    if (!window.Razorpay) return toast.error("Razorpay script not loaded");
    const rzp = new window.Razorpay({
      key: c.razorpayKeyId || "rzp_test_1DP5mmOlF5G5ag", amount: 100, currency: "INR",
      name: "Bharat App Builder", description: "Test Payment 1 Rs", theme: { color: "#7c3aed" },
      handler: () => { api.createPayment({ method: "razorpay", amount: 1, status: "success" }); toast.success("Test payment success"); },
    });
    rzp.open();
  };
  return (
    <Card title="💰 Payment Settings — Paisa Aapke Paas Kaise Ayega" icon={Wallet}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-purple p-4">
          <div className="text-sm font-bold text-white mb-1">Aapki UPI ID <span className="text-green-400 text-[10px]">(Direct Bank · 0% Commission)</span></div>
          <input data-testid="pay-upi" value={c.upiId || ""} onChange={(e) => up("upiId", e.target.value)} placeholder="Mahesh7503kumar@okicici or 98xxxxxx10@ybl" className={inp} />
          <button data-testid="save-upi" onClick={saveUpi} className="btn-purple rounded-full px-4 py-2 text-xs font-bold mt-2">Save UPI</button>
        </div>
        <div className="card-purple p-4">
          <div className="text-sm font-bold text-white mb-1">Razorpay Key ID <span className="text-amber-400 text-[10px]">(Live · 2% Commission)</span></div>
          <div className="flex gap-2">
            <input data-testid="pay-rzp-key" type={showKey ? "text" : "password"} value={c.razorpayKeyId || ""} onChange={(e) => up("razorpayKeyId", e.target.value)} className={inp} />
            <button onClick={() => setShowKey(!showKey)} className="px-3 rounded-lg border border-purple-700/40 text-xs text-zinc-300">{showKey ? "Hide" : "Show"}</button>
          </div>
          <input data-testid="pay-rzp-secret" type="password" value={c.razorpaySecret || ""} onChange={(e) => up("razorpaySecret", e.target.value)} placeholder="Secret" className={inp + " mt-2"} />
          <label className="flex items-center gap-2 text-xs text-zinc-300 mt-2"><input type="checkbox" checked={!!c.razorpayEnabled} onChange={(e) => up("razorpayEnabled", e.target.checked)} className="accent-purple-600" /> Razorpay Enabled</label>
          <button data-testid="save-rzp" onClick={saveRzp} className="btn-purple rounded-full px-4 py-2 text-xs font-bold mt-2">Save Razorpay</button>
        </div>
        <div className="card-purple p-4">
          <div className="text-sm font-bold text-white mb-1">PhonePe Merchant ID <span className="text-zinc-500 text-[10px]">(Future)</span></div>
          <input data-testid="pay-phonepe" value={c.phonepeMerchantId || ""} onChange={(e) => up("phonepeMerchantId", e.target.value)} className={inp} />
          <button data-testid="save-phonepe" onClick={savePhonepe} className="btn-purple rounded-full px-4 py-2 text-xs font-bold mt-2">Save PhonePe</button>
        </div>
        <div className="card-purple p-4">
          <div className="text-sm font-bold text-white mb-2">Test Payments</div>
          <div className="flex flex-col gap-2">
            <button data-testid="test-upi" onClick={testUpi} className="btn-gold rounded-full px-4 py-2 text-xs font-bold">Test UPI Payment 1 Rs</button>
            <button data-testid="test-rzp" onClick={testRzp} className="rounded-full px-4 py-2 text-xs font-bold border border-purple-700/40 text-zinc-300">Test Razorpay Payment 1 Rs</button>
          </div>
        </div>
        <div className="card-purple p-4 md:col-span-2 gold-border border">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-2"><Megaphone className="w-4 h-4" /> AdMob Earnings</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={lbl}>AdMob App ID</label><input data-testid="pay-admob-app" value={c.adMobAppId || ""} onChange={(e) => up("adMobAppId", e.target.value)} placeholder="ca-app-pub-xxxx" className={inp} /></div>
            <div><label className={lbl}>Banner Ad Unit ID</label><input data-testid="pay-admob-banner" value={c.bannerAdUnitId || ""} onChange={(e) => up("bannerAdUnitId", e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Interstitial Ad Unit ID</label><input data-testid="pay-admob-inter" value={c.interstitialAdUnitId || ""} onChange={(e) => up("interstitialAdUnitId", e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Rewarded Ad Unit ID</label><input value={c.rewardedAdUnitId || ""} onChange={(e) => up("rewardedAdUnitId", e.target.value)} className={inp} /></div>
          </div>
          <button data-testid="save-admob" onClick={saveAdmob} className="btn-gold rounded-full px-4 py-2 text-xs font-bold mt-3">Save AdMob</button>
        </div>
      </div>
      <div className="mt-4 bg-purple-600/10 border border-purple-700/30 rounded-lg p-3 text-xs text-zinc-300">
        Ye settings save karne ke baad saare apps me auto yehi UPI/Razorpay/AdMob default lagega — user apni UPI bhi daal sakta hai — Super Admin se aap kabhi bhi change kar sakte ho.
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Stat label="Apps" v={analytics.appsCount} /><Stat label="Users" v={analytics.usersCount} />
        <Stat label="Blocks" v={analytics.blocksCount} /><Stat label="Payments" v={analytics.paymentsCount} />
      </div>
    </Card>
  );
}

function Stat({ label, v }) {
  return <div className="card-purple p-3 text-center"><div className="text-2xl font-heading font-bold gold-text">{v ?? 0}</div><div className="text-[10px] text-zinc-500 uppercase">{label}</div></div>;
}
function Card({ title, icon: Icon, children }) {
  return (
    <div className="fadeup">
      <div className="flex items-center gap-2 mb-4"><Icon className="w-5 h-5 text-purple-400" /><h2 className="font-heading text-lg font-bold text-white">{title}</h2></div>
      {children}
    </div>
  );
}

/* ============ MAIN ============ */
const TABS = [
  { id: "A", label: "AI Command", icon: Bot, C: TabAI },
  { id: "B", label: "Monaco Editor", icon: Code2, C: TabMonaco },
  { id: "C", label: "Remote Config", icon: ToggleRight, C: TabRemote },
  { id: "D", label: "Global Banner", icon: Megaphone, C: TabBanner },
  { id: "E", label: "User Apps", icon: Users, C: TabApps },
  { id: "F", label: "Publish + APK", icon: Rocket, C: TabPublish },
  { id: "G", label: "Clone Factory", icon: Copy, C: TabClone },
  { id: "H", label: "Payment + AdMob", icon: Wallet, C: TabPayment },
];

function SuperAdminInner() {
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState("A");
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    if (step === 4) {
      api.loginSuccess().catch(() => {});
      api.analytics().then(setAnalytics).catch(() => {});
    }
  }, [step]);

  if (step === 1) return <EmailLock onPass={() => setStep(2)} />;
  if (step === 2) return <OtpLock onPass={() => setStep(4)} />;

  const Active = TABS.find((t) => t.id === tab).C;
  return (
    <div className="min-h-screen bharat-glow">
      <header className="glass sticky top-0 z-40 border-b border-purple-900/40" data-testid="superadmin-panel">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <div className="text-sm font-heading font-bold text-white">👑 Owner Verified: {OWNER_EMAIL}</div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="gold-text border gold-border rounded-full px-3 py-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Email ✅ Mobile ✅ · 2-Lock Passed</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-2">
        {[["Apps", analytics.appsCount], ["Users", analytics.usersCount], ["Blocks", analytics.blocksCount], ["Builders", analytics.buildersRegistryCount], ["Payments", analytics.paymentsCount], ["Illegal", analytics.illegalFlagged]].map(([l, v]) => (
          <div key={l} className="card-purple p-3 text-center"><div className="text-xl font-heading font-bold gold-text">{v ?? 0}</div><div className="text-[10px] text-zinc-500 uppercase">{l}</div></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} data-testid={`superadmin-tab-${t.id}`} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${tab === t.id ? "btn-purple" : "bg-white/5 text-zinc-300 border border-purple-700/20"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.id}. {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="card-purple p-5"><Active /></div>
      </div>
    </div>
  );
}


export default function SuperAdmin() {
  return (
    <ErrorBoundary>
      <SuperAdminInner />
    </ErrorBoundary>
  );
}
