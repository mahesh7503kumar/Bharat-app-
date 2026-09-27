import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { BLOCK_META, renderBlock } from "../blocks/index.jsx";
import { api, OWNER_EMAIL } from "../lib/api";
import { LegalFooter } from "./LegalShield";

export default function BuilderCanvas({ agreed, config }) {
  const [placed, setPlaced] = useState(["header", "banner", "product_grid"]);
  const [selected, setSelected] = useState(0);
  const [appName, setAppName] = useState("My Bharat App");

  const add = (id) => setPlaced((p) => [...p, id]);
  const remove = (i) => setPlaced((p) => p.filter((_, idx) => idx !== i));
  const move = (i, dir) =>
    setPlaced((p) => {
      const n = [...p];
      const j = i + dir;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const onDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("blockId");
    if (id) add(id);
  };

  const save = async () => {
    if (!agreed) return toast.error("Accept the Legal Shield first");
    if (!placed.length) return toast.error("Add at least one block");
    const res = await api.createApp({ appName, blocks: placed, createdBy: OWNER_EMAIL });
    toast.success(`App saved! Preview at /preview/${res.appId}`);
  };

  const groups = Object.entries(BLOCK_META).reduce((acc, [id, m]) => {
    (acc[m.cat] = acc[m.cat] || []).push({ id, ...m });
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4">
      {/* Left: palette */}
      <div className="card-purple p-3 max-h-[640px] overflow-y-auto" data-testid="block-palette">
        <div className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wide">Block Palette</div>
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat} className="mb-3">
            <div className="text-[10px] text-zinc-500 uppercase mb-1">{cat}</div>
            <div className="space-y-1">
              {items.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.id}
                    data-testid={`block-palette-item-${b.id}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("blockId", b.id)}
                    onClick={() => add(b.id)}
                    className="w-full flex items-center gap-2 text-left text-[11px] text-zinc-300 bg-black hover:bg-purple-900/30 border border-purple-700/20 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{b.name}</span>
                    <Plus className="w-3 h-3 ml-auto text-zinc-500" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Center: phone frame */}
      <div className="flex flex-col items-center">
        <input
          data-testid="builder-app-name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="mb-3 bg-black border border-purple-700/40 rounded-lg px-3 py-1.5 text-sm text-white text-center"
        />
        <div
          data-testid="builder-canvas-phone-frame"
          className="phone-frame overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="h-6 bg-black flex items-center justify-center">
            <div className="w-16 h-3 bg-elevated rounded-full" style={{ background: "#1a1a22" }} />
          </div>
          <div className="h-[520px] overflow-y-auto bg-[#060608]">
            {placed.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs gap-2">
                <Smartphone className="w-8 h-8" /> Drag or click blocks to add
              </div>
            )}
            {placed.map((id, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                className={`relative group border-b border-white/5 ${selected === i ? "ring-1 ring-purple-500" : ""}`}
              >
                {renderBlock(id, config)}
                <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} className="w-5 h-5 rounded bg-black/80 flex items-center justify-center"><ArrowUp className="w-3 h-3 text-white" /></button>
                  <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} className="w-5 h-5 rounded bg-black/80 flex items-center justify-center"><ArrowDown className="w-3 h-3 text-white" /></button>
                  <button data-testid={`remove-block-${i}`} onClick={(e) => { e.stopPropagation(); remove(i); }} className="w-5 h-5 rounded bg-red-600 flex items-center justify-center"><Trash2 className="w-3 h-3 text-white" /></button>
                </div>
              </div>
            ))}
            <LegalFooter />
          </div>
        </div>
        <button data-testid="builder-save-app" onClick={save} className="mt-4 btn-purple rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2">
          <Save className="w-4 h-4" /> Save & Preview App
        </button>
      </div>

      {/* Right: inspector */}
      <div className="card-purple p-3" data-testid="block-inspector">
        <div className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wide">Block Inspector</div>
        {placed[selected] ? (
          <div className="space-y-2 text-xs text-zinc-300">
            <div>
              <div className="text-[10px] text-zinc-500">Selected Block</div>
              <div className="text-white font-semibold">{BLOCK_META[placed[selected]]?.name}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500">Category</div>
              <div>{BLOCK_META[placed[selected]]?.cat}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500">Position</div>
              <div>{selected + 1} of {placed.length}</div>
            </div>
            <div className="pt-2 border-t border-purple-900/30 text-[10px] text-zinc-500">
              Props update live on the phone frame. Payment blocks auto-use global UPI/Razorpay/AdMob settings.
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-zinc-500">Select a block to edit</div>
        )}
      </div>
    </div>
  );
}
