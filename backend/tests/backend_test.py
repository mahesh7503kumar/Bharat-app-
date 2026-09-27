"""Backend tests for Bharat App Builder."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://payment-admob-hub.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
OWNER = "Mahesh7503kumar@gmail.com"


@pytest.fixture(scope="session")
def s():
    ses = requests.Session()
    ses.headers.update({"Content-Type": "application/json"})
    return ses


# --------- Meta / Blocks / Analytics / Config ---------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert "Bharat" in r.json().get("message", "")


def test_blocks_seeded(s):
    r = s.get(f"{API}/blocks")
    assert r.status_code == 200
    blocks = r.json()
    assert isinstance(blocks, list)
    assert len(blocks) >= 22
    ids = {b["blockId"] for b in blocks}
    for req in ["header", "upi_payment", "razorpay", "phonepe", "payment_selector",
                "admob_banner", "admob_interstitial", "admob_rewarded"]:
        assert req in ids


def test_analytics(s):
    r = s.get(f"{API}/analytics")
    assert r.status_code == 200
    data = r.json()
    for k in ["appsCount", "usersCount", "blocksCount", "buildersRegistryCount",
              "paymentsCount", "bannedApps", "illegalFlagged"]:
        assert k in data
        assert isinstance(data[k], int)
    assert data["blocksCount"] >= 22


def test_config_payment_defaults(s):
    r = s.get(f"{API}/config/payment")
    assert r.status_code == 200
    d = r.json()
    assert d.get("upiId") == "Mahesh7503kumar@okicici"
    assert d.get("razorpayKeyId", "").startswith("rzp_test_")
    assert d.get("adMobAppId", "").startswith("ca-app-pub-")


# --------- Assistant chat ---------
def test_assistant_chat_and_apps_flow(s):
    r = s.post(f"{API}/assistant/chat", json={"message": "TEST_ Kirana grocery app banao"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "reply" in data
    assert "appId" in data
    assert isinstance(data.get("blocks"), list) and len(data["blocks"]) > 0
    app_id = data["appId"]

    # GET /apps includes it
    r2 = s.get(f"{API}/apps")
    assert r2.status_code == 200
    assert any(a["appId"] == app_id for a in r2.json())

    # GET /apps/{id}
    r3 = s.get(f"{API}/apps/{app_id}")
    assert r3.status_code == 200
    assert r3.json()["appId"] == app_id

    # Ban then delete
    rb = s.post(f"{API}/apps/{app_id}/ban")
    assert rb.status_code == 200
    r_get = s.get(f"{API}/apps/{app_id}")
    assert r_get.json().get("banned") is True

    rd = s.delete(f"{API}/apps/{app_id}")
    assert rd.status_code == 200
    r_nf = s.get(f"{API}/apps/{app_id}")
    assert r_nf.status_code == 404


# --------- SuperAdmin 3-lock ---------
def test_superadmin_email_wrong(s):
    r = s.post(f"{API}/superadmin/verify-email", json={"data": {"email": "hacker@evil.com"}})
    assert r.status_code == 403


def test_superadmin_email_correct(s):
    r = s.post(f"{API}/superadmin/verify-email", json={"data": {"email": OWNER}})
    assert r.status_code == 200
    assert r.json().get("step") == 2


def test_superadmin_otp_flow(s):
    mobile = "9876543210"
    r = s.post(f"{API}/superadmin/send-otp", json={"mobile": mobile})
    assert r.status_code == 200
    otp = r.json().get("devOtp")
    assert otp and len(otp) == 6

    r_bad = s.post(f"{API}/superadmin/verify-otp", json={"mobile": mobile, "otp": "000000"})
    assert r_bad.status_code == 403

    r_ok = s.post(f"{API}/superadmin/verify-otp", json={"mobile": mobile, "otp": otp})
    assert r_ok.status_code == 200
    assert r_ok.json().get("step") == 3


def test_superadmin_face(s):
    r = s.post(f"{API}/superadmin/face", json={"descriptor": [0.1] * 128})
    assert r.status_code == 200
    assert r.json().get("step") == 4


# --------- Clone / registry ---------
def test_clone_builder_and_registry(s):
    name = f"TEST_Clone_{int(time.time())}"
    r = s.post(f"{API}/clone-builder", json={"newBuilderName": name, "newOwnerEmail": "test_clone@example.com"})
    assert r.status_code == 200
    reg = r.json()
    assert reg["builderName"] == name
    bid = reg["builderId"]

    r2 = s.get(f"{API}/builders-registry")
    assert r2.status_code == 200
    assert any(b["builderId"] == bid for b in r2.json())

    # cleanup
    s.delete(f"{API}/builders-registry/{bid}")


# --------- App updates & APK ---------
def test_publish_and_latest(s):
    v = f"9.9.{int(time.time()) % 1000}"
    r = s.post(f"{API}/app-updates", json={"version": v, "whatsNew": "TEST", "apkUrl": "http://x/y.apk"})
    assert r.status_code == 200
    r2 = s.get(f"{API}/app-updates/latest")
    assert r2.status_code == 200
    # latest is by releaseDate desc - just check it's populated
    assert r2.json().get("version")


def test_apk_generate_config(s):
    r = s.post(f"{API}/apk/generate-config", json={"data": {"appName": "MyKirana"}})
    assert r.status_code == 200
    d = r.json()
    assert d["packageName"].startswith("com.bharat.")
    assert isinstance(d["steps"], list) and len(d["steps"]) > 0


# --------- Remote config & banner ---------
def test_remote_config_get_post(s):
    r = s.get(f"{API}/remote-config")
    assert r.status_code == 200
    r2 = s.post(f"{API}/remote-config", json={"data": {"trading_enabled": False}})
    assert r2.status_code == 200
    assert r2.json().get("trading_enabled") is False
    # reset
    s.post(f"{API}/remote-config", json={"data": {"trading_enabled": True}})


def test_banner_get_post(s):
    r = s.get(f"{API}/banner")
    assert r.status_code == 200
    r2 = s.post(f"{API}/banner", json={"data": {"text": "TEST_banner"}})
    assert r2.status_code == 200
    assert r2.json().get("text") == "TEST_banner"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
