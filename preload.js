const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API for the renderer to run commands
contextBridge.exposeInMainWorld('electron', {
    execCommand: (command) => ipcRenderer.invoke('exec-command', command)
});
