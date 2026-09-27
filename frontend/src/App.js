import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Download, X } from "lucide-react";
import { api, APP_VERSION, ASSISTANT_NAME } from "@/lib/api";
import Home from "@/pages/Home";
import Preview from "@/pages/Preview";
import Privacy from "@/pages/Privacy";
import SuperAdmin from "@/pages/SuperAdmin";

function semverGt(a, b) {
  const pa = String(a || "0").split(".").map((n) => parseInt(n, 10) || 0);
  const pb = String(b || "0").split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return false;
}

function UpdateModal() {
  const [update, setUpdate] = useState(null);
  const [show, setShow] = useState(false);
  const location = useLocation();

  const blockedRoute = location.pathname.startsWith("/superadmin") || location.pathname.startsWith("/preview");

  useEffect(() => {
    if (blockedRoute) return;
    api.latestUpdate().then((u) => {
      if (!u || !u.latestVersion) return;
      const newer = semverGt(u.latestVersion, APP_VERSION);
      const dismissed = localStorage.getItem("update-dismissed:" + u.latestVersion);
      if (newer && !dismissed) {
        setUpdate(u);
        setShow(true);
      }
    }).catch(() => {});
  }, [blockedRoute]);

  const dismiss = () => {
    if (update) localStorage.setItem("update-dismissed:" + update.latestVersion, "1");
    setShow(false);
  };

  if (!show || !update || blockedRoute) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="card-purple p-6 max-w-sm w-full fadeup" data-testid="update-modal">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-white">Update from {ASSISTANT_NAME}</h3>
          <button onClick={dismiss}><X className="w-4 h-4 text-zinc-400" /></button>
        </div>
        <p className="text-xs text-zinc-400 mb-1">v{update.latestVersion} available (you have v{APP_VERSION})</p>
        <p className="text-sm text-zinc-300 mb-4">{update.whatsNew}</p>
        <div className="flex gap-2">
          <button
            data-testid="update-now-btn"
            onClick={() => update.apkUrl && window.open(update.apkUrl, "_blank")}
            className="flex-1 btn-purple rounded-full py-2 text-sm font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Update Now
          </button>
          <button onClick={dismiss} className="px-4 rounded-full border border-purple-700/40 text-sm text-zinc-300">Later</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-center" theme="dark" richColors />
        <UpdateModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/preview/:appId" element={<Preview />} />
          <Route path="/privacy/:appId" element={<Privacy />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
