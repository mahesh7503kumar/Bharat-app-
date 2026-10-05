import React, { useState, useEffect } from 'react';
const SuperAdmin = () => {
  const [isLocked,setIsLocked]=useState(true); const [activeTab,setActiveTab]=useState('dash'); const [msg,setMsg]=useState('');
  const [step,setStep]=useState(1); const [isForget,setIsForget]=useState(false);
  const [email,setEmail]=useState(''); const [phone,setPhone]=useState(''); const [otpInput,setOtpInput]=useState('');
  const [newPass,setNewPass]=useState(''); const [confirmPass,setConfirmPass]=useState(''); const [realEmailOtp,setRealEmailOtp]=useState(''); const [realMobileOtp,setRealMobileOtp]=useState('');
  const ALLOWED_EMAIL='mahesh7503kumar@gmail.com'; const ALLOWED_PHONES=['8700626256'];
  const S = (k,d) => JSON.parse(localStorage.getItem(k)||JSON.stringify(d));
  const [loginHistory,setLoginHistory]=useState(S('login_history',[]));
  const [deviceLock,setDeviceLock]=useState(localStorage.getItem('device_lock')==='true');
  const [twoFA,setTwoFA]=useState(localStorage.getItem('2fa_enabled')==='true'); const [twoFACode,setTwoFACode]=useState('');
  const [razorKey,setRazorKey]=useState(localStorage.getItem('razor_key')||''); const [upiId,setUpiId]=useState(localStorage.getItem('upi_id')||'mahesh@upi');
  const [credits,setCredits]=useState(S('credit_config',{free:10,perApp:1,price:49}));
  const [expiryDays,setExpiryDays]=useState(localStorage.getItem('expiry_days')||'30');
  const [aiCommand,setAiCommand]=useState(''); const [aiHistory,setAiHistory]=useState([]); const [isListening,setIsListening]=useState(false);
  const [backupTime,setBackupTime]=useState(localStorage.getItem('backup_time')||'00:00'); const [lastBackup,setLastBackup]=useState(localStorage.getItem('last_backup')||'Never');
  const [pushTitle,setPushTitle]=useState(''); const [pushMsg,setPushMsg]=useState('');
  const [bannedUsers,setBannedUsers]=useState(S('banned_users',[])); const [liveUsers,setLiveUsers]=useState([{email:'user1@gmail.com',status:'Building',time:'Now'}]);
  const [supportChats,setSupportChats]=useState(S('support_chats',[{user:'amit@gmail.com',msg:'Publish nahi ho raha',time:'5m'}]));
  const [killSwitch,setKillSwitch]=useState(localStorage.getItem('kill_switch')==='true');
  const [globalBanner,setGlobalBanner]=useState(localStorage.getItem('global_banner')||''); const [bannerOn,setBannerOn]=useState(localStorage.getItem('banner_on')==='true');
  const [appVersion,setAppVersion]=useState(localStorage.getItem('app_version')||'1.1.1'); const [forceUpdate,setForceUpdate]=useState(localStorage.getItem('force_update')==='true');
  const [publishFee,setPublishFee]=useState(localStorage.getItem('publish_fee')||'299'); const [publishFeeOn,setPublishFeeOn]=useState(localStorage.getItem('publish_fee_on')!=='false');
  const [firebaseCfg,setFirebaseCfg]=useState(S('firebase_cfg',{apiKey:'',projectId:'',authDomain:''}));
  const [revenue,setRevenue]=useState(S('revenue',[{day:'Mon',amt:1200},{day:'Tue',amt:3400},{day:'Wed',amt:2100}]));
  const [blocks,setBlocks]=useState(S('blocks_cfg',[{name:'Countdown',pro:false},{name:'Payment',pro:true},{name:'Chat',pro:false}]));
  const [aiRotation,setAiRotation]=useState(localStorage.getItem('ai_rotation')||'Gemini->OpenAI'); const [aiCost,setAiCost]=useState(localStorage.getItem('ai_cost')||'₹0');
  const [admob,setAdmob]=useState(S('admob',{bannerId:'ca-app-pub-xxx',inter:true,reward:true}));
  const [legal,setLegal]=useState(localStorage.getItem('legal_text')||'Privacy Policy for {appName}...');
  const [storageUsers,setStorageUsers]=useState([{email:'heavy@gmail.com',apps:98,size:'1.2GB'}]);
  const [templates,setTemplates]=useState(S('templates',[{name:'Kirana',price:199,sales:12}])); const [referralBonus,setReferralBonus]=useState(localStorage.getItem('ref_bonus')||'5');
  const [resellers,setResellers]=useState(S('resellers',[])); const [coupons,setCoupons]=useState(S('coupons',[{code:'DIWALI50',off:50}]));
  const [adShare,setAdShare]=useState(localStorage.getItem('ad_share')||'50'); const [affLink,setAffLink]=useState(localStorage.getItem('aff_link')||'https://amazon.in/...');
  const [team,setTeam]=useState(S('team',[{email:'staff@gmail.com',role:'support'}])); const [audit,setAudit]=useState(S('audit',[{who:'staff@gmail.com',action:'Free दिया amit@gmail.com',time:'10:30'}]));
  const [webhook,setWebhook]=useState(localStorage.getItem('webhook')||'https://...'); const [rateLimit,setRateLimit]=useState(localStorage.getItem('rate_limit')||'20');
  const [globalSearch,setGlobalSearch]=useState(''); const [abTest,setAbTest]=useState(localStorage.getItem('ab_test')||'A:50% B:50%');
  const [luckyOn,setLuckyOn]=useState(localStorage.getItem('lucky_on')==='true'); const [academyVideos,setAcademyVideos]=useState(S('academy',[{title:'App kaise banaye',url:'youtube.com/...'}]));
  const [users,setUsers]=useState(S('all_users',[])); const [apps,setApps]=useState(S('all_apps',[]));
  const [savedKeys,setSavedKeys]=useState([]); const [apiKey,setApiKey]=useState(''); const [provider,setProvider]=useState('Gemini');
  const [analytics,setAnalytics]=useState(S('analytics',{totalTime:'12h',topBlock:'Payment',activeNow:23}));
  const [appReviews,setAppReviews]=useState(S('app_reviews',[{app:'Kirana',stars:5,comment:'Best app'}]));
  const [customDomain,setCustomDomain]=useState(localStorage.getItem('custom_domain')||'');
  const [pushHistory,setPushHistory]=useState(S('push_history',[{title:'Diwali Offer',sent:120,opened:89,time:'2h ago'}]));
  const [subPlans,setSubPlans]=useState(S('sub_plans',[{name:'Free',price:0},{name:'Pro',price:199},{name:'Premium',price:499}]));
  const [tawkId,setTawkId]=useState(localStorage.getItem('tawk_id')||'');
  const [leaderboard,setLeaderboard]=useState(S('leaderboard',[{email:'amit@gmail.com',refer:12},{email:'rahul@gmail.com',refer:8}]));
  const [cloneAlerts,setCloneAlerts]=useState(S('clone_alerts',[]));
  const [seoCfg,setSeoCfg]=useState(S('seo_cfg',{title:'My App',desc:'Best Bharat App',image:''}));
  const [aiIconPrompt,setAiIconPrompt]=useState(''); const [voice2Lang,setVoice2Lang]=useState('hi-IN');

  useEffect(()=>{ if(localStorage.getItem('owner_email')===ALLOWED_EMAIL && localStorage.getItem('owner_verified')==='true') setIsLocked(false); const g=localStorage.getItem('ai_key_Gemini'); if(g) setSavedKeys([{p:'Gemini',m:g.slice(0,6)+'****'}]); },[]);
  const handleEmail=()=>{ if(email.toLowerCase()!==ALLOWED_EMAIL){ setMsg('❌ Only Malik'); return; } setStep(2); };
  const handlePhone=()=>{ if(!ALLOWED_PHONES.includes(phone)){ setMsg('❌ Only Malik number'); return; } const otp=Math.floor(1000+Math.random()*9000).toString(); setRealMobileOtp(otp); localStorage.setItem('malik_otp',otp); setMsg(`✅ OTP Sent`); setStep(3); };
  const handleOtpLogin=()=>{ if(otpInput!==localStorage.getItem('malik_otp')){ setMsg('❌ Galat OTP'); return; } if(twoFA){ setStep(4); setMsg('2FA 123456'); return; } const h={email:ALLOWED_EMAIL,device:navigator.userAgent.slice(0,25),ip:'192.168.1.'+Math.floor(Math.random()*100),time:new Date().toLocaleString()}; const nh=[h,...loginHistory].slice(0,20); setLoginHistory(nh); localStorage.setItem('login_history',JSON.stringify(nh)); localStorage.setItem('owner_email',ALLOWED_EMAIL); localStorage.setItem('owner_verified','true'); setIsLocked(false); };
  const handle2FA=()=>{ if(twoFACode!=='123456'){ setMsg('❌ 2FA Galat'); return; } localStorage.setItem('owner_email',ALLOWED_EMAIL); localStorage.setItem('owner_verified','true'); setIsLocked(false); };
  const handleForgetEmail=()=>{ if(email.toLowerCase()!==ALLOWED_EMAIL){ setMsg('❌ Email galat'); return; } const otp=Math.floor(1000+Math.random()*9000).toString(); setRealEmailOtp(otp); setMsg(`✅ Email OTP Sent`); setStep(2); };
  const handleForgetEmailVerify=()=>{ if(otpInput!==realEmailOtp){ setMsg('❌ Email OTP galat'); return; } setOtpInput(''); setStep(3); };
  const handleForgetMobileSend=()=>{ if(!ALLOWED_PHONES.includes(phone)){ setMsg('❌ Number galat'); return; } const otp=Math.floor(1000+Math.random()*9000).toString(); setRealMobileOtp(otp); setMsg(`✅ Mobile OTP Sent`); setStep(4); };
  const handleForgetMobileVerify=()=>{ if(otpInput!==realMobileOtp){ setMsg('❌ Mobile OTP galat'); return; } setOtpInput(''); setStep(5); };
  const handlePassChange=()=>{ if(newPass.length<4){ setMsg('❌ Min 4'); return; } if(newPass!==confirmPass){ setMsg('❌ Match nahi'); return; } localStorage.setItem('malik_password',newPass); localStorage.setItem('owner_email',ALLOWED_EMAIL); localStorage.setItem('owner_verified','true'); setIsLocked(false); };
  const runAI=(t)=>{ const cmd=(t||aiCommand).toLowerCase(); let res=''; if(cmd.includes('free')){ const em=(t||aiCommand).match(/[\w.-]+@[\w.-]+\.\w+/)?.[0]; if(em){ const nu=[...users,{email:em,plan:'pro_free'}]; setUsers(nu); localStorage.setItem('all_users',JSON.stringify(nu)); res=`✅ ${em} free`; } } else res=`🤖 ${t||aiCommand} done`; setMsg(res); setAiHistory([{cmd:t||aiCommand,res,time:new Date().toLocaleTimeString()},...aiHistory].slice(0,5)); };
  const startMic=()=>{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ setMsg('❌ Mic not supported'); return; } const rec=new SR(); rec.lang=voice2Lang; setIsListening(true); rec.start(); rec.onresult=(e)=>{ const txt=e.results[0][0].transcript; setAiCommand(txt); runAI(txt); }; rec.onend=()=>setIsListening(false); };

  if(isLocked) return (<div className="min-h-screen bg-[#121212] flex items-center justify-center p-4"><div className="bg-white rounded-[28px] p-6 w-full max-w-[360px]"><h1 className="font-black text-center text-[14px]">{isForget?'🔑 Forget 5-Step':'🔐 MALIK 61 Features'}</h1>{!isForget? (<>{step===1&&<><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-black text-white rounded-full px-5 py-3 mt-5 text-[12px]" /><button onClick={handleEmail} className="w-full bg-[#7C4DFF] text-white rounded-full py-3 font-bold mt-3">Next</button><button onClick={()=>{setIsForget(true); setStep(1);}} className="w-full text-[11px] text-[#7C4DFF] mt-3 underline">Forget?</button></>}{step===2&&<><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile" className="w-full bg-black text-white rounded-full px-5 py-3 mt-5 text-[12px]" /><button onClick={handlePhone} className="w-full bg-[#7C4DFF] text-white rounded-full py-3 font-bold mt-3">Send OTP</button></>}{step===3&&<><input value={otpInput} onChange={e=>setOtpInput(e.target.value)} placeholder="OTP" className="w-full bg-black text-white rounded-full px-5 py-3 mt-5 text-center tracking-[8px]" /><button onClick={handleOtpLogin} className="w-full bg-green-600 text-white rounded-full py-3 font-bold mt-3">Verify</button></>}{step===4&&<><input value={twoFACode} onChange={e=>setTwoFACode(e.target.value)} placeholder="123456" className="w-full bg-black text-white rounded-full px-5 py-3 mt-5 text-center" /><button onClick={handle2FA} className="w-full bg-black text-white rounded-full py-3 font-bold mt-3">2FA Verify</button></>}</>) : (<>{step===1&&<><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-black rounded-full px-5 py-3 mt-5 text-white" /><button onClick={handleForgetEmail} className="w-full bg-red-600 text-white rounded-full py-3 font-bold mt-3">Email OTP</button></>}{step===2&&<><input value={otpInput} onChange={e=>setOtpInput(e.target.value)} placeholder="Email OTP" className="w-full bg-black rounded-full px-5 py-3 mt-5 text-center text-white" /><button onClick={handleForgetEmailVerify} className="w-full bg-red-600 text-white rounded-full py-3 font-bold mt-3">Verify Email</button></>}{step===3&&<><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile" className="w-full bg-black rounded-full px-5 py-3 mt-5 text-white" /><button onClick={handleForgetMobileSend} className="w-full bg-red-600 text-white rounded-full py-3 font-bold mt-3">Mobile OTP</button></>}{step===4&&<><input value={otpInput} onChange={e=>setOtpInput(e.target.value)} placeholder="Mobile OTP" className="w-full bg-black rounded-full px-5 py-3 mt-5 text-center text-white" /><button onClick={handleForgetMobileVerify} className="w-full bg-red-600 text-white rounded-full py-3 font-bold mt-3">Verify Mobile</button></>}{step===5&&<><input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="New Pass" className="w-full bg-black rounded-full px-5 py-3 mt-5 text-white" /><input type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="Confirm" className="w-full bg-black rounded-full px-5 py-3 mt-3 text-white" /><button onClick={handlePassChange} className="w-full bg-green-600 text-white rounded-full py-3 font-bold mt-3">Save</button></>}<button onClick={()=>{setIsForget(false); setStep(1);}} className="w-full text-[11px] mt-3">← Back</button></>)}{msg&&<p className="text-[11px] text-center mt-3 bg-black text-[#FFC94A] p-2 rounded-full">{msg}</p>}</div></div>);

  const tabs=[
    {id:'dash',l:'Home',i:'🏠'},{id:'history',l:'History',i:'🕒'},{id:'device',l:'Device',i:'📱'},{id:'2fa',l:'2FA',i:'🛡️'},{id:'razor',l:'Razor',i:'⚡'},{id:'credit',l:'Credit',i:'💳'},{id:'expiry',l:'Expiry',i:'📅'},{id:'ai',l:'AI',i:'🤖'},{id:'backup',l:'Backup',i:'💾'},{id:'push',l:'Push',i:'🔔'},{id:'ban',l:'Ban',i:'🚫'},{id:'live',l:'Live',i:'🟢'},{id:'chat',l:'Chat',i:'💬'},{id:'kill',l:'Kill',i:'💀'},{id:'banner',l:'Banner',i:'📢'},{id:'ver',l:'Version',i:'🔢'},{id:'pubfee',l:'Pub Fee',i:'💰'},{id:'vault',l:'Vault',i:'🔐'},{id:'firebase',l:'Firebase',i:'🔥'},{id:'revenue',l:'Revenue',i:'💵'},{id:'blocks',l:'Blocks',i:'🧱'},{id:'rotation',l:'Rotate',i:'🔄'},{id:'admob',l:'AdMob',i:'📊'},{id:'legal',l:'Legal',i:'⚖️'},{id:'storage',l:'Storage',i:'🗄️'},{id:'template',l:'Bazaar',i:'🛒'},{id:'refer',l:'Refer',i:'👥'},{id:'reseller',l:'Reseller',i:'🤝'},{id:'coupon',l:'Coupon',i:'🎟️'},{id:'adshare',l:'AdShare',i:'📈'},{id:'aff',l:'Affiliate',i:'🔗'},{id:'team',l:'Team',i:'👨‍👩‍👧'},{id:'audit',l:'Audit',i:'📝'},{id:'webhook',l:'Webhook',i:'🔌'},{id:'rate',l:'Rate',i:'⏱️'},{id:'search',l:'Search',i:'🔍'},{id:'ab',l:'AB Test',i:'🧪'},{id:'export',l:'Export',i:'📦'},{id:'error',l:'Error',i:'❌'},{id:'lucky',l:'Lucky',i:'🎡'},{id:'academy',l:'Academy',i:'🎓'},{id:'logo',l:'Logo',i:'🎨'},{id:'voice',l:'Voice',i:'🎤'},{id:'translate',l:'Translate',i:'🌐'},{id:'review',l:'Review',i:'⭐'},{id:'ss2app',l:'SS2App',i:'📸'},{id:'bharatgpt',l:'BharatGPT',i:'🇮🇳'},{id:'publish',l:'Publish',i:'🚀'},{id:'wa',l:'WhatsApp',i:'💚'},
    {id:'analytics',l:'Analytics',i:'📊'},{id:'appreview',l:'Reviews',i:'⭐'},{id:'aab',l:'AAB',i:'📦'},{id:'domain',l:'Domain',i:'🌐'},{id:'pushhist',l:'PushHist',i:'🔔'},{id:'subs',l:'Subs',i:'💳'},{id:'tawk',l:'Tawk',i:'💬'},{id:'lead',l:'Lead',i:'🏆'},{id:'clone',l:'Clone',i:'🛡️'},{id:'seo',l:'SEO',i:'📸'},{id:'aicon',l:'Icon',i:'✨'},{id:'voice2',l:'Voice2',i:'🎤'},
  ];
  const Card=({title,children})=><div className="bg-[#2A2A2A] rounded-[20px] p-4 text-white"><h3 className="font-bold text-[13px]">{title}</h3><div className="mt-3">{children}</div></div>;

  return (
    <div className="min-h-screen bg-[#121212] flex justify-center">
      <div className="w-full max-w-[520px] bg-[#121212] min-h-screen flex flex-col relative pb-[140px]">

        {/* TOP SMALL DARK PILL - WHITE HATA DIYA */}
        <div className="px-4 pt-3">
          <div className="bg-[#1E1E1E] rounded-full px-4 py-2 flex justify-center">
            <p className="text-[11px] text-gray-400 font-bold tracking-widest">MALIK • 61 v1.1.1</p>
          </div>
        </div>

        {/* SUPERADMIN TITLE BAR - DARK */}
        <div className="px-4 mt-3">
          <div className="bg-[#1E1E1E] rounded-[16px] px-5 py-4 flex justify-between items-center">
            <h1 className="font-black text-[22px] text-white">SuperAdmin</h1>
            <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center">⚙️</div>
          </div>
        </div>

        <div className="px-4 py-3 flex-1">{msg&&<p className="bg-[#FFC94A] text-black text-center text-[10px] p-2 rounded-full mb-3 font-bold">{msg}</p>}

          {activeTab==='dash'&&(
            <>
            {/* DASHBOARD CARD - EXACT SAME AS SCREENSHOT */}
            <div className="bg-[#1E1E1E] rounded-[20px] p-5">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-[18px] text-white">Dashboard</h2>
                <span className="text-gray-500">⌄</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-[#2A2A2A] rounded-[14px] p-4">
                  <p className="text-[10px] text-gray-400 tracking-widest">USERS</p>
                  <p className="font-black text-[32px] text-white mt-1">{users.length}</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-[14px] p-4">
                  <p className="text-[10px] text-gray-400 tracking-widest">APPS</p>
                  <p className="font-black text-[32px] text-white mt-1">{apps.length}</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-[14px] p-4">
                  <p className="text-[10px] text-gray-400 tracking-widest">TODAY</p>
                  <p className="font-black text-[26px] text-[#4ADE80] mt-1">₹{revenue.reduce((s,r)=>s+r.amt,0)}</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-[14px] p-4">
                  <p className="text-[10px] text-gray-400">Pub Fee: ₹{publishFee} ON</p>
                  <p className="font-black text-[24px] text-[#4ADE80] mt-1">₹{publishFee} ON</p>
                </div>
              </div>
              <div className="h-[1px] bg-[#2A2A2A] my-5"></div>
              <div className="flex justify-around">
                <div className="text-center"><p className="text-[12px] text-gray-400">Banned</p><p className="font-black text-[28px] text-[#F87171]">{bannedUsers.length}</p></div>
                <div className="text-center"><p className="text-[12px] text-gray-400">Live</p><p className="font-black text-[28px] text-[#4ADE80]">{liveUsers.length}</p></div>
              </div>
            </div>
            <div className="mt-6 px-1">
              <h3 className="font-bold text-[16px] text-white">Activity</h3>
              <p className="text-[12px] text-gray-500 mt-8 text-center">No recent activity to show.</p>
            </div>
            </>
          )}

          {activeTab==='pubfee'&&<Card title="💰 Publishing Fee - Har App Se Kamai"><div className="bg-[#FFC94A]/20 p-3 rounded-xl"><p className="text-[11px] text-[#FFC94A] font-bold">💡 User app banayega to Publish se pehle aapko fee degi</p></div><div className="grid grid-cols-2 gap-2 mt-3"><div className="bg-[#3A3A3A] p-3 rounded-xl text-center"><p className="text-[8px] text-gray-400">FEE</p><p className="font-bold text-[18px]">₹{publishFee}</p></div><div className="bg-[#3A3A3A] p-3 rounded-xl text-center"><p className="text-[8px] text-gray-400">STATUS</p><p className={`font-bold ${publishFeeOn?'text-green-400':'text-red-400'}`}>{publishFeeOn?'ACTIVE':'OFF'}</p></div></div><input type="number" value={publishFee} onChange={e=>setPublishFee(e.target.value)} className="w-full bg-black rounded-full px-4 py-3 text-[14px] mt-3 font-bold text-center text-white" /><div className="flex gap-2 mt-3"><button onClick={()=>{const v=!publishFeeOn; setPublishFeeOn(v); localStorage.setItem('publish_fee_on',v); setMsg(v?`Fee ON ₹${publishFee}`:'Fee OFF');}} className={`flex-1 rounded-full py-3 font-bold ${publishFeeOn?'bg-green-600':'bg-[#3A3A3A]'}`}>{publishFeeOn?'🟢 ON':'🔴 OFF'}</button><button onClick={()=>{localStorage.setItem('publish_fee',publishFee); localStorage.setItem('publish_fee_on',publishFeeOn); setMsg(`✅ Saved! ₹${publishFee}/app`);}} className="flex-1 bg-[#FFC94A] text-black rounded-full py-3 font-bold">Save</button></div></Card>}
          {activeTab==='history'&&<Card title="Login History">{loginHistory.map((h,i)=><div key={i} className="bg-[#3A3A3A] p-2 rounded-xl mt-2 text-[9px]">{h.email} - {h.ip} - {h.time}</div>)}</Card>}
          {activeTab==='device'&&<Card title="Device Lock"><button onClick={()=>{const v=!deviceLock; setDeviceLock(v); localStorage.setItem('device_lock',v); setMsg(v?'ON':'OFF');}} className={`w-full rounded-full py-3 font-bold ${deviceLock?'bg-green-600':'bg-[#3A3A3A]'}`}>{deviceLock?'🔒 ON':'🔓 OFF'}</button></Card>}
          {activeTab==='2fa'&&<Card title="2FA"><button onClick={()=>{const v=!twoFA; setTwoFA(v); localStorage.setItem('2fa_enabled',v);}} className={`w-full rounded-full py-3 font-bold ${twoFA?'bg-green-600':'bg-[#3A3A3A]'}`}>{twoFA?'ON':'OFF'}</button></Card>}
          {activeTab==='razor'&&<Card title="Razorpay + UPI"><input value={razorKey} onChange={e=>setRazorKey(e.target.value)} placeholder="Razor Key" className="w-full bg-black rounded-full px-4 py-3 text-[11px] mt-2 text-white" /><input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="UPI" className="w-full bg-black rounded-full px-4 py-3 text-[11px] mt-2 text-white" /><button onClick={()=>{localStorage.setItem('razor_key',razorKey); localStorage.set
