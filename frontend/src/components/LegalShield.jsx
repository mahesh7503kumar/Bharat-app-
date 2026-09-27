import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { OWNER_EMAIL, ASSISTANT_NAME, api } from "../lib/api";

const ILLEGAL = ["cash", "gambling", "betting", "real money", "teen patti", "satta", "casino"];

export function detectIllegal(text) {
  const low = (text || "").toLowerCase();
  return ILLEGAL.filter((k) => low.includes(k));
}

export function LegalFooter() {
  return (
    <div
      data-testid="legal-footer"
      className="text-center text-[10px] sm:text-xs text-zinc-500 py-3 px-4 border-t border-purple-900/30"
    >
      For Entertainment Only | Virtual Coins Only | No Real Money | Owner {OWNER_EMAIL} | {ASSISTANT_NAME}
    </div>
  );
}

export function IllegalBanner({ show }) {
  if (!show) return null;
  return (
    <div
      data-testid="illegal-banner"
      className="bg-red-600 text-white text-center text-xs font-bold py-2 px-3 flex items-center justify-center gap-2"
    >
      <AlertTriangle className="w-4 h-4" /> ILLEGAL DETECTED — FORCED VIRTUAL MODE (virtualOnly = true)
    </div>
  );
}

export default function LegalShield({ agreed, setAgreed, keyword = "" }) {
  const illegal = detectIllegal(keyword);

  useEffect(() => {
    if (illegal.length) {
      api.addLog({ event: "illegal_keyword", status: "forced_virtual", email: OWNER_EMAIL, detail: illegal.join(",") }).catch(() => {});
    }
  }, [keyword]);

  return (
    <div className="card-purple p-4" data-testid="legal-shield">
      <IllegalBanner show={illegal.length > 0} />
      <div className="flex items-start gap-3 mt-2">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            data-testid="legal-shield-consent-checkbox"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-purple-600 w-4 h-4"
          />
          <span className="text-xs text-zinc-300 leading-relaxed">
            I Agree — <b className="text-white">No Real Money Gambling / Betting</b>. This is
            for <b className="text-amber-400">Entertainment &amp; Learning Only</b> using{" "}
            <b className="text-amber-400">Virtual Coins</b>.
          </span>
        </label>
      </div>
      {illegal.length > 0 && (
        <p className="text-[10px] text-red-400 mt-2">
          Detected: {illegal.join(", ")} — app forced into virtual-only mode.
        </p>
      )}
    </div>
  );
}
