import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  LayoutTemplate, Image as ImageIcon, ShoppingBag, ShoppingCart, MessageCircle,
  Star, Video, Images, Flower2, TrendingUp, Dice5, Heart, Car, Apple,
  Shirt, IndianRupee, CreditCard, Smartphone, Wallet, Megaphone, MonitorPlay, Gift,
} from "lucide-react";

export const BLOCK_META = {
  header: { name: "Header", icon: LayoutTemplate, cat: "layout" },
  banner: { name: "Banner", icon: ImageIcon, cat: "layout" },
  product_grid: { name: "Product Grid", icon: ShoppingBag, cat: "commerce" },
  cart: { name: "Cart", icon: ShoppingCart, cat: "commerce" },
  whatsapp: { name: "WhatsApp", icon: MessageCircle, cat: "social" },
  review: { name: "Reviews", icon: Star, cat: "social" },
  video: { name: "Video", icon: Video, cat: "media" },
  image_gallery: { name: "Gallery", icon: Images, cat: "media" },
  mehndi: { name: "Mehndi Designs", icon: Flower2, cat: "lifestyle" },
  trading_signal: { name: "Trading (Virtual)", icon: TrendingUp, cat: "virtual" },
  ludo: { name: "Ludo (Virtual)", icon: Dice5, cat: "virtual" },
  dating_profile: { name: "Dating Profiles", icon: Heart, cat: "social" },
  ride_booking: { name: "Ride Booking", icon: Car, cat: "services" },
  grocery: { name: "Grocery", icon: Apple, cat: "commerce" },
  cloth_store: { name: "Cloth Store", icon: Shirt, cat: "commerce" },
  upi_payment: { name: "UPI Payment", icon: IndianRupee, cat: "payment" },
  razorpay: { name: "Razorpay", icon: CreditCard, cat: "payment" },
  phonepe: { name: "PhonePe", icon: Smartphone, cat: "payment" },
  payment_selector: { name: "Payment Selector", icon: Wallet, cat: "payment" },
  admob_banner: { name: "AdMob Banner", icon: Megaphone, cat: "monetization" },
  admob_interstitial: { name: "AdMob Interstitial", icon: MonitorPlay, cat: "monetization" },
  admob_rewarded: { name: "AdMob Rewarded", icon: Gift, cat: "monetization" },
};

const Sec = ({ children, className = "" }) => (
  <div className={`p-3 ${className}`}>{children}</div>
);

const VirtualTag = () => (
  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
    VIRTUAL ONLY
  </span>
);

function AdMobBox({ label }) {
  return (
    <Sec>
      <div className="rounded-lg border-2 border-amber-400/50 bg-black p-4 text-center">
        <Megaphone className="w-5 h-5 mx-auto text-amber-400 mb-1" />
        <div className="text-amber-300 text-xs font-bold">📢 AdMob {label} Ad</div>
        <div className="text-[10px] text-zinc-400 mt-1">Your Ad Will Show Here</div>
        <button className="mt-2 text-[10px] btn-gold rounded-full px-3 py-1">Test Ad</button>
      </div>
    </Sec>
  );
}

function UpiPreview({ config }) {
  const upi = config?.upiId || "Mahesh7503kumar@okicici";
  const url = `upi://pay?pa=${upi}&am=1&cu=INR`;
  return (
    <Sec>
      <div className="rounded-lg bg-elevated border border-purple-700/30 p-3 text-center" style={{ background: "#1a1a22" }}>
        <div className="text-xs text-zinc-300 mb-2">Pay via UPI</div>
        <div className="bg-white p-2 rounded-lg inline-block"><QRCodeCanvas value={url} size={90} /></div>
        <div className="text-[10px] text-zinc-400 mt-2 font-mono">{upi}</div>
        <button className="mt-2 text-xs btn-purple rounded-full px-4 py-1.5 w-full">Pay Now</button>
      </div>
    </Sec>
  );
}

export function renderBlock(blockId, config = {}) {
  switch (blockId) {
    case "header":
      return (
        <div className="bg-gradient-to-r from-purple-700 to-purple-500 p-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm font-heading">My Bharat App</span>
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
      );
    case "banner":
      return (
        <Sec>
          <div className="rounded-lg h-20 bg-gradient-to-r from-amber-400 to-purple-500 flex items-center justify-center text-black font-bold text-sm">
            🎉 Mega Sale 50% Off
          </div>
        </Sec>
      );
    case "product_grid":
      return (
        <Sec>
          <div className="grid grid-cols-2 gap-2">
            {["₹499", "₹799", "₹299", "₹999"].map((p, i) => (
              <div key={i} className="rounded-lg bg-elevated border border-purple-700/20 p-2" style={{ background: "#1a1a22" }}>
                <div className="h-12 rounded bg-purple-900/40 mb-1" />
                <div className="text-[10px] text-zinc-300">Product {i + 1}</div>
                <div className="text-xs text-amber-400 font-bold">{p}</div>
              </div>
            ))}
          </div>
        </Sec>
      );
    case "cart":
      return (
        <Sec>
          <div className="rounded-lg border border-purple-700/30 p-3" style={{ background: "#1a1a22" }}>
            <div className="flex justify-between text-xs text-zinc-300"><span>2 items</span><span className="text-amber-400 font-bold">₹1298</span></div>
            <button className="mt-2 w-full btn-purple rounded-full text-xs py-1.5">Checkout</button>
          </div>
        </Sec>
      );
    case "whatsapp":
      return (
        <Sec>
          <button className="w-full bg-green-600 text-white rounded-full text-xs py-2 flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
          </button>
        </Sec>
      );
    case "review":
      return (
        <Sec>
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
            <span className="text-[10px] text-zinc-400 ml-1">4.8 (2.3k reviews)</span>
          </div>
        </Sec>
      );
    case "video":
      return (
        <Sec>
          <div className="rounded-lg h-24 bg-black border border-purple-700/30 flex items-center justify-center">
            <Video className="w-8 h-8 text-purple-400" />
          </div>
        </Sec>
      );
    case "image_gallery":
      return (
        <Sec>
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 rounded bg-purple-900/40" />)}
          </div>
        </Sec>
      );
    case "mehndi":
      return (
        <Sec>
          <div className="rounded-lg border border-amber-400/30 p-3 text-center" style={{ background: "#1a1a22" }}>
            <Flower2 className="w-6 h-6 mx-auto text-amber-400" />
            <div className="text-xs text-zinc-300 mt-1">Mehndi Design Studio</div>
            <div className="grid grid-cols-3 gap-1 mt-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded bg-amber-900/30" />)}</div>
          </div>
        </Sec>
      );
    case "trading_signal":
      return (
        <Sec>
          <div className="rounded-lg border border-purple-700/30 p-3" style={{ background: "#1a1a22" }}>
            <div className="flex justify-between items-center"><span className="text-xs text-zinc-300">Trading Signals</span><VirtualTag /></div>
            <div className="mt-2 flex justify-between text-[11px]"><span className="text-green-400">▲ NIFTY BUY</span><span className="text-zinc-400">Virtual ₹</span></div>
          </div>
        </Sec>
      );
    case "ludo":
      return (
        <Sec>
          <div className="rounded-lg border border-purple-700/30 p-3 text-center" style={{ background: "#1a1a22" }}>
            <div className="flex items-center justify-center gap-2"><Dice5 className="w-5 h-5 text-purple-400" /><span className="text-xs text-zinc-300">Ludo Tournament</span></div>
            <div className="mt-1"><VirtualTag /></div>
            <button className="mt-2 btn-gold rounded-full text-[11px] px-4 py-1">Play (Virtual Coins)</button>
          </div>
        </Sec>
      );
    case "dating_profile":
      return (
        <Sec>
          <div className="rounded-lg border border-pink-500/30 p-3 flex items-center gap-2" style={{ background: "#1a1a22" }}>
            <div className="w-10 h-10 rounded-full bg-pink-500/30" />
            <div><div className="text-xs text-white">Priya, 24</div><div className="text-[10px] text-zinc-400">Mumbai</div></div>
            <Heart className="w-5 h-5 text-pink-400 ml-auto" />
          </div>
        </Sec>
      );
    case "ride_booking":
      return (
        <Sec>
          <div className="rounded-lg border border-purple-700/30 p-3" style={{ background: "#1a1a22" }}>
            <div className="flex items-center gap-2 text-xs text-zinc-300"><Car className="w-4 h-4 text-purple-400" /> Book a Ride</div>
            <input placeholder="Pickup location" className="mt-2 w-full text-[11px] bg-black rounded px-2 py-1.5 text-zinc-300 border border-purple-700/30" readOnly />
            <button className="mt-2 w-full btn-purple rounded-full text-[11px] py-1.5">Find Ride</button>
          </div>
        </Sec>
      );
    case "grocery":
      return (
        <Sec>
          <div className="grid grid-cols-3 gap-2">
            {["🥦", "🍎", "🥛"].map((e, i) => (
              <div key={i} className="rounded-lg bg-elevated border border-purple-700/20 p-2 text-center" style={{ background: "#1a1a22" }}>
                <div className="text-lg">{e}</div><div className="text-[9px] text-amber-400">₹{(i + 1) * 40}</div>
              </div>
            ))}
          </div>
        </Sec>
      );
    case "cloth_store":
      return (
        <Sec>
          <div className="flex gap-2 overflow-hidden">
            {["👗", "👔", "🥻"].map((e, i) => (
              <div key={i} className="rounded-lg bg-elevated border border-purple-700/20 p-3 text-center flex-1" style={{ background: "#1a1a22" }}>
                <div className="text-xl">{e}</div><div className="text-[9px] text-amber-400 mt-1">₹{999 + i * 500}</div>
              </div>
            ))}
          </div>
        </Sec>
      );
    case "upi_payment":
      return <UpiPreview config={config} />;
    case "razorpay":
      return (
        <Sec>
          <button className="w-full rounded-lg text-white text-xs py-2.5 font-semibold" style={{ background: "#7c3aed" }}>
            Pay with Razorpay
          </button>
          <div className="text-[9px] text-zinc-500 text-center mt-1">Secured Gateway • Bharat App Builder</div>
        </Sec>
      );
    case "phonepe":
      return (
        <Sec>
          <button className="w-full rounded-lg text-white text-xs py-2.5 font-semibold flex items-center justify-center gap-2" style={{ background: "#5f259f" }}>
            <Smartphone className="w-4 h-4" /> Pay with PhonePe
          </button>
        </Sec>
      );
    case "payment_selector":
      return (
        <Sec>
          <div className="rounded-lg border border-purple-700/30 p-2 space-y-1.5" style={{ background: "#1a1a22" }}>
            {["UPI", "Razorpay", "PhonePe"].map((m) => (
              <div key={m} className="flex items-center gap-2 text-[11px] text-zinc-300 bg-black rounded px-2 py-1.5 border border-purple-700/20">
                <div className="w-3 h-3 rounded-full border border-purple-500" /> {m}
              </div>
            ))}
          </div>
        </Sec>
      );
    case "admob_banner":
      return <AdMobBox label="Banner" />;
    case "admob_interstitial":
      return <AdMobBox label="Interstitial" />;
    case "admob_rewarded":
      return <AdMobBox label="Rewarded" />;
    default:
      return <Sec><div className="text-[11px] text-zinc-500">Unknown block: {blockId}</div></Sec>;
  }
}

export function BlockPreviewList({ blocks, config }) {
  return (
    <div>
      {(blocks || []).map((b, i) => (
        <div key={i}>{renderBlock(typeof b === "string" ? b : b.blockId, config)}</div>
      ))}
    </div>
  );
}
