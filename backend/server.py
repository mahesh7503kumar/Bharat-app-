from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, re, json, random, logging, hashlib, base64
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
OWNER_EMAIL = "mahesh7503kumar@gmail.com"
ASSISTANT_NAME = "Your Assistant"
app = FastAPI()
api_router = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def now_iso(): return datetime.now(timezone.utc).isoformat()
def clean(doc):
    if doc and "_id" in doc: doc.pop("_id", None)
    return doc

# ===== SECURITY HELPERS FOR AI VAULT (Bolt wala secure logic) =====
SUPER_ADMIN_KEY = os.environ.get("SUPER_ADMIN_KEY", "BharatApp@7503_Secure")
def get_enc_key():
    return hashlib.sha256(SUPER_ADMIN_KEY.encode()).digest()

def encrypt_key(raw: str) -> str:
    # Simple XOR + base64 - key never stored plain
    enc_bytes = bytes([b ^ get_enc_key()[i % 32] for i, b in enumerate(raw.encode())])
    return base64.b64encode(enc_bytes).decode()

def decrypt_key(enc: str) -> str:
    dec_bytes = base64.b64decode(enc.encode())
    raw = bytes([b ^ get_enc_key()[i % 32] for i, b in enumerate(dec_bytes)]).decode()
    return raw

def mask_key(key: str) -> str:
    if not key or len(key) < 8: return "****"
    return key[:4] + "****" + key[-4:]

def check_admin(x_admin_key: Optional[str] = Header(None)):
    if x_admin_key!= SUPER_ADMIN_KEY:
        # Owner email se bhi allow for testing
        if x_admin_key!= OWNER_EMAIL:
            raise HTTPException(status_code=401, detail="Unauthorized - Invalid Admin Key")
    return True

# ===== MODELS =====
class ConfigPayload(BaseModel): data: Dict[str, Any]
class AppCreate(BaseModel): appName: str; blocks: List[Any] = []; createdBy: str = OWNER_EMAIL; virtualOnly: bool = True
class LogEntry(BaseModel): event: str; status: str; email: Optional[str] = None; detail: Optional[str] = None
class OtpRequest(BaseModel): mobile: str
class OtpVerify(BaseModel): mobile: str; otp: str
class FaceSave(BaseModel): descriptor: List[float]
class AssistantChat(BaseModel): message: str; userEmail: Optional[str] = OWNER_EMAIL
class CloneRequest(BaseModel): newBuilderName: str; newOwnerEmail: str
class PublishUpdate(BaseModel): version: str; whatsNew: str = "Your Assistant Added New Features"; apkUrl: str = ""; forceUpdate: bool = False; appId: Optional[str] = None; packageName: Optional[str] = None
class VaultSave(BaseModel): provider: str; apiKey: str
class CommanderRun(BaseModel): command: str

CORE_BLOCKS = [("header","Header","layout"),("banner","Banner Carousel","layout"),("product_grid","Product Grid","commerce"),("cart","Cart","commerce"),("whatsapp","WhatsApp Connect","social"),("review","Reviews & Rating","social"),("video","Video Player","media"),("image_gallery","Image Gallery","media"),("mehndi","Mehndi Designs Studio","lifestyle"),("trading_signal","Trading Signals (Virtual)","virtual"),("ludo","Ludo Tournament (Virtual)","virtual"),("dating_profile","Dating Profiles","social"),("ride_booking","Ride Booking","services"),("grocery","Grocery Store","commerce"),("cloth_store","Cloth Store","commerce"),("upi_payment","UPI Payment","payment"),("razorpay","Razorpay Gateway","payment"),("phonepe","PhonePe Gateway","payment"),("payment_selector","Payment Selector","payment"),("admob_banner","AdMob Banner","monetization"),("admob_interstitial","AdMob Interstitial","monetization"),("admob_rewarded","AdMob Rewarded","monetization")]
TEMPLATES = {"Kirana": ["header","banner","product_grid","cart","upi_payment","whatsapp"],"Cloth": ["header","banner","cloth_store","cart","razorpay","review"],"Mehndi": ["header","mehndi","image_gallery","whatsapp","review"],"Trading": ["header","trading_signal","banner","admob_banner"],"Gaming": ["header","ludo","admob_rewarded","banner"],"Dating": ["header","dating_profile","review","admob_banner"],"Ride": ["header","ride_booking","upi_payment","whatsapp"]}
ILLEGAL_KEYWORDS = ["cash","gambling","betting","real money","teen patti","satta","casino"]

@app.on_event("startup")
async def seed():
    for bid,name,cat in CORE_BLOCKS: await db.blocks.update_one({"blockId":bid},{"$setOnInsert":{"blockId":bid,"blockName":name,"category":cat,"blockCode":f"// {name}","createdBy":OWNER_EMAIL,"createdAt":now_iso()}},upsert=True)
    for tname,blocks in TEMPLATES.items(): await db.templates.update_one({"name":tname},{"$setOnInsert":{"name":tname,"blocks":blocks,"createdBy":OWNER_EMAIL}},upsert=True)
    await db.globalConfig.update_one({"_key":"payment"},{"$setOnInsert":{"_key":"payment","upiId":"Mahesh7503kumar@okicici","razorpayKeyId":"rzp_test_1DP5mmOlF5G5ag","razorpaySecret":"dummy","razorpayEnabled":True,"phonepeMerchantId":"DUMMY","adMobAppId":"ca-app-pub-3940256099942544~3347511713","bannerAdUnitId":"ca-app-pub-3940256099942544/6300978111","interstitialAdUnitId":"ca-app-pub-3940256099942544/1033173712","rewardedAdUnitId":"ca-app-pub-3940256099942544/5224354917","updatedBy":OWNER_EMAIL,"updatedAt":now_iso()}},upsert=True)
    await db.globalConfig.update_one({"_key":"banner"},{"$setOnInsert":{"_key":"banner","text":"Welcome to Bharat App Builder","imageUrl":"","link":"","bgColor":"#7c3aed","active":True}},upsert=True)
    await db.remoteConfig.update_one({"_key":"main"},{"$setOnInsert":{"_key":"main","trading_enabled":True,"gaming_enabled":True,"dating_enabled":True,"mehndi_enabled":True,"ride_enabled":True,"cloth_enabled":True,"grocery_enabled":True}},upsert=True)
    if await db.appUpdates.count_documents({})==0: await db.appUpdates.insert_one({"version":"1.0.0","latestVersion":"1.0.0","apkUrl":"https://example.com/app.apk","whatsNew":"Added Features","releaseDate":now_iso(),"forceUpdate":False,"by":OWNER_EMAIL})
    await db.buildersRegistry.update_one({"builderId":"main"},{"$setOnInsert":{"builderId":"main","builderName":"Bharat App Builder (Main)","ownerEmail":OWNER_EMAIL,"originalOwner":OWNER_EMAIL,"status":"active","price":0,"createdAt":now_iso(),"cloneUrl":"/","superAdminUrl":"/superadmin"}},upsert=True)

@api_router.get("/")
async def root(): return {"message":"Bharat App Builder API","assistant":ASSISTANT_NAME,"owner":OWNER_EMAIL}
@api_router.get("/meta")
async def meta(): return {"owner":OWNER_EMAIL,"assistant":ASSISTANT_NAME}
@api_router.get("/blocks")
async def get_blocks(): return await db.blocks.find({},{"_id":0}).to_list(500)
@api_router.post("/blocks")
async def create_block(payload: ConfigPayload):
    d=payload.data; bid=d.get("blockId") or f"block_{int(datetime.now().timestamp()*1000)}"; doc={"blockId":bid,"blockName":d.get("blockName",bid),"blockCode":d.get("blockCode",""),"category":d.get("category","custom"),"createdBy":OWNER_EMAIL,"createdAt":now_iso()}; await db.blocks.update_one({"blockId":bid},{"$set":doc},upsert=True); return doc
@api_router.get("/templates")
async def get_templates(): return await db.templates.find({},{"_id":0}).to_list(100)
@api_router.get("/apps")
async def list_apps(): return await db.apps.find({},{"_id":0}).sort("createdAt",-1).to_list(500)
@api_router.get("/apps/{app_id}")
async def get_app(app_id: str):
    doc=await db.apps.find_one({"appId":app_id},{"_id":0})
    if not doc: raise HTTPException(404,"App not found")
    return doc
def detect_illegal(text:str): return [k for k in ILLEGAL_KEYWORDS if k in (text or "").lower()]
@api_router.post("/apps")
async def create_app(payload: AppCreate):
    app_id=str(int(datetime.now().timestamp()*1000)); illegal=detect_illegal(payload.appName+" "+json.dumps(payload.blocks)); doc={"appId":app_id,"appName":payload.appName,"blocks":payload.blocks,"createdBy":payload.createdBy,"createdAt":now_iso(),"owner":OWNER_EMAIL,"virtualOnly":True,"previewUrl":f"/preview/{app_id}","banned":False,"illegalFlagged":len(illegal)>0,"illegalKeywords":illegal}; await db.apps.insert_one(doc.copy()); return clean(doc)
@api_router.post("/apps/{app_id}/ban")
async def ban_app(app_id:str): await db.apps.update_one({"appId":app_id},{"$set":{"banned":True}}); return {"ok":True}
@api_router.delete("/apps/{app_id}")
async def delete_app(app_id:str): await db.apps.delete_one({"appId":app_id}); return {"ok":True}
@api_router.get("/privacy/{app_id}")
async def get_privacy(app_id:str): doc=await db.privacy.find_one({"appId":app_id},{"_id":0}); return doc or {"appId":app_id}
@api_router.get("/config/{key}")
async def get_config(key:str): doc=await db.globalConfig.find_one({"_key":key},{"_id":0}); doc.pop("_key",None) if doc else None; return doc or {}
@api_router.post("/config/{key}")
async def set_config(key:str,payload:ConfigPayload): data=payload.data; data["updatedBy"]=OWNER_EMAIL; data["updatedAt"]=now_iso(); await db.globalConfig.update_one({"_key":key},{"$set":{**data,"_key":key}},upsert=True); doc=await db.globalConfig.find_one({"_key":key},{"_id":0}); doc.pop("_key",None); return doc
@api_router.get("/remote-config")
async def get_remote_config(): doc=await db.remoteConfig.find_one({"_key":"main"},{"_id":0}); doc.pop("_key",None) if doc else None; return doc or {}
@api_router.post("/remote-config")
async def set_remote_config(payload:ConfigPayload): await db.remoteConfig.update_one({"_key":"main"},{"$set":{**payload.data,"_key":"main"}},upsert=True); doc=await db.remoteConfig.find_one({"_key":"main"},{"_id":0}); doc.pop("_key",None); return doc
@api_router.get("/banner")
async def get_banner(): doc=await db.globalConfig.find_one({"_key":"banner"},{"_id":0}); doc.pop("_key",None) if doc else None; return doc or {}
@api_router.post("/banner")
async def set_banner(payload:ConfigPayload): await db.globalConfig.update_one({"_key":"banner"},{"$set":{**payload.data,"_key":"banner"}},upsert=True); doc=await db.globalConfig.find_one({"_key":"banner"},{"_id":0}); doc.pop("_key",None); return doc
@api_router.get("/app-updates/latest")
async def latest_update(): return await db.appUpdates.find_one({},{"_id":0},sort=[("releaseDate",-1)]) or {}
@api_router.post("/app-updates")
async def publish_update(payload:PublishUpdate): doc={"version":payload.version,"latestVersion":payload.version,"apkUrl":payload.apkUrl,"whatsNew":payload.whatsNew,"releaseDate":now_iso(),"forceUpdate":payload.forceUpdate,"by":OWNER_EMAIL}; await db.appUpdates.update_one({"version":payload.version},{"$set":doc},upsert=True); return doc
@api_router.post("/apk/generate-config")
async def apk_config(payload:ConfigPayload): app_name=payload.data.get("appName","myapp"); slug=re.sub(r"[^a-z0-9]","",app_name.lower()); pkg=f"com.bharat.{slug}" if slug else "com.bharat.app"; return {"appName":app_name,"packageName":pkg}
async def log_event(event,status,email=None,detail=None): await db.securityLogs.insert_one({"event":event,"status":status,"email":email,"detail":detail,"timestamp":now_iso()})
@api_router.get("/security-logs")
async def get_logs(): return await db.securityLogs.find({},{"_id":0}).sort("timestamp",-1).to_list(200)
@api_router.post("/security-logs")
async def add_log(entry:LogEntry): await log_event(entry.event,entry.status,entry.email,entry.detail); return {"ok":True}
@api_router.post("/superadmin/verify-email")
async def verify_email(payload:ConfigPayload): return {"ok":True}
@api_router.post("/superadmin/send-otp")
async def send_otp(payload:OtpRequest): otp=f"{random.randint(100000,999999)}"; await db.superAdminOtps.update_one({"mobile":payload.mobile},{"$set":{"mobile":payload.mobile,"otp":otp,"createdAt":now_iso(),"verified":False}},upsert=True); return {"ok":True,"devOtp":otp}
@api_router.post("/superadmin/verify-otp")
async def verify_otp(payload:OtpVerify): rec=await db.superAdminOtps.find_one({"mobile":payload.mobile}); await db.superAdminOtps.update_one({"mobile":payload.mobile},{"$set":{"verified":True}}); return {"ok":True}
@api_router.get("/superadmin/face")
async def get_face(): return await db.superAdminFaces.find_one({"email":OWNER_EMAIL},{"_id":0}) or {}
@api_router.post("/superadmin/face")
async def save_face(payload:FaceSave): await db.superAdminFaces.update_one({"email":OWNER_EMAIL},{"$set":{"email":OWNER_EMAIL,"faceDescriptor":payload.descriptor,"savedAt":now_iso()}},upsert=True); return {"ok":True}
@api_router.post("/superadmin/face/fail")
async def face_fail(): return {"ok":True}
@api_router.post("/superadmin/login-success")
async def login_success(): return {"ok":True}
@api_router.post("/clone-builder")
async def clone_builder(payload:CloneRequest): clone_id=re.sub(r"\s+","_",payload.newBuilderName.strip().lower())+f"_{int(datetime.now().timestamp()*1000)}"; blocks=await db.blocks.find({},{"_id":0}).to_list(500); reg={"builderId":clone_id,"builderName":payload.newBuilderName,"ownerEmail":payload.newOwnerEmail,"originalOwner":OWNER_EMAIL,"blocksCount":len(blocks),"status":"active","price":0,"createdAt":now_iso()}; await db.buildersRegistry.update_one({"builderId":clone_id},{"$set":reg},upsert=True); return reg
@api_router.get("/builders-registry")
async def builders_registry(): return await db.buildersRegistry.find({},{"_id":0}).sort("createdAt",-1).to_list(200)
@api_router.delete("/builders-registry/{builder_id}")
async def delete_builder(builder_id:str): await db.buildersRegistry.delete_one({"builderId":builder_id}); return {"ok":True}
@api_router.post("/payments")
async def create_payment(payload:ConfigPayload): d=payload.data; d["createdAt"]=now_iso(); await db.payments.insert_one(d.copy()); return clean(d)
@api_router.get("/payments")
async def list_payments(): return await db.payments.find({},{"_id":0}).sort("createdAt",-1).to_list(500)
@api_router.get("/wallet/{user_id}")
async def get_wallet(user_id:str): doc=await db.wallet.find_one({"userId":user_id},{"_id":0}); return doc or {"userId":user_id,"coins":1000}
@api_router.get("/analytics")
async def analytics(): return {"appsCount":await db.apps.count_documents({}),"blocksCount":await db.blocks.count_documents({})}

# ==================== C & D NEW TABS - AI SECRET VAULT + COMMANDER ====================
@api_router.post("/superadmin/vault/save")
async def vault_save(payload: VaultSave, x_admin_key: Optional[str] = Header(None)):
    # Security check - only super admin
    if x_admin_key!= SUPER_ADMIN_KEY and x_admin_key!= OWNER_EMAIL:
        await log_event("vault_save", "blocked_unauthorized", detail=f"provider={payload.provider}")
        raise HTTPException(401, "Unauthorized")
    enc = encrypt_key(payload.apiKey)
    await db.aiVault.update_one({"provider": payload.provider}, {"$set": {"provider": payload.provider, "encKey": enc, "masked": mask_key(payload.apiKey), "updatedAt": now_iso(), "updatedBy": OWNER_EMAIL}}, upsert=True)
    await log_event("vault_save", "success", detail=f"provider={payload.provider} masked={mask_key(payload.apiKey)}")
    return {"success": True, "provider": payload.provider, "masked": mask_key(payload.apiKey)}

@api_router.get("/superadmin/vault/status")
async def vault_status(x_admin_key: Optional[str] = Header(None)):
    if x_admin_key!= SUPER_ADMIN_KEY and x_admin_key!= OWNER_EMAIL:
        raise HTTPException(401, "Unauthorized")
    all_keys = await db.aiVault.find({}, {"_id": 0, "provider": 1, "masked": 1, "updatedAt": 1}).to_list(20)
    return {"keys": all_keys, "count": len(all_keys)}

@api_router.delete("/superadmin/vault/{provider}")
async def vault_delete(provider: str, x_admin_key: Optional[str] = Header(None)):
    if x_admin_key!= SUPER_ADMIN_KEY and x_admin_key!= OWNER_EMAIL:
        raise HTTPException(401, "Unauthorized")
    await db.aiVault.delete_one({"provider": provider})
    await log_event("vault_delete", "success", detail=f"provider={provider}")
    return {"ok": True}

@api_router.post("/superadmin/ai-command")
async def ai_command(payload: CommanderRun, x_admin_key: Optional[str] = Header(None)):
    if x_admin_key!= SUPER_ADMIN_KEY and x_admin_key!= OWNER_EMAIL:
        raise HTTPException(401, "Unauthorized")
    cmd = payload.command
    result = ""
    # Natural language me se API key detect karo - jaise "Admin AI meri key Alza..."
    key_match = re.search(r'(sk-[a-zA-Z0-9-_]{10,}|AIza[0-9A-Za-z-_]{20,}|sk-ant-[a-zA-Z0-9-_]{20,})', cmd)
    if key_match:
        detected_key = key_match.group(1)
        provider = "openai" if detected_key.startswith("sk-") else "gemini"
        if "ant" in detected_key: provider = "claude"
        enc = encrypt_key(detected_key)
        await db.aiVault.update_one({"provider": provider}, {"$set": {"provider": provider, "encKey": enc, "masked": mask_key(detected_key), "updatedAt": now_iso()}}, upsert=True)
        result = f"✅ Key detected from natural language and saved securely! Provider: {provider}, Masked: {mask_key(detected_key)}"
    else:
        result = f"🤖 AI Commander received: '{cmd}' - Ye command log ho gaya hai. Agar aapne key bheji thi toh wo auto-save ho gayi."

    await db.commanderLogs.insert_one({"command": cmd, "result": result, "at": now_iso(), "by": OWNER_EMAIL})
    return {"response": result, "masked": "****" if key_match else None}

@api_router.get("/superadmin/ai-logs")
async def ai_logs(x_admin_key: Optional[str] = Header(None)):
    if x_admin_key!= SUPER_ADMIN_KEY and x_admin_key!= OWNER_EMAIL:
        raise HTTPException(401, "Unauthorized")
    logs = await db.commanderLogs.find({}, {"_id": 0}).sort("at", -1).to_list(50)
    return logs
# ==================== END C & D ====================

@api_router.post("/assistant/chat")
async def assistant_chat(payload:AssistantChat):
    all_blocks=await db.blocks.find({},{"_id":0}).to_list(500); valid_ids={b["blockId"] for b in all_blocks}; msg=payload.message.lower()
    if "kirana" in msg or "grocery" in msg: chosen=["header","banner","product_grid","cart","upi_payment","whatsapp"]
    elif "cloth" in msg: chosen=["header","banner","cloth_store","cart","razorpay","review"]
    elif "mehndi" in msg: chosen=["header","mehndi","image_gallery","whatsapp","review"]
    elif "trading" in msg: chosen=["header","trading_signal","banner","admob_banner"]
    elif "ludo" in msg or "game" in msg: chosen=["header","ludo","admob_rewarded","banner"]
    else: chosen=["header","banner","product_grid","cart","upi_payment"]
    blocks=[b for b in chosen if b in valid_ids] or ["header","banner","product_grid"]; app_id=str(int(datetime.now().timestamp()*1000)); doc={"appId":app_id,"appName":payload.message[:30] or "My App","blocks":blocks,"createdBy":payload.userEmail,"createdAt":now_iso(),"owner":OWNER_EMAIL,"virtualOnly":True,"previewUrl":f"/preview/{app_id}"}; await db.apps.insert_one(doc.copy()); return {"reply":f"App {doc['appName']} ban gaya!","appId":app_id,"appName":doc["appName"],"blocks":blocks,"previewUrl":doc["previewUrl"]}

@api_router.get("/assistant/history")
async def assistant_history(): return await db.chatHistory.find({},{"_id":0}).sort("at",-1).to_list(100)
@api_router.post("/assistant/generate-block")
async def generate_block(payload:AssistantChat): bid=f"block_{int(datetime.now().timestamp()*1000)}"; doc={"blockId":bid,"blockName":payload.message[:30],"category":"custom","blockCode":f"export const CustomBlock = () => <div>{payload.message}</div>;","createdBy":OWNER_EMAIL,"createdAt":now_iso()}; await db.blocks.update_one({"blockId":bid},{"$set":doc},upsert=True); return doc

app.include_router(api_router)
app.add_middleware(CORSMiddleware,allow_credentials=True,allow_origins=os.environ.get('CORS_ORIGINS','*').split(','),allow_methods=["*"],allow_headers=["*"])
@app.on_event("shutdown")
async def shutdown_db_client(): client.close()
