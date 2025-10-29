from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, List
import json
import asyncio
from ..services.cache_service import cache_service
from ..utils.logging import get_logger

logger = get_logger("websocket_price_stream")


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.subscriptions[client_id] = set()
        logger.info(
            f"Client {client_id} connected. Total connections: {len(self.active_connections)}"
        )

    def disconnect(self, client_id: str):
        """Remove a disconnected client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.subscriptions:
            del self.subscriptions[client_id]
        logger.info(
            f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}"
        )

    def subscribe(self, client_id: str, symbol: str):
        """Subscribe a client to a stock symbol"""
        if client_id in self.subscriptions:
            self.subscriptions[client_id].add(symbol)
            logger.info(f"Client {client_id} subscribed to {symbol}")

    def unsubscribe(self, client_id: str, symbol: str):
        """Unsubscribe a client from a stock symbol"""
        if client_id in self.subscriptions and symbol in self.subscriptions[client_id]:
            self.subscriptions[client_id].remove(symbol)
            logger.info(f"Client {client_id} unsubscribed from {symbol}")

    async def send_personal_message(self, message: str, client_id: str):
        """Send message to a specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                logger.error(f"Error sending to {client_id}: {e}")

    async def broadcast_price_update(self, symbol: str, price_data: dict):
        """Broadcast price update to all subscribers"""
        message = json.dumps(
            {"type": "price_update", "symbol": symbol, "data": price_data}
        )

        disconnected = []

        for client_id, symbols in self.subscriptions.items():
            if symbol in symbols and client_id in self.active_connections:
                try:
                    await self.active_connections[client_id].send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {client_id}: {e}")
                    disconnected.append(client_id)

        for client_id in disconnected:
            self.disconnect(client_id)

    async def send_heartbeat(self):
        """Send heartbeat to all connected clients"""
        message = json.dumps(
            {"type": "heartbeat", "timestamp": asyncio.get_event_loop().time()}
        )
        disconnected = []

        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Heartbeat failed for {client_id}: {e}")
                disconnected.append(client_id)

        for client_id in disconnected:
            self.disconnect(client_id)


manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint handler"""
    await manager.connect(client_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "subscribe":
                symbol = message.get("symbol")
                if symbol:
                    manager.subscribe(client_id, symbol)

                    cached_price = cache_service.get(f"price_{symbol}")
                    if cached_price:
                        await manager.send_personal_message(
                            json.dumps(
                                {
                                    "type": "price_update",
                                    "symbol": symbol,
                                    "data": cached_price,
                                }
                            ),
                            client_id,
                        )

            elif message.get("type") == "unsubscribe":
                symbol = message.get("symbol")
                if symbol:
                    manager.unsubscribe(client_id, symbol)

            elif message.get("type") == "ping":
                await manager.send_personal_message(
                    json.dumps({"type": "pong"}), client_id
                )

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(client_id)


async def start_heartbeat_task():
    """Background task to send periodic heartbeats"""
    while True:
        await asyncio.sleep(30)
        await manager.send_heartbeat()
