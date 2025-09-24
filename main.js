const { app, BrowserWindow, ipcMain, dialog, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let settingsWindow;
let currentSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsPerCycle: 4,
  alwaysOnTop: false
};

const settingsPath = path.join(__dirname, 'settings.json');

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 180,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hidden',
    frame: false,
    trafficLightPosition: { x: -1000, y: -1000 },
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 350,
    height: 360,
    resizable: false,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hidden',
    frame: false,
    trafficLightPosition: { x: -1000, y: -1000 },
    show: false
  });

  settingsWindow.loadFile('settings.html');

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// Load settings from file
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      currentSettings = { ...currentSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings to file
function saveSettings(settings) {
  try {
    currentSettings = { ...currentSettings, ...settings };
    fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 2));
    
    // Apply always on top setting to main window
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(currentSettings.alwaysOnTop);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

app.whenReady().then(() => {
  loadSettings();
  createMainWindow();
  
  // Apply always on top setting after window is created
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(currentSettings.alwaysOnTop);
  }

  // Create menu
  const template = [
    {
      label: 'Pomodoro 95',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: createSettingsWindow
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('show-settings', () => {
  createSettingsWindow();
});

ipcMain.handle('get-settings', () => {
  return currentSettings;
});

ipcMain.handle('save-settings', (event, settings) => {
  const success = saveSettings(settings);
  if (success && mainWindow) {
    // Notify the main window that settings have been updated
    mainWindow.webContents.send('settings-updated', currentSettings);
  }
  return success;
});

// Handle notification requests from renderer
ipcMain.handle('show-notification', (event, { title, body, icon }) => {
  if (Notification.isSupported()) {
    // Use the proper icon path for the built app
    const iconPath = icon || path.join(process.resourcesPath, 'icon', 'windows-95-icon.png');
    
    const notification = new Notification({
      title: title,
      body: body,
      icon: iconPath,
      silent: false
    });
    
    notification.show();
    return true;
  }
  return false;
});
