import asyncio
import websockets

async def send_messages(websocket):
    """Send messages to the server at 5-second intervals."""
    i = 0
    while True:
        message = f"Message #{i}"
        await websocket.send(message)
        print(f"Client sent: {message}")
        i += 1
        await asyncio.sleep(5)

async def connect():
    """Establish a WebSocket connection and start sending messages."""
    uri = "ws://localhost:8765"
    try:
        async with websockets.connect(uri, ping_interval=20, ping_timeout=20) as websocket:
            print(f"Connected to {uri}")

            # Receive and print the welcome message from the server
            welcome_message = await websocket.recv()
            print(f"Server: {welcome_message}")

            # Start sending messages
            await send_messages(websocket)

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {e}")
    except ConnectionRefusedError:
        print("Connection refused. Is the server running?")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(connect())