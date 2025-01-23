const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let pythonProcess = null;

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

    // Launch the Python script to Start Websocket Server when the window is created
    pythonProcess = exec('python backend/websocket_server.py');

    // Handle the Python script's output
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });

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