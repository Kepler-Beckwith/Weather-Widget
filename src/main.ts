import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

app.disableHardwareAcceleration();

const store = new Store();
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 280,
    height: 270, 
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      offscreen: false
    },
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00ffffff',
    hasShadow: false,
    roundedCorners: false,
    titleBarOverlay: {
      color: '#00ffffff',
      symbolColor: '#00ffffff'
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  const windowPosition = store.get('windowPosition');
  if (windowPosition) {
    mainWindow.setPosition(
      (windowPosition as number[])[0],
      (windowPosition as number[])[1]
    );
  }

  mainWindow.on('moved', () => {
    if (mainWindow) {
      const position = mainWindow.getPosition();
      store.set('windowPosition', position);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});