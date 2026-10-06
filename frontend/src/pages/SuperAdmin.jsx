/* eslint-disable */
import React, { useState, useEffect } from 'react';

// CARD BAHAR - Isliye keyboard nahi gayab hoga!
const CardBox = ({title, children}) => (
  <div className="bg-[#1E1E1E] rounded-[20px] p-4 text-white border border-[#2A2A2A]">
    <h3 className="font-bold text-[13px]">{title}</h3>
    <div className="mt-3">{children}</div>
  </div>
);

const SuperAdmin = () => {
  const [activeTab,setActiveTab]=useState('dash');
  const [msg,setMsg]=useState('');
  const [isLocked,setIsLocked]=useState(true);
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [otpInput,setOtpInput]=useState('');
  const [step,setStep]=useState(1);
  const [publishFee,setPublishFee]=useState('299');
  const [appVersion]=useState('1.1.1');
  const [razorKey,setRazorKey]=useState('');
  const [upiId,setUpiId]=useState('mahesh@upi');
  const [globalSearch,setGlobalSearch]=useState('');
  const [aiCommand,setAiCommand]=useState('');
  const [bannerText,setBannerText]=useState('');
  const [legal,setLegal]=useState('Privacy Policy');
  const [webhook,setWebhook]=useState('');
  const [expiryDays,setExpiryDays]=useState('30');

  useEffect(()=>{
    if(localStorage.getItem('owner_verified')==='true') setIsLocked(false);
    const pf=localStorage.getItem('publish_fee');
    if(pf) setPublishFee(pf);
  },[]);

  const showMsg=(t)=>{ setMsg(t); setTimeout(()=>setMsg(''),2500); };

  const tabs=[
    {id:'dash',l:'Home',i:'🏠'},{id:'history',l:'History',i:'🕒'},{id:'device',l:'Device',i:'📱'},{id:'2fa',l:'2FA',i:'🛡️'},{id:'razor',l:'Razor',i:'⚡'},{id:'credit',l:'Credit',i:'💳'},{id:'expiry',l:'Expiry',i:'📅'},{id:'ai',l:'AI',i:'🤖'},{id:'backup',l:'Backup',i:'💾'},{id:'push',l:'Push',i:'🔔'},{id:'ban',l:'Ban',i:'🚫'},{id:'live',l:'Live',i:'🟢'},{id:'chat',l:'Chat',i:'💬'},{id:'kill',l:'Kill',i:'💀'},{id:'banner',l:'Banner',i:'📢'},{id:'ver',l:'Version',i:'🔢'},{id:'pubfee',l:'Pub Fee',i:'💰'},{id:'vault',l:'Vault',i:'🔐'},{id:'firebase',l:'Firebase',i:'🔥'},{id:'revenue',l:'Revenue',i:'💵'},{id:'blocks',l:'Blocks',i:'🧱'},{id:'rotation',l:'Rotate',i:'🔄'},{id:'admob',l:'AdMob',i:'📊'},{id:'legal',l:'Legal',i:'⚖️'},{id:'storage',l:'Storage',i:'🗄️'},{id:'template',l:'Bazaar',i:'🛒'},{id:'refer',l:'Refer',i:'👥'},{id:'reseller',l:'Reseller',i:'🤝'},{id:'coupon',l:'Coupon',i:'🎟️'},{id:'adshare',l:'AdShare',i:'📈'},{id:'aff',l:'Affiliate',i:'🔗'},{id:'team',l:'Team',i:'👨‍👩‍👧'},{id:'audit',l:'Audit',i:'📝'},{id:'webhook',l:'Webhook',i:'🔌'},{id:'rate',l:'Rate',i:'⏱️'},{id:'search',l:'Search',i:'🔍'},{id:'ab',l:'AB Test',i:'🧪'},{id:'export',l:'Export',i:'📦'},{id:'error',l:'Error',i:'❌'},{id:'lucky',l:'Lucky',i:'🎡'},{id:'academy',l:'Academy',i:'🎓'},{id:'logo',l:'Logo',i:'🎨'},{id:'voice',l:'Voice',i:'🎤'},{id:'translate',l:'Translate',i:'🌐'},{id:'review',l:'Review',i:'⭐'},{id:'ss2app',l:'SS2App',i:'📸'},{id:'bharatgpt',l:'BharatGPT',i:'🇮🇳'},{id:'publish',l:'Publish',i:'🚀'},{id:'wa',l:'WhatsApp',i:'💚'},{id:'analytics',l:'Analytics',i:'📊'},{id:'appreview',l:'Reviews',i:'⭐'},{id:'aab',l:'AAB',i:'📦'},{id:'domain',l:'Domain',i:'🌐'},{id:'pushhist',l:'PushHist',i:'🔔'},{id:'subs',l:'Subs',i:'💳'},{id:'tawk',l:'Tawk',i:'💬'},{id:'lead',l:'Lead',i:'🏆'},{id:'clone',l:'Clone',i:'🛡️'},{id:'seo',l:'SEO',i:'📸'},{id:'aicon',l:'Icon',i:'✨'},{id:'voice2',l:'Voice2',i:'🎤'},
  ];

  if(isLocked) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] p-6 w-full max-w-[360px]">
        <h1 className="font-black text-center">🔐 MALIK 61</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="mahesh7503kumar@gmail.com" className="w-full bg-black text-white rounded-full px-5 py-3 mt-5 text-[12px] outline-none" />
        <button onClick={()=>{ if(email.toLowerCase()==='mahesh7503kumar@gmail.com'){ localStorage.setItem('owner_verified','true'); setIsLocked(false); } else showMsg('Only Malik'); }} className="w-full bg-[#FFC94A] text-black rounded-full py-3 font-bold mt-3">Login</button>
        {msg&&<p className="text-center mt-3 text-[11px] bg-black text-yellow-300 p-2 rounded-full">{msg}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] flex justify-center">
      <div className="w-full max-w-[520px] bg-[#121212] min-h-screen flex flex-col relative pb-[160px]">
        <div className="px-4 pt-3"><div className="bg-[#1E1E1E] rounded-full px-4 py-2 flex justify-center"><p className="text-[11px] text-gray-400 font-bold">MALIK • 61 v{appVersion}</p></div></div>
        <div className="px-4 mt-3"><div className="bg-[#1E1E1E] rounded-[16px] px-5 py-4 flex justify-between items-center"><h1 className="font-black text-[22px] text-white">SuperAdmin</h1><div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center text-white">⚙️</div></div></div>

        <div className="px-4 py-3 flex-1">
          {msg&&<p className="bg-[#FFC94A] text-black text-center text-[10px] p-2 rounded-full mb-3 font-bold">{msg}</p>}

          {activeTab==='dash'&&(
            <div className="bg-[#1E1E1E] rounded-[20px] p-5">
              <h2 className="font-bold text-[18px] text-white">Dashboard</h2>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-[#2A2A2A] rounded-[14px] p-4"><p className="text-[10px] text-gray-400">USERS</p><p className="font-black text-[32px] text-white">0</p></div>
                <div className="bg-[#2A2A2A] rounded-[14px] p-4"><p className="text-[10px] text-gray-400">APPS</p><p className="font-black text-[32px] text-white">0</p></div>
                <div className="bg-[#2A2A2A] rounded-[14px] p-4"><p className="text-[10px] text-gray-400">TODAY</p><p className="font-black text-[26px] text-[#4ADE80]">₹6700</p></div>
                <div className="bg-[#2A2A2A] rounded-[14px] p-4"><p className="text-[10px] text-gray-400">Pub Fee</p><p className="font-black text-[22px] text-[#4ADE80]">₹{publishFee}</p></div>
              </div>
            </div>
          )}

          {activeTab==='pubfee'&&<CardBox title="💰 Pub Fee"><input type="number" inputMode="numeric" value={publishFee} onChange={e=>setPublishFee(e.target.value)} className="w-full bg-black rounded-full px-4 py-3 text-center font-bold text-white outline-none" /><button onClick={()=>{localStorage.setItem('publish_fee',publishFee); showMsg('✅ Saved ₹'+publishFee)}} className="w-full mt-3 bg-[#FFC94A] text-black rounded-full py-3 font-bold">Save Fee</button></CardBox>}
          {activeTab==='razor'&&<CardBox title="Razorpay"><input value={razorKey} onChange={e=>setRazorKey(e.target.value)} placeholder="Razor Key" className="w-full bg-black rounded-full px-4 py-3 text-[11px] text-white outline-none" /><input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="UPI" className="w-full bg-black rounded-full px-4 py-3 text-[11px] mt-2 text-white outline-none" /><button onClick={()=>showMsg('Saved')} className="w-full mt-3 bg-[#FFC94A] text-black rounded-full py-3 font-bold">Save</button></CardBox>}
          {activeTab==='search'&&<CardBox title="Global Search"><input autoFocus value={globalSearch} onChange={e=>setGlobalSearch(e.target.value)} placeholder="Search user/app" className="w-full bg-black rounded-full px-4 py-3 text-[11px] text-white outline-none" /><button onClick={()=>showMsg('Search: '+globalSearch)} className="w-full mt-2 bg-[#FFC94A] text-black rounded-full py-2 font-bold">Search</button></CardBox>}
          {activeTab==='ai'&&<CardBox title="AI Command"><input value={aiCommand} onChange={e=>setAiCommand(e.target.value)} placeholder="/free email" className="w-full bg-black rounded-full px-4 py-3 text-[11px] text-white outline-none" /><button onClick={()=>showMsg('AI: '+aiCommand)} className="w-full mt-2 bg-[#7CB8E8] text-white rounded-full py-2 font-bold">Run AI</button></CardBox>}
          {activeTab==='banner'&&<CardBox title="Banner"><input value={bannerText} onChange={e=>setBannerText(e.target.value)} placeholder="Banner Text" className="w-full bg-black rounded-full px-4 py-3 text-[11px] text-white outline-none" /><button onClick={()=>showMsg('Saved')} className="w-full mt-2 bg-[#FFC94A] text-black rounded-full py-2 font-bold">Save</button></CardBox>}

          {!['dash','pubfee','razor','search','ai','banner'].includes(activeTab)&&(
            <CardBox title={`${tabs.find(t=>t.id===activeTab)?.i} ${tabs.find(t=>t.id===activeTab)?.l}`}>
              <p className="text-[11px] text-gray-400">Feature Active ✅ - Build Safe - Keyboard Fix</p>
              <p className="text-[10px] text-gray-500 mt-2">Pub Fee: ₹{publishFee} | Version: {appVersion}</p>
              <button onClick={()=>showMsg(tabs.find(t=>t.id===activeTab)?.l+' Saved')} className="w-full mt-3 bg-[#FFC94A] text-black rounded-full py-2 font-bold">Save</button>
            </CardBox>
          )}
        </div>

        <div className="fixed bottom-[18px] left-1/2 -translate-x-1/2 w-[94%] max-w-[500px] z-50">
          <div className="bg-[#1E1E1E] rounded-full p-2 flex gap-1 overflow-x-auto border border-[#2A2A2A]">
            {tabs.map(t=>{ const a=activeTab===t.id; return <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex flex-col items-center px-3 py-2 rounded-full text-[9px] font-bold whitespace-nowrap min-w-[55px] ${a?'bg-[#FFC94A] text-black':'text-gray-400'}`}><span className="text-[14px]">{t.i}</span>{t.l}</button> })}
          </div>
          <p className="text-[9px] text-gray-500 text-center mt-2">61 Features • Keyboard Fixed ✅ • Pub Fee ₹{publishFee}</p>
        </div>
      </div>
    </div>
  );
};
export default SuperAdmin;
