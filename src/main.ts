import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

const bootstrap = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false, // Frameless
        transparent: true, // Transparent for rounded corners
        backgroundColor: '#00000000', // Fully transparent
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }

    // IPC handlers for custom window controls
    ipcMain.on('window-minimize', () => {
        win?.minimize()
    })

    ipcMain.on('window-maximize', () => {
        if (win?.isMaximized()) {
            win.unmaximize()
        } else {
            win?.maximize()
        }
    })

    ipcMain.on('window-close', () => {
        win?.close()
    })

    win.on('restore', () => {
        win?.webContents.send('window-restored')
    })
}

app.whenReady().then(bootstrap)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        bootstrap()
    }
})
