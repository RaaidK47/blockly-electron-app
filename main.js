const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const WebSocket = require('ws'); // Import WebSocket package

let pythonProcess = null;
let wss = null; // WebSocket server instance
let mainWindow = null;

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 900,
        webPreferences: {
            nodeIntegration: false,  // Disable nodeIntegration for security
            contextIsolation: true,  // Enable context isolation for security
            preload: path.join(__dirname, 'preload.js'),  // Preload script path
            sandbox: false // Temporarily disable sandboxing
        }
    });

    win.loadFile('src/index.html');

    // Store the mainWindow reference
    mainWindow = win;

    // You can now start the WebSocket server when the window is created
    startWebSocketServer();

    // // Launch the Python script to Start Websocket Server when the window is created
    // pythonProcess = exec('python backend/websocket_server.py');

    // // Handle the Python script's output
    // pythonProcess.stdout.on('data', (data) => {
    //     console.log(`Python Output: ${data}`);
    // });

    // pythonProcess.stderr.on('data', (data) => {
    //     console.error(`Python Error: ${data}`);
    // });

    // pythonProcess.on('close', (code) => {
    //     console.log(`Python process exited with code ${code}`);
    // });

}


// Start WebSocket server
function startWebSocketServer() {
    wss = new WebSocket.Server({ port: 8765 });

    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        
        // Send a welcome message when a client connects
        ws.send('Welcome to the WebSocket server!');

        // Handle incoming messages from the client
        ws.on('message', (message) => {

            console.log(`Received message: ${message}`);

            if (message instanceof Uint8Array) {
                // Decode the Uint8Array to a string
                message = new TextDecoder().decode(message);
                // console.log('WebSocket Message:', decodedMessage);
            }

            // Ensure message is a string before attempting to match
            if (typeof message === 'string') {
                try {
                    // Parse the message and extract blockId and status
                    const regex = /BlockID:\s*(.+?),\s*Block Status:\s*(success|error)/;
                    const match = message.match(regex);

                    if (match) {
                        const blockId = match[1]; // Block ID
                        const status = match[2];  // Block Status

                        // Send the block status to the main window (renderer process)
                        mainWindow.webContents.send('block-status', { blockId, status });
                    } else {
                        // If the message doesn't match the expected format, log a warning
                        console.warn('Invalid message format:', message);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            } else {
                // Log an error if the message is not a string
                console.error('Received message is not a string:', message);
            }
    

        });

        // Handle client disconnection
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    console.log('WebSocket server running on ws://localhost:8765');
}


// App initialization
app.whenReady().then(() => {
    createWindow();


});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {

        //  Run the websocket_close.py script before quitting the app
        // This closes the Websockets Created by Backend
         exec('python backend/websocket_close.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running websocket_close.py: ${error.message}`);
            } else if (stderr) {
                console.error(`Standard Error running websocket_close.py: ${stderr}`);
            } else {
                console.log('websocket_close.py script executed successfully');
            }
        });

        // Quitting the Application
        app.quit();
    }
});

// Handle the command execution in the main process
// This is used when you want to execute Commands from 'renderer.js'
ipcMain.handle('execute-command', async (event, command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Standard Error: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
});

// ipcMain.on('websocket-message', (event, message) => {
//     // Handle the incoming message
//     console.log('Received message from renderer:', message);

//     // Send a response back to the renderer
//     event.sender.send('websocket-message', 'Hello from main process!');
// });