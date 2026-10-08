import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, ListChecks } from "lucide-react";
import { api, ASSISTANT_NAME } from "../lib/api";
import { renderBlock } from "../blocks/index.jsx";
import { LegalFooter, IllegalBanner } from "../components/LegalShield";
import APKDownloadButton from "../components/APKDownloadButton";

export default function Preview() {
  const { appId } = useParams();
  const [app, setApp] = useState(null);
  const [payConfig, setPayConfig] = useState({});
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.app(appId).then(setApp).catch(() => setErr(true));
    api.config("payment").then(setPayConfig).catch(() => {});
  }, [appId]);

  if (err) return <div className="min-h-screen bharat-glow flex items-center justify-center text-zinc-400">App not found</div>;
  if (!app) return <div className="min-h-screen bharat-glow flex items-center justify-center text-zinc-400">Loading preview...</div>;

  return (
    <div className="min-h-screen bharat-glow pb-28">
      <header className="glass sticky top-0 z-40 border-b border-purple-900/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="font-heading font-bold text-white text-sm">{ASSISTANT_NAME} · Preview</div>
          <span className="flex items-center gap-1 text-[10px] gold-text border gold-border rounded-full px-2 py-1">
            <ShieldCheck className="w-3 h-3" /> VIRTUAL ONLY
          </span>
        </div>
      </header>

      <IllegalBanner show={app.illegalFlagged} />

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* Phone */}
        <div className="flex flex-col items-center">
          <h1 className="font-heading text-xl font-bold text-white mb-1">{app.appName}</h1>
          <div className="text-[10px] text-zinc-500 mb-3">by {app.createdBy}</div>
          <div className="phone-frame overflow-hidden" data-testid="preview-phone">
            <div className="h-6 bg-black flex items-center justify-center">
              <div className="w-16 h-3 rounded-full" style={{ background: "#1a1a22" }} />
            </div>
            <div className="h-[540px] overflow-y-auto bg-[#060608]">
              {(app.blocks || []).map((b, i) => (
                <div key={i}>{renderBlock(typeof b === "string" ? b : b.blockId, payConfig)}</div>
              ))}
              <LegalFooter />
            </div>
          </div>
        </div>

        {/* Publish checklist */}
        <div className="space-y-4">
          <div className="card-purple p-5" data-testid="publish-checklist">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-5 h-5 text-amber-400" />
              <div className="font-heading font-bold text-white">Publish Checklist (Play Store Ready)</div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              {[
                "App blocks configured & preview verified",
                "Legal Shield accepted · Virtual coins only",
                "Payment settings (UPI/Razorpay) from Super Admin",
                "AdMob monetization units set (Owner earnings)",
                "Generate APK via Capacitor or PWABuilder",
                "Upload to Google Play Console",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center mt-0.5">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-purple p-5 text-sm text-zinc-300">
            <div className="font-heading font-bold text-white mb-2">App Details</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-zinc-500">App ID:</span> {app.appId}</div>
              <div><span className="text-zinc-500">Blocks:</span> {(app.blocks || []).length}</div>
              <div><span className="text-zinc-500">Mode:</span> <span className="gold-text">Virtual Only</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom APK */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-purple-900/40 py-3 px-4 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs text-zinc-400 hidden sm:block">Export this app as an installable APK</span>
          <APKDownloadButton appId={app.appId} />
        </div>
      </div>
    </div>
  );
}
