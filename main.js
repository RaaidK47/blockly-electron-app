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

    // Launch the Python script when the window is created
    pythonProcess = exec('python backend/websocket_server.py');

    win.on('closed', () => {
        // Ensure to kill the Python process when the window is closed
        if (pythonProcess) {
            pythonProcess.kill('SIGINT');  // Send SIGINT to gracefully stop the script
            console.log('Python script terminated');
        }
    });
}

// App initialization
app.whenReady().then(() => {
    createWindow();


});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle the command execution in the main process
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