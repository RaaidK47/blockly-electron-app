const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,  // Disable nodeIntegration for security
            contextIsolation: true,  // Enable context isolation for security
            preload: path.join(__dirname, 'preload.js'),  // Preload script path
        }
    });

    win.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

// Handle the execCommand request from the renderer
ipcMain.handle('exec-command', async (event, command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }
            resolve(stdout);  // Return the command output
        });
    });
});
