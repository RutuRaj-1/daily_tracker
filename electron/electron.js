const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');

// ========== CONFIG ==========
const isDev = !app.isPackaged;
const WINDOW_CONFIG = {
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
};

let mainWindow = null;
let tray = null;
let isWallpaperMode = false;

// ========== PERFORMANCE ==========
// Disable background throttling for consistent updates
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
// Enable hardware acceleration
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

// ========== WINDOW CREATION ==========
function createMainWindow() {
    mainWindow = new BrowserWindow({
        ...WINDOW_CONFIG,
        frame: true,
        transparent: false,
        resizable: true,
        show: false, // Show after ready
        backgroundColor: '#f8fafc',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            // Performance
            backgroundThrottling: false,
            enableWebSQL: false,
        },
        // Icon
        icon: path.join(__dirname, '../public/favicon.ico'),
    });

    // Load app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    // Show when ready — prevents white flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Prevent closing — minimize to tray instead
    mainWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ========== WALLPAPER MODE ==========
function toggleWallpaperMode() {
    if (!mainWindow) return;

    isWallpaperMode = !isWallpaperMode;

    if (isWallpaperMode) {
        // Enter wallpaper mode
        const { width, height } = screen.getPrimaryDisplay().bounds;
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        mainWindow.setSkipTaskbar(true);
        mainWindow.setResizable(false);
        mainWindow.setMovable(false);
        mainWindow.setBounds({ x: 0, y: 0, width, height });
        mainWindow.setOpacity(0.95);
        mainWindow.blur(); // Prevent focus stealing
    } else {
        // Exit wallpaper mode
        mainWindow.setAlwaysOnTop(false);
        mainWindow.setSkipTaskbar(false);
        mainWindow.setResizable(true);
        mainWindow.setMovable(true);
        mainWindow.setSize(WINDOW_CONFIG.width, WINDOW_CONFIG.height);
        mainWindow.center();
        mainWindow.setOpacity(1.0);
        mainWindow.focus();
    }

    // Notify renderer
    mainWindow.webContents.send('wallpaper-mode-changed', isWallpaperMode);
}

// ========== MINI MODE ==========
function toggleMiniMode() {
    if (!mainWindow) return;

    const isMaximized = mainWindow.isMaximized();
    if (isMaximized || mainWindow.getSize()[0] > 500) {
        // Enter mini mode
        mainWindow.setAlwaysOnTop(true, 'floating');
        mainWindow.unmaximize();
        mainWindow.setSize(380, 600);
        mainWindow.setPosition(
            screen.getPrimaryDisplay().workAreaSize.width - 400,
            20
        );
    } else {
        // Exit mini mode
        mainWindow.setAlwaysOnTop(false);
        mainWindow.setSize(WINDOW_CONFIG.width, WINDOW_CONFIG.height);
        mainWindow.center();
    }
}

// ========== SYSTEM TRAY ==========
function createTray() {
    // Use a simple icon
    const iconPath = path.join(__dirname, '../public/favicon.ico');
    tray = new Tray(nativeImage.createFromPath(iconPath));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show FlowState', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
        { type: 'separator' },
        { label: 'Mini Mode', click: toggleMiniMode },
        { label: 'Wallpaper Mode', click: toggleWallpaperMode },
        { type: 'separator' },
        { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
    ]);

    tray.setToolTip('FlowState — Personal Execution Intelligence');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
        mainWindow?.show();
        mainWindow?.focus();
    });
}

// ========== IPC HANDLERS ==========
ipcMain.handle('get-wallpaper-mode', () => isWallpaperMode);
ipcMain.handle('toggle-wallpaper-mode', toggleWallpaperMode);
ipcMain.handle('toggle-mini-mode', toggleMiniMode);

// ========== APP LIFECYCLE ==========
app.whenReady().then(() => {
    createMainWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
        else mainWindow?.show();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    app.isQuitting = true;
});

// ========== AUTO-START ==========
// Set auto-launch on system boot
if (!isDev) {
    app.setLoginItemSettings({
        openAtLogin: true, // Launch automatically on Windows boot
        openAsHidden: true,
    });
}
