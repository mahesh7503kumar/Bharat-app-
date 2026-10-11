import axios from "axios";

// --- Core App Exports ---
export const API = process.env.REACT_APP_API_URL || "/api";
export const APP_VERSION = "1.1.0";
export const BUILDER_VERSION = "61";
export const APP_NAME = "Bharat App Builder";
export const APP_DESCRIPTION = "Build apps without coding";

// --- API Exports ---
export const API_URL = "/api";
export const BASE_URL = "/api";

// --- Owner Exports ---
export const OWNER_EMAIL = "mahesh7503kumar@gmail.com";
export const OWNER_MOBILE = "7503";
export const OWNER_NAME = "Mahesh Kumar";

// --- Assistant Exports (ye abhi missing tha) ---
export const ASSISTANT_NAME = "Bharat AI";
export const ASSISTANT_ID = "bharat-assistant";
export const ASSISTANT_AVATAR = "/assistant.png";
export const ASSISTANT_ROLE = "assistant";
export const CHAT_MODEL = "gpt-4";
export const AI_NAME = "Bharat AI";
export const BOT_NAME = "Bharat AI";

// --- Other Common Exports jo aage error de sakte hain ---
export const APP_LOGO = "/logo.png";
export const COMPANY_NAME = "Bharat Builder";
export const SUPPORT_EMAIL = "support@bharatbuilder.com";
export const DEFAULT_THEME = "dark";
export const STORAGE_KEY = "bharat_builder";

const http = axios.create({ baseURL: API });

export function safeOrigin(){ try{return window.location.origin}catch{return ""} }
export function getApiBase(){ return API }
export function getBaseUrl(){ return API }

export const api = {
  meta: () => http.get("/meta").then(r=>r.data),
  blocks: () => http.get("/blocks").then(r=>r.data),
  createBlock: (d) => http.post("/blocks",{data:d}).then(r=>r.data),
  templates: () => http.get("/templates").then(r=>r.data),
  apps: () => http.get("/apps").then(r=>r.data),
  app: (id) => http.get(`/apps/${id}`).then(r=>r.data),
  createApp: (d) => http.post("/apps",d).then(r=>r.data),
  banApp: (id) => http.post(`/apps/${id}/ban`).then(r=>r.data),
  deleteApp: (id) => http.delete(`/apps/${id}`).then(r=>r.data),
  config: (k) => http.get(`/config/${k}`).then(r=>r.data),
  setConfig: (k,d) => http.post(`/config/${k}`,{data:d}).then(r=>r.data),
  remoteConfig: () => http.get("/remote-config").then(r=>r.data),
  setRemoteConfig: (d) => http.post("/remote-config",{data:d}).then(r=>r.data),
  banner: () => http.get("/banner").then(r=>r.data),
  setBanner: (d) => http.post("/banner",{data:d}).then(r=>r.data),
  latestUpdate: () => http.get("/app-updates/latest").then(r=>r.data),
  publishUpdate: (d) => http.post("/app-updates",d).then(r=>r.data),
  apkConfig: (d) => http.post("/apk/generate-config",{data:d}).then(r=>r.data),
  logs: () => http.get("/security-logs").then(r=>r.data),
  addLog: (e) => http.post("/security-logs",e).then(r=>r.data),
  verifyEmail: (e) => http.post("/superadmin/verify-email",{data:{email:e}}).then(r=>r.data),
  sendOtp: (m) => http.post("/superadmin/send-otp",{mobile:m}).then(r=>r.data),
  verifyOtp: (m,o) => http.post("/superadmin/verify-otp",{mobile:m,otp:o}).then(r=>r.data),
  getFace: () => http.get("/superadmin/face").then(r=>r.data),
  saveFace: (d) => http.post("/superadmin/face",{descriptor:d}).then(r=>r.data),
  faceFail: () => http.post("/superadmin/face/fail").then(r=>r.data),
  loginSuccess: () => http.post("/superadmin/login-success").then(r=>r.data),
  cloneBuilder: (n,e) => http.post("/clone-builder",{newBuilderName:n,newOwnerEmail:e}).then(r=>r.data),
  buildersRegistry: () => http.get("/builders-registry").then(r=>r.data),
  deleteBuilder: (id) => http.delete(`/builders-registry/${id}`).then(r=>r.data),
  payments: () => http.get("/payments").then(r=>r.data),
  createPayment: (d) => http.post("/payments",{data:d}).then(r=>r.data),
  wallet: (u) => http.get(`/wallet/${u}`).then(r=>r.data),
  analytics: () => http.get("/analytics").then(r=>r.data),
  assistantChat: (m,e) => http.post("/assistant/chat",{message:m,userEmail:e}).then(r=>r.data),
  assistantHistory: () => http.get("/assistant/history").then(r=>r.data),
  generateBlock: (m) => http.post("/assistant/generate-block",{message:m}).then(r=>r.data),
};
export default api;
