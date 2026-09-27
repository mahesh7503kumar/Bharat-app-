from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import random
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

OWNER_EMAIL = "Mahesh7503kumar@gmail.com"
ASSISTANT_NAME = "Your Assistant"
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def clean(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


# ---------------- Models ----------------
class ConfigPayload(BaseModel):
    data: Dict[str, Any]


class AppCreate(BaseModel):
    appName: str
    blocks: List[Any] = []
    createdBy: str = OWNER_EMAIL
    virtualOnly: bool = True


class LogEntry(BaseModel):
    event: str
    status: str
    email: Optional[str] = None
    detail: Optional[str] = None


class OtpRequest(BaseModel):
    mobile: str


class OtpVerify(BaseModel):
    mobile: str
    otp: str


class FaceSave(BaseModel):
    descriptor: List[float]


class AssistantChat(BaseModel):
    message: str
    userEmail: Optional[str] = OWNER_EMAIL


class CloneRequest(BaseModel):
    newBuilderName: str
    newOwnerEmail: str


class PublishUpdate(BaseModel):
    version: str
    whatsNew: str = "Your Assistant Added New Features"
    apkUrl: str = ""
    forceUpdate: bool = False
    appId: Optional[str] = None
    packageName: Optional[str] = None


# ---------------- Seed data ----------------
CORE_BLOCKS = [
    ("header", "Header", "layout"),
    ("banner", "Banner Carousel", "layout"),
    ("product_grid", "Product Grid", "commerce"),
    ("cart", "Cart", "commerce"),
    ("whatsapp", "WhatsApp Connect", "social"),
    ("review", "Reviews & Rating", "social"),
    ("video", "Video Player", "media"),
    ("image_gallery", "Image Gallery", "media"),
    ("mehndi", "Mehndi Designs Studio", "lifestyle"),
    ("trading_signal", "Trading Signals (Virtual)", "virtual"),
    ("ludo", "Ludo Tournament (Virtual)", "virtual"),
    ("dating_profile", "Dating Profiles", "social"),
    ("ride_booking", "Ride Booking", "services"),
    ("grocery", "Grocery Store", "commerce"),
    ("cloth_store", "Cloth Store", "commerce"),
    ("upi_payment", "UPI Payment", "payment"),
    ("razorpay", "Razorpay Gateway", "payment"),
    ("phonepe", "PhonePe Gateway", "payment"),
    ("payment_selector", "Payment Selector", "payment"),
    ("admob_banner", "AdMob Banner", "monetization"),
    ("admob_interstitial", "AdMob Interstitial", "monetization"),
    ("admob_rewarded", "AdMob Rewarded", "monetization"),
]

TEMPLATES = {
    "Kirana": ["header", "banner", "product_grid", "cart", "upi_payment", "whatsapp"],
    "Cloth": ["header", "banner", "cloth_store", "cart", "razorpay", "review"],
    "Mehndi": ["header", "mehndi", "image_gallery", "whatsapp", "review"],
    "Trading": ["header", "trading_signal", "banner", "admob_banner"],
    "Gaming": ["header", "ludo", "admob_rewarded", "banner"],
    "Dating": ["header", "dating_profile", "review", "admob_banner"],
    "Ride": ["header", "ride_booking", "upi_payment", "whatsapp"],
}

ILLEGAL_KEYWORDS = ["cash", "gambling", "betting", "real money", "teen patti", "satta", "casino"]


@app.on_event("startup")
async def seed():
    # blocks
    for bid, name, cat in CORE_BLOCKS:
        await db.blocks.update_one(
            {"blockId": bid},
            {"$setOnInsert": {
                "blockId": bid, "blockName": name, "category": cat,
                "blockCode": f"// {name} block component",
                "createdBy": OWNER_EMAIL, "createdAt": now_iso(),
            }},
            upsert=True,
        )
    # templates
    for tname, blocks in TEMPLATES.items():
        await db.templates.update_one(
            {"name": tname},
            {"$setOnInsert": {"name": tname, "blocks": blocks, "createdBy": OWNER_EMAIL}},
            upsert=True,
        )
    # globalConfig/payment
    await db.globalConfig.update_one(
        {"_key": "payment"},
        {"$setOnInsert": {
            "_key": "payment",
            "upiId": "Mahesh7503kumar@okicici",
            "razorpayKeyId": "rzp_test_1DP5mmOlF5G5ag",
            "razorpaySecret": "dummysecret1234567890",
            "razorpayEnabled": True,
            "phonepeMerchantId": "PHONEPE_MERCHANT_DUMMY",
            "adMobAppId": "ca-app-pub-3940256099942544~3347511713",
            "bannerAdUnitId": "ca-app-pub-3940256099942544/6300978111",
            "interstitialAdUnitId": "ca-app-pub-3940256099942544/1033173712",
            "rewardedAdUnitId": "ca-app-pub-3940256099942544/5224354917",
            "updatedBy": OWNER_EMAIL, "updatedAt": now_iso(),
        }},
        upsert=True,
    )
    # globalConfig/banner
    await db.globalConfig.update_one(
        {"_key": "banner"},
        {"$setOnInsert": {
            "_key": "banner", "text": "🎉 Welcome to Bharat App Builder — Powered by Your Assistant",
            "imageUrl": "", "link": "", "bgColor": "#7c3aed", "active": True,
        }},
        upsert=True,
    )
    # remoteConfig/main
    await db.remoteConfig.update_one(
        {"_key": "main"},
        {"$setOnInsert": {
            "_key": "main", "trading_enabled": True, "gaming_enabled": True,
            "dating_enabled": True, "mehndi_enabled": True, "ride_enabled": True,
            "cloth_enabled": True, "grocery_enabled": True,
        }},
        upsert=True,
    )
    # appUpdates initial
    if await db.appUpdates.count_documents({}) == 0:
        await db.appUpdates.insert_one({
            "version": "1.0.0", "latestVersion": "1.0.0",
            "apkUrl": "https://example.com/bharat-app-1.0.0.apk",
            "whatsNew": "Your Assistant Added New Features", "releaseDate": now_iso(),
            "forceUpdate": False, "by": OWNER_EMAIL,
        })
    # buildersRegistry main
    await db.buildersRegistry.update_one(
        {"builderId": "main"},
        {"$setOnInsert": {
            "builderId": "main", "builderName": "Bharat App Builder (Main)",
            "ownerEmail": OWNER_EMAIL, "originalOwner": OWNER_EMAIL,
            "status": "active", "price": 0, "createdAt": now_iso(),
            "cloneUrl": "/", "superAdminUrl": "/superadmin",
        }},
        upsert=True,
    )
    logger.info("Seed complete")


# ---------------- Meta ----------------
@api_router.get("/")
async def root():
    return {"message": "Bharat App Builder API", "assistant": ASSISTANT_NAME, "owner": OWNER_EMAIL}


@api_router.get("/meta")
async def meta():
    return {"owner": OWNER_EMAIL, "assistant": ASSISTANT_NAME, "appVersion": os.environ.get("APP_VERSION", "1.0.0")}


# ---------------- Blocks & templates ----------------
@api_router.get("/blocks")
async def get_blocks():
    docs = await db.blocks.find({}, {"_id": 0}).to_list(500)
    return docs


@api_router.post("/blocks")
async def create_block(payload: ConfigPayload):
    d = payload.data
    bid = d.get("blockId") or f"block_{int(datetime.now().timestamp()*1000)}"
    doc = {
        "blockId": bid, "blockName": d.get("blockName", bid),
        "blockCode": d.get("blockCode", ""), "category": d.get("category", "custom"),
        "createdBy": OWNER_EMAIL, "createdAt": now_iso(),
    }
    await db.blocks.update_one({"blockId": bid}, {"$set": doc}, upsert=True)
    return doc


@api_router.get("/templates")
async def get_templates():
    return await db.templates.find({}, {"_id": 0}).to_list(100)


# ---------------- Apps ----------------
@api_router.get("/apps")
async def list_apps():
    return await db.apps.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)


@api_router.get("/apps/{app_id}")
async def get_app(app_id: str):
    doc = await db.apps.find_one({"appId": app_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "App not found")
    return doc


def detect_illegal(text: str):
    low = (text or "").lower()
    return [k for k in ILLEGAL_KEYWORDS if k in low]


@api_router.post("/apps")
async def create_app(payload: AppCreate):
    app_id = str(int(datetime.now().timestamp() * 1000))
    illegal = detect_illegal(payload.appName + " " + json.dumps(payload.blocks))
    doc = {
        "appId": app_id, "appName": payload.appName, "blocks": payload.blocks,
        "createdBy": payload.createdBy, "createdAt": now_iso(),
        "owner": OWNER_EMAIL, "virtualOnly": True,
        "previewUrl": f"/preview/{app_id}", "banned": False,
        "illegalFlagged": len(illegal) > 0, "illegalKeywords": illegal,
    }
    await db.apps.insert_one(doc.copy())
    # privacy doc
    await db.privacy.update_one({"appId": app_id}, {"$set": {
        "appId": app_id, "content": "For Entertainment Only | Virtual Coins Only | No Real Money",
        "owner": OWNER_EMAIL, "createdAt": now_iso(),
    }}, upsert=True)
    return clean(doc)


@api_router.post("/apps/{app_id}/ban")
async def ban_app(app_id: str):
    await db.apps.update_one({"appId": app_id}, {"$set": {"banned": True, "bannedBy": OWNER_EMAIL}})
    await log_event("app_banned", "success", OWNER_EMAIL, app_id)
    return {"ok": True}


@api_router.delete("/apps/{app_id}")
async def delete_app(app_id: str):
    await db.apps.delete_one({"appId": app_id})
    return {"ok": True}


@api_router.get("/privacy/{app_id}")
async def get_privacy(app_id: str):
    doc = await db.privacy.find_one({"appId": app_id}, {"_id": 0})
    return doc or {"appId": app_id, "content": "For Entertainment Only | Virtual Coins Only | No Real Money"}


# ---------------- Global config / remote config / banner ----------------
@api_router.get("/config/{key}")
async def get_config(key: str):
    doc = await db.globalConfig.find_one({"_key": key}, {"_id": 0})
    if not doc:
        return {}
    doc.pop("_key", None)
    return doc


@api_router.post("/config/{key}")
async def set_config(key: str, payload: ConfigPayload):
    data = payload.data
    data["updatedBy"] = OWNER_EMAIL
    data["updatedAt"] = now_iso()
    await db.globalConfig.update_one({"_key": key}, {"$set": {**data, "_key": key}}, upsert=True)
    doc = await db.globalConfig.find_one({"_key": key}, {"_id": 0})
    doc.pop("_key", None)
    return doc


@api_router.get("/remote-config")
async def get_remote_config():
    doc = await db.remoteConfig.find_one({"_key": "main"}, {"_id": 0})
    if doc:
        doc.pop("_key", None)
    return doc or {}


@api_router.post("/remote-config")
async def set_remote_config(payload: ConfigPayload):
    await db.remoteConfig.update_one({"_key": "main"}, {"$set": {**payload.data, "_key": "main"}}, upsert=True)
    doc = await db.remoteConfig.find_one({"_key": "main"}, {"_id": 0})
    doc.pop("_key", None)
    return doc


@api_router.get("/banner")
async def get_banner():
    doc = await db.globalConfig.find_one({"_key": "banner"}, {"_id": 0})
    if doc:
        doc.pop("_key", None)
    return doc or {}


@api_router.post("/banner")
async def set_banner(payload: ConfigPayload):
    await db.globalConfig.update_one({"_key": "banner"}, {"$set": {**payload.data, "_key": "banner"}}, upsert=True)
    doc = await db.globalConfig.find_one({"_key": "banner"}, {"_id": 0})
    doc.pop("_key", None)
    return doc


# ---------------- App Updates / Publish / APK ----------------
@api_router.get("/app-updates/latest")
async def latest_update():
    doc = await db.appUpdates.find_one({}, {"_id": 0}, sort=[("releaseDate", -1)])
    return doc or {}


@api_router.post("/app-updates")
async def publish_update(payload: PublishUpdate):
    doc = {
        "version": payload.version, "latestVersion": payload.version,
        "apkUrl": payload.apkUrl, "whatsNew": payload.whatsNew,
        "releaseDate": now_iso(), "forceUpdate": payload.forceUpdate, "by": OWNER_EMAIL,
        "apkGenerated": bool(payload.appId), "appId": payload.appId,
        "packageName": payload.packageName, "generatedBy": OWNER_EMAIL,
    }
    await db.appUpdates.update_one({"version": payload.version}, {"$set": doc}, upsert=True)
    await log_event("update_published", "success", OWNER_EMAIL, payload.version)
    return doc


@api_router.post("/apk/generate-config")
async def apk_config(payload: ConfigPayload):
    app_name = payload.data.get("appName", "myapp")
    pkg = "com.bharat." + re.sub(r"[^a-z0-9]", "", app_name.lower()) or "com.bharat.app"
    steps = ["npm run build", "npx cap add android", "npx cap copy android", "npx cap open android"]
    return {
        "appName": app_name, "packageName": pkg, "steps": steps,
        "playStoreSteps": [
            "1. Generate APK Config Dabao",
            "2. Android Studio Me Build APK",
            "3. Play Console Pe Upload",
        ],
    }


# ---------------- Security logs ----------------
async def log_event(event, status, email=None, detail=None):
    await db.securityLogs.insert_one({
        "event": event, "status": status, "email": email,
        "detail": detail, "timestamp": now_iso(),
    })


@api_router.get("/security-logs")
async def get_logs():
    docs = await db.securityLogs.find({}, {"_id": 0}).sort("timestamp", -1).to_list(200)
    return docs


@api_router.post("/security-logs")
async def add_log(entry: LogEntry):
    await log_event(entry.event, entry.status, entry.email, entry.detail)
    return {"ok": True}


# ---------------- SuperAdmin 3-Lock ----------------
@api_router.post("/superadmin/verify-email")
async def verify_email(payload: ConfigPayload):
    email = payload.data.get("email", "")
    if email.strip().lower() != OWNER_EMAIL.lower():
        await log_event("email_lock", "failed", email, "intruder failed email_lock")
        raise HTTPException(403, f"Only Owner {OWNER_EMAIL}")
    await log_event("email_lock", "success", email, "email verified")
    return {"ok": True, "step": 2}


@api_router.post("/superadmin/send-otp")
async def send_otp(payload: OtpRequest):
    otp = f"{random.randint(100000, 999999)}"
    await db.superAdminOtps.update_one(
        {"mobile": payload.mobile},
        {"$set": {"mobile": payload.mobile, "otp": otp, "createdAt": now_iso(), "verified": False}},
        upsert=True,
    )
    logger.info(f"[CONSOLE OTP FALLBACK] Owner mobile {payload.mobile} OTP = {otp}")
    # Real SMS would go via Firebase; here we return the dummy OTP (console fallback).
    return {"ok": True, "mobile": payload.mobile, "devOtp": otp,
            "message": "OTP sent (console fallback). SMS quota simulated."}


@api_router.post("/superadmin/verify-otp")
async def verify_otp(payload: OtpVerify):
    rec = await db.superAdminOtps.find_one({"mobile": payload.mobile})
    if not rec or rec.get("otp") != payload.otp.strip():
        await log_event("real_sms_otp", "failed", OWNER_EMAIL, "wrong otp")
        raise HTTPException(403, "Invalid OTP")
    await db.superAdminOtps.update_one({"mobile": payload.mobile}, {"$set": {"verified": True}})
    await db.superAdminPhoneAuth.update_one(
        {"email": OWNER_EMAIL},
        {"$set": {"email": OWNER_EMAIL, "phoneNumber": payload.mobile,
                  "verified": True, "verifiedAt": now_iso()}},
        upsert=True,
    )
    await log_event("mobile_real_sms_verified", "success", OWNER_EMAIL, payload.mobile)
    return {"ok": True, "step": 3}


@api_router.get("/superadmin/face")
async def get_face():
    doc = await db.superAdminFaces.find_one({"email": OWNER_EMAIL}, {"_id": 0})
    return doc or {}


@api_router.post("/superadmin/face")
async def save_face(payload: FaceSave):
    await db.superAdminFaces.update_one(
        {"email": OWNER_EMAIL},
        {"$set": {"email": OWNER_EMAIL, "faceDescriptor": payload.descriptor, "savedAt": now_iso()}},
        upsert=True,
    )
    await log_event("face_id", "success", OWNER_EMAIL, "face enrolled/verified")
    return {"ok": True, "step": 4}


@api_router.post("/superadmin/face/fail")
async def face_fail():
    await log_event("face_id", "failed", OWNER_EMAIL, "face mismatch")
    return {"ok": True}


@api_router.post("/superadmin/login-success")
async def login_success():
    await log_event("super_admin_login", "success", OWNER_EMAIL, "3-Lock Passed")
    return {"ok": True}


# ---------------- Clone Builder Factory ----------------
@api_router.post("/clone-builder")
async def clone_builder(payload: CloneRequest):
    clone_id = re.sub(r"\s+", "_", payload.newBuilderName.strip().lower()) + f"_{int(datetime.now().timestamp()*1000)}"
    blocks = await db.blocks.find({}, {"_id": 0}).to_list(500)
    for b in blocks:
        await db.builders.insert_one({
            "builderId": clone_id, "coll": "blocks", "docId": b["blockId"],
            **b, "clonedFrom": "main", "clonedBy": OWNER_EMAIL, "cloneTime": now_iso(),
        })
    await db.superAdmins.update_one(
        {"email": payload.newOwnerEmail},
        {"$set": {
            "email": payload.newOwnerEmail, "builderId": clone_id,
            "builderName": payload.newBuilderName, "isOwner": True,
            "createdBy": OWNER_EMAIL, "createdAt": now_iso(), "role": "super_admin",
        }},
        upsert=True,
    )
    reg = {
        "builderId": clone_id, "builderName": payload.newBuilderName,
        "ownerEmail": payload.newOwnerEmail, "originalOwner": OWNER_EMAIL,
        "blocksCount": len(blocks), "status": "active", "price": 0,
        "createdAt": now_iso(), "cloneUrl": f"/builder/{clone_id}",
        "superAdminUrl": f"/builder/{clone_id}/superadmin",
    }
    await db.buildersRegistry.update_one({"builderId": clone_id}, {"$set": reg}, upsert=True)
    await log_event("builder_cloned", "success", OWNER_EMAIL, clone_id)
    return reg


@api_router.get("/builders-registry")
async def builders_registry():
    return await db.buildersRegistry.find({}, {"_id": 0}).sort("createdAt", -1).to_list(200)


@api_router.delete("/builders-registry/{builder_id}")
async def delete_builder(builder_id: str):
    await db.buildersRegistry.delete_one({"builderId": builder_id})
    await db.builders.delete_many({"builderId": builder_id})
    await db.superAdmins.delete_many({"builderId": builder_id})
    return {"ok": True}


# ---------------- Payments & wallet ----------------
@api_router.post("/payments")
async def create_payment(payload: ConfigPayload):
    d = payload.data
    d["createdAt"] = now_iso()
    d["owner"] = OWNER_EMAIL
    await db.payments.insert_one(d.copy())
    return clean(d)


@api_router.get("/payments")
async def list_payments():
    return await db.payments.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)


@api_router.get("/wallet/{user_id}")
async def get_wallet(user_id: str):
    doc = await db.wallet.find_one({"userId": user_id}, {"_id": 0})
    if not doc:
        doc = {"userId": user_id, "coins": 1000, "virtual": True}
        await db.wallet.insert_one(doc.copy())
    return clean(doc)


# ---------------- Analytics ----------------
@api_router.get("/analytics")
async def analytics():
    return {
        "appsCount": await db.apps.count_documents({}),
        "usersCount": await db.wallet.count_documents({}),
        "blocksCount": await db.blocks.count_documents({}),
        "buildersRegistryCount": await db.buildersRegistry.count_documents({}),
        "paymentsCount": await db.payments.count_documents({}),
        "bannedApps": await db.apps.count_documents({"banned": True}),
        "illegalFlagged": await db.apps.count_documents({"illegalFlagged": True}),
    }


# ---------------- Your Assistant (Gemini) ----------------
@api_router.post("/assistant/chat")
async def assistant_chat(payload: AssistantChat):
    all_blocks = await db.blocks.find({}, {"_id": 0, "blockCode": 0}).to_list(500)
    block_summary = [{"blockId": b["blockId"], "blockName": b["blockName"], "category": b["category"]} for b in all_blocks]
    illegal = detect_illegal(payload.message)

    system = (
        f"You are {ASSISTANT_NAME} inside Bharat App Builder. Owner is {OWNER_EMAIL}. "
        f"You ONLY build entertainment / virtual-coin apps. No real money, gambling or betting. "
        f"Reply with a SHORT friendly Hinglish sentence, then output an app definition. "
        f"Available blocks: {json.dumps(block_summary)}. "
        f"You MUST return ONLY valid JSON at the end wrapped in <json></json> tags with shape: "
        f'{{"appName": string, "blocks": [blockId,...], "reply": short string}}. '
        f"Choose blockIds ONLY from the available list."
    )
    reply_text = ""
    app_def = None
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"assistant_{payload.userEmail}",
                       system_message=system).with_model("gemini", "gemini-3-flash-preview")
        resp = await chat.send_message(UserMessage(text=payload.message))
        reply_text = resp if isinstance(resp, str) else str(resp)
        m = re.search(r"<json>(.*?)</json>", reply_text, re.DOTALL)
        raw = m.group(1) if m else reply_text
        raw = raw.strip().strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
        try:
            app_def = json.loads(raw)
        except Exception:
            jm = re.search(r"\{.*\}", raw, re.DOTALL)
            if jm:
                app_def = json.loads(jm.group(0))
    except Exception as e:
        logger.error(f"Assistant error: {e}")

    if not app_def or not isinstance(app_def, dict):
        # graceful fallback: pick blocks by keyword
        valid = {b["blockId"] for b in block_summary}
        chosen = [b for b in ["header", "banner", "product_grid", "cart", "upi_payment", "whatsapp"] if b in valid]
        app_def = {"appName": payload.message[:30] or "My App", "blocks": chosen,
                   "reply": "Maine aapke liye ek starter app banaya hai!"}

    valid_ids = {b["blockId"] for b in block_summary}
    blocks = [b for b in app_def.get("blocks", []) if b in valid_ids]
    if not blocks:
        blocks = ["header", "banner", "product_grid"]

    app_id = str(int(datetime.now().timestamp() * 1000))
    doc = {
        "appId": app_id, "appName": app_def.get("appName", "My App"), "blocks": blocks,
        "createdBy": payload.userEmail, "createdAt": now_iso(), "owner": OWNER_EMAIL,
        "virtualOnly": True, "previewUrl": f"/preview/{app_id}", "banned": False,
        "illegalFlagged": len(illegal) > 0, "illegalKeywords": illegal,
        "createdByAssistant": True,
    }
    await db.apps.insert_one(doc.copy())
    await db.chatHistory.insert_one({
        "userEmail": payload.userEmail, "message": payload.message,
        "reply": app_def.get("reply", reply_text[:200]), "appId": app_id, "at": now_iso(),
    })
    return {
        "reply": app_def.get("reply") or "App tayyar hai!",
        "appId": app_id, "appName": doc["appName"], "blocks": blocks,
        "previewUrl": doc["previewUrl"], "illegal": illegal,
    }


@api_router.get("/assistant/history")
async def assistant_history():
    return await db.chatHistory.find({}, {"_id": 0}).sort("at", -1).to_list(100)


# ---------------- Assistant: generate block code (Tab A) ----------------
@api_router.post("/assistant/generate-block")
async def generate_block(payload: AssistantChat):
    system = (
        f"You are {ASSISTANT_NAME}. Generate a small React block component. "
        f"Return JSON only: {{\"blockName\": string, \"category\": string, \"blockCode\": string}}."
    )
    block = None
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id="block_gen",
                       system_message=system).with_model("gemini", "gemini-3-flash-preview")
        resp = await chat.send_message(UserMessage(text=payload.message))
        txt = resp if isinstance(resp, str) else str(resp)
        jm = re.search(r"\{.*\}", txt, re.DOTALL)
        if jm:
            block = json.loads(jm.group(0))
    except Exception as e:
        logger.error(f"block gen error {e}")
    if not block:
        block = {"blockName": payload.message[:30], "category": "custom",
                 "blockCode": f"export const CustomBlock = () => <div>{payload.message}</div>;"}
    bid = f"block_{int(datetime.now().timestamp()*1000)}"
    doc = {"blockId": bid, "blockName": block.get("blockName", bid),
           "category": block.get("category", "custom"), "blockCode": block.get("blockCode", ""),
           "createdBy": OWNER_EMAIL, "createdAt": now_iso()}
    await db.blocks.update_one({"blockId": bid}, {"$set": doc}, upsert=True)
    return doc


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
