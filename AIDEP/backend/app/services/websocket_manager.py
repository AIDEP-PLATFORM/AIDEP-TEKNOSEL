# WebSocket bağlantı yöneticisi + Redis pub/sub — Issue BE2-004, BE2-005
# Olaylar: damage_report_new | route_updated | volunteer_location | system_alert
from fastapi import WebSocket
class ConnectionManager:
    def __init__(self): self.active: dict[str, WebSocket] = {}
    async def connect(self, cid: str, ws: WebSocket):
        await ws.accept(); self.active[cid] = ws
    def disconnect(self, cid: str): self.active.pop(cid, None)
    async def broadcast(self, event: str, payload: dict):
        dead = []
        for cid, ws in self.active.items():
            try: await ws.send_json({"event": event, "payload": payload})
            except: dead.append(cid)
        for cid in dead: self.disconnect(cid)
ws_manager = ConnectionManager()
