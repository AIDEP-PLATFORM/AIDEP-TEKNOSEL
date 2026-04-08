# Firebase Admin SDK — Issue BE1-005
import firebase_admin
from firebase_admin import auth, credentials, messaging
from app.core.config import settings
_init = False
def _start():
    global _init
    if not _init:
        try:
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)
            _init = True
        except Exception as e:
            print(f"Firebase başlatılamadı: {e}")
def verify_id_token(token: str) -> dict:
    _start(); return auth.verify_id_token(token)
def send_fcm(token: str, title: str, body: str, data: dict = None) -> bool:
    try:
        _start()
        messaging.send(messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {}, token=token))
        return True
    except Exception: return False
