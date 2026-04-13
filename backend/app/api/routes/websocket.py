from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self._connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._connections.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self._connections:
            self._connections.remove(ws)

    async def broadcast(self, payload: dict) -> None:
        dead: list[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


# Hasar raporları için WS manager (mobilden gelen raporlar)
ws_manager = ConnectionManager()

# Deprem bildirimleri için ayrı WS manager
eq_ws_manager = ConnectionManager()


@router.websocket("/damage")
async def ws_damage(websocket: WebSocket):
    """STK paneline yeni hasar raporlarını gerçek zamanlı iletir."""
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@router.websocket("/earthquakes")
async def ws_earthquakes(websocket: WebSocket):
    """STK paneline yeni deprem bildirimlerini gerçek zamanlı iletir."""
    await eq_ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        eq_ws_manager.disconnect(websocket)
