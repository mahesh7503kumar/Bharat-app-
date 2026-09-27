import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api, OWNER_EMAIL, ASSISTANT_NAME } from "../lib/api";

export default function Privacy() {
  const { appId } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { api.getPrivacy ? null : null; }, []);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/privacy/${appId}`).then((r) => r.json()).then(setData).catch(() => {});
  }, [appId]);

  return (
    <div className="min-h-screen bharat-glow px-4 py-10">
      <div className="max-w-2xl mx-auto card-purple p-6">
        <Link to="/" className="text-xs text-zinc-400 hover:text-white">← Back</Link>
        <h1 className="font-heading text-2xl font-bold text-white mt-3">Privacy Policy</h1>
        <p className="text-xs text-zinc-500 mb-4">App ID: {appId}</p>
        <div className="space-y-3 text-sm text-zinc-300">
          <p>{data?.content || "For Entertainment Only | Virtual Coins Only | No Real Money"}</p>
          <p>This application is built with Bharat App Builder ({ASSISTANT_NAME}) and is intended for
          entertainment and learning purposes only. All coins, points and gameplay are virtual and
          hold no monetary value. No real-money gambling or betting is offered.</p>
          <p>Owner &amp; Data Controller: <b className="text-amber-400">{OWNER_EMAIL}</b></p>
        </div>
      </div>
    </div>
  );
}
