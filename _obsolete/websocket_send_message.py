import asyncio
import websockets

async def send_message_to_websocket(message):
  """Sends a message to the WebSocket server running on localhost port 8765.

  Args:
    message: The message to send to the server.

  Raises:
    ConnectionClosed: If the connection to the server is closed.
  """

  async with websockets.connect("ws://localhost:8765") as websocket:
    await websocket.send(message)
    # print(f"Sent message: {message}")

