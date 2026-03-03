const { contextBridge, ipcRenderer } = require('electron');

// Secure IPC bridge — no direct Node.js access
contextBridge.exposeInMainWorld('electronAPI', {
    // Wallpaper mode
    getWallpaperMode: () => ipcRenderer.invoke('get-wallpaper-mode'),
    toggleWallpaperMode: () => ipcRenderer.invoke('toggle-wallpaper-mode'),
    toggleMiniMode: () => ipcRenderer.invoke('toggle-mini-mode'),

    // Listen for mode changes
    onWallpaperModeChanged: (callback) => {
        ipcRenderer.on('wallpaper-mode-changed', (_, isWallpaper) => callback(isWallpaper));
    },

    // Platform info
    platform: process.platform,
    isElectron: true,
});
