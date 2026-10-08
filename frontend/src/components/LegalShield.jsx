import React from "react";
import { AlertTriangle } from "lucide-react";

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
      For Entertainment Only | Virtual Coins Only | No Real Money
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

export default function LegalShield({ onAgree, keyword = "" }) {
  const illegal = detectIllegal(keyword);

  return (
    <div className="card-purple p-3" data-testid="legal-shield">
      <IllegalBanner show={illegal.length > 0} />
      <p className="text-xs text-zinc-400">
        User is responsible for app content. Please keep projects legal and safe.
      </p>
      {illegal.length > 0 && (
        <p className="mt-2 text-[10px] text-amber-400">
          Warning: {illegal.join(", ")} — review this content before continuing.
        </p>
      )}
      {onAgree && (
        <button type="button" onClick={onAgree} className="mt-3 rounded bg-purple-600 px-4 py-2 text-xs font-bold text-white">
          Continue
        </button>
      )}
    </div>
  );
}
