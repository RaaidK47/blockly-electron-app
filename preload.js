const fs = require('fs');
const path = require('path');
const { contextBridge , ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        send: (channel, message) => ipcRenderer.send(channel, message),
        once: (channel, listener) => ipcRenderer.once(channel, listener),
        removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener)
    },

    saveCSV: (csvContent, filePath) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, csvContent, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`File saved at ${filePath}`);
                }
            });
        });
    },

    ensureDirectoryExists: (dirPath) => {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(dirPath)) {
                fs.mkdir(dirPath, { recursive: true }, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    },

    execCommand: (command) => ipcRenderer.invoke('execute-command', command),

    getPath: () => path, // Expose the entire path module

   
});
