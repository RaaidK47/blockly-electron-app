import asyncio
import websockets

import nest_asyncio

# Enable nested asyncio event loops
nest_asyncio.apply()

# Store the active WebSocket connections
active_connections = set()

# Handle incoming WebSocket connections
async def handle_connection(websocket, path):
    print("New connection established.")
    try:
        # Send a welcome message when a client connects
        await websocket.send("Welcome to the WebSocket server!")
        await websocket.send(str(active_connections))
        # print("Sent welcome message to the client.")
        # send_message("Test Message")
        # Continuously listen for messages from the client
        while True:
            try:
                pass
                # # Wait for a message from the client
                # message = await websocket.recv()
                # print(f"Received message: {message}")

            except websockets.exceptions.ConnectionClosed:
                print("Client disconnected.")
                break  # Exit the loop if the client disconnects

            # Send a message to the client every 5 minutes
            await asyncio.sleep(300)  # 300 seconds = 5 minutes
            await websocket.send("Hello from the server!")
            print("Sent periodic message to the client.")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        print("Connection closed.")

# Function to send a message to all active WebSocket clients
async def send_message(message):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    await _send_message(message)
    loop.close()

async def _send_message(message):
    for connection in active_connections:
        try:
            await connection.send(message)
            print(f"Sent message to client: {message}")
        except Exception as e:
            print(f"Error sending message to client: {e}")

            
# Main function to start the WebSocket server
async def main():
    # Set the ping timeout and interval to ensure the connection stays alive
    server = await websockets.serve(
        handle_connection,
        "localhost",
        8765,
        ping_interval=20,  # Send a ping every 20 seconds
        ping_timeout=20,   # Disconnect if no pong is received within 20 seconds
    )

    print("WebSocket server started. Waiting for connections...")

    # Keep the server running indefinitely
    await server.wait_closed()

# Start the server
if __name__ == "__main__":
    asyncio.run(main())