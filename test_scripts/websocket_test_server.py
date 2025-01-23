import asyncio
import websockets

# Handle incoming WebSocket connections
async def handle_connection(websocket, path):
    print("New connection established.")
    try:
        # Send a welcome message when a client connects
        await websocket.send("Welcome to the WebSocket server!")
        print("Sent welcome message to the client.")

        # Continuously listen for messages from the client
        while True:
            try:
                # Wait for a message from the client
                message = await websocket.recv()
                print(f"Received message: {message}")

            except websockets.exceptions.ConnectionClosed:
                print("Client disconnected.")
                break  # Exit the loop if the client disconnects

    except Exception as e:
        print(f"Error: {e}")

    finally:
        print("Connection closed.")

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
