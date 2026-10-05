import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const OWNER_EMAIL = process.env.REACT_APP_OWNER_EMAIL || "Mahesh7503kumar@gmail.com";
export const ASSISTANT_NAME = "Your Assistant";
export const APP_VERSION = process.env.REACT_APP_VERSION || "1.1.1";

const http = axios.create({ baseURL: API });

export function safeOrigin() {
  try {
    return window.location.origin;
  } catch (e) {
    return BACKEND_URL || "";
  }
}

export const api = {
  meta: () => http.get("/meta").then((r) => r.data),
  blocks: () => http.get("/blocks").then((r) => r.data),
  createBlock: (data) => http.post("/blocks", { data }).then((r) => r.data),
  templates: () => http.get("/templates").then((r) => r.data),
  apps: () => http.get("/apps").then((r) => r.data),
  app: (id) => http.get(`/apps/${id}`).then((r) => r.data),
  createApp: (data) => http.post("/apps", data).then((r) => r.data),
  banApp: (id) => http.post(`/apps/${id}/ban`).then((r) => r.data),
  deleteApp: (id) => http.delete(`/apps/${id}`).then((r) => r.data),
  config: (key) => http.get(`/config/${key}`).then((r) => r.data),
  setConfig: (key, data) => http.post(`/config/${key}`, { data }).then((r) => r.data),
  remoteConfig: () => http.get("/remote-config").then((r) => r.data),
  setRemoteConfig: (data) => http.post("/remote-config", { data }).then((r) => r.data),
  banner: () => http.get("/banner").then((r) => r.data),
  setBanner: (data) => http.post("/banner", { data }).then((r) => r.data),
  latestUpdate: () => http.get("/app-updates/latest").then((r) => r.data),
  publishUpdate: (data) => http.post("/app-updates", data).then((r) => r.data),
  apkConfig: (data) => http.post("/apk/generate-config", { data }).then((r) => r.data),
  logs: () => http.get("/security-logs").then((r) => r.data),
  addLog: (entry) => http.post("/security-logs", entry).then((r) => r.data),
  verifyEmail: (email) => http.post("/superadmin/verify-email", { data: { email } }).then((r) => r.data),
  sendOtp: (mobile) => http.post("/superadmin/send-otp", { mobile }).then((r) => r.data),
  verifyOtp: (mobile, otp) => http.post("/superadmin/verify-otp", { mobile, otp }).then((r) => r.data),
  getFace: () => http.get("/superadmin/face").then((r) => r.data),
  saveFace: (descriptor) => http.post("/superadmin/face", { descriptor }).then((r) => r.data),
  faceFail: () => http.post("/superadmin/face/fail").then((r) => r.data),
  loginSuccess: () => http.post("/superadmin/login-success").then((r) => r.data),
  cloneBuilder: (newBuilderName, newOwnerEmail) =>
    http.post("/clone-builder", { newBuilderName, newOwnerEmail }).then((r) => r.data),
  buildersRegistry: () => http.get("/builders-registry").then((r) => r.data),
  deleteBuilder: (id) => http.delete(`/builders-registry/${id}`).then((r) => r.data),
  payments: () => http.get("/payments").then((r) => r.data),
  createPayment: (data) => http.post("/payments", { data }).then((r) => r.data),
  wallet: (userId) => http.get(`/wallet/${userId}`).then((r) => r.data),
  analytics: () => http.get("/analytics").then((r) => r.data),
  assistantChat: (message, userEmail) =>
    http.post("/assistant/chat", { message, userEmail }).then((r) => r.data),
  assistantHistory: () => http.get("/assistant/history").then((r) => r.data),
  generateBlock: (message) => http.post("/assistant/generate-block", { message }).then((r) => r.data),
};
