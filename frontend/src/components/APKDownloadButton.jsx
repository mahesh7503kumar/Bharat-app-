import React, { useState, useEffect } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

export default function APKDownloadButton({ appId }) {
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    api.latestUpdate().then(setUpdate).catch(() => {});
  }, []);

  const handle = async () => {
    const latest = await api.latestUpdate().catch(() => null);
    if (latest && latest.apkUrl) {
      toast.success("Opening APK download (Play Store Ready)");
      window.open(latest.apkUrl, "_blank");
    } else {
      const url = `https://www.pwabuilder.com/report?site=${window.location.origin}/preview/${appId}`;
      toast.message("Opening PWABuilder to generate APK");
      window.open(url, "_blank");
    }
  };

  return (
    <button
      data-testid="apk-download-button"
      onClick={handle}
      className="btn-gold rounded-full px-5 py-2.5 text-sm font-bold flex items-center gap-2 shadow-lg"
    >
      <Download className="w-4 h-4" /> 📥 Download APK (Play Store Ready)
    </button>
  );
}
