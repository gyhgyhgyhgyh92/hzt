const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, safeStorage } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow = null
let tray = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 420,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  mainWindow.loadFile('index.html')
  
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'build/icons/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主界面', click: () => mainWindow.show() },
    { label: '设置', click: () => mainWindow.webContents.send('open-settings') },
    { label: '退出', click: () => app.quit() }
  ])
  tray.setToolTip('AI智能桌宠')
  tray.setContextMenu(contextMenu)
}

const initDataDir = () => {
  const dataDir = path.join(app.getPath('userData'), 'ai-pet')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const memoryFile = path.join(dataDir, 'memory.json')
  if (!fs.existsSync(memoryFile)) {
    fs.writeFileSync(memoryFile, JSON.stringify({
      conversations: [],
      userProfile: {},
      preferences: {}
    }, null, 2))
  }
  return dataDir
}

const SECURE_STORAGE_DIR = path.join(app.getPath('userData'), 'ai-pet-secure')

const ensureSecureStorageDir = () => {
  if (!fs.existsSync(SECURE_STORAGE_DIR)) {
    fs.mkdirSync(SECURE_STORAGE_DIR, { recursive: true })
  }
}

const getSecureFilePath = (key) => {
  ensureSecureStorageDir()
  const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(SECURE_STORAGE_DIR, `${sanitizedKey}.dat`)
}

const storeSecureData = (key, value) => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      return { success: false, error: '安全存储不可用' }
    }

    const encrypted = safeStorage.encryptString(value)
    const filePath = getSecureFilePath(key)
    fs.writeFileSync(filePath, encrypted)
    
    return { success: true }
  } catch (error) {
    console.error('Secure storage error:', error)
    return { success: false, error: error.message }
  }
}

const getSecureData = (key) => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      return { success: false, error: '安全存储不可用' }
    }

    const filePath = getSecureFilePath(key)
    if (!fs.existsSync(filePath)) {
      return { success: false, error: '密钥不存在' }
    }

    const encrypted = fs.readFileSync(filePath)
    const decrypted = safeStorage.decryptString(encrypted)
    
    return { success: true, value: decrypted }
  } catch (error) {
    console.error('Secure get error:', error)
    return { success: false, error: error.message }
  }
}

const deleteSecureData = (key) => {
  try {
    const filePath = getSecureFilePath(key)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return { success: true }
  } catch (error) {
    console.error('Secure delete error:', error)
    return { success: false, error: error.message }
  }
}

ipcMain.handle('secure-is-available', () => {
  return { available: safeStorage.isEncryptionAvailable() }
})

ipcMain.handle('secure-store', (event, { key, value }) => {
  return storeSecureData(key, value)
})

ipcMain.handle('secure-get', (event, { key }) => {
  return getSecureData(key)
})

ipcMain.handle('secure-delete', (event, { key }) => {
  return deleteSecureData(key)
})

ipcMain.handle('show-dialog', async (event, options) => {
  return await dialog.showMessageBox(mainWindow, options)
})

ipcMain.handle('get-user-data-path', () => {
  return path.join(app.getPath('userData'), 'ai-pet')
})

app.whenReady().then(() => {
  initDataDir()
  ensureSecureStorageDir()
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})