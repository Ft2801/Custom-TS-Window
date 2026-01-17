import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
let splash: BrowserWindow | null

const createSplashWindow = () => {
    splash = new BrowserWindow({
        width: 500,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        opacity: 0, // Start invisible
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    })
    splash.loadFile(path.join(process.env.DIST || '', '../splash.html'))

    // Fade in Splash
    splash.once('ready-to-show', () => {
        splash?.show()
        let opacity = 0
        const fadeIn = setInterval(() => {
            if (opacity < 1 && splash) {
                opacity += 0.1
                splash.setOpacity(opacity)
            } else {
                clearInterval(fadeIn)
            }
        }, 30)
    })
}

const bootstrap = () => {
    // 1. Show Splash Immediately
    createSplashWindow()
    const splashStartTime = Date.now()

    // 2. Create Main Window (Hidden)
    win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Hidden initially
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        opacity: 0, // Start invisible for fade-in
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        resizable: true,
        minWidth: 400,
        minHeight: 500,
        hasShadow: true,
    })

    win.setResizable(true) // Explicit call for certainty

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
        splash?.loadURL(`${process.env.VITE_DEV_SERVER_URL}splash.html`)
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
        splash?.loadFile(path.join(process.env.DIST || '', 'splash.html'))
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
        const fadeOutInterval = setInterval(() => {
            if (!win) {
                clearInterval(fadeOutInterval)
                return
            }
            if (win.getOpacity() > 0) {
                win.setOpacity(win.getOpacity() - 0.1)
            } else {
                clearInterval(fadeOutInterval)
                win.close()
            }
        }, 30) // Fast fade out on close
        // Fallback close just in case
        setTimeout(() => win?.close(), 500)
    })

    // Signal from Renderer that App is Ready
    ipcMain.on('app-ready', () => {
        const elapsed = Date.now() - splashStartTime
        const minDuration = 800 // Reduced to 800ms
        const delay = Math.max(0, minDuration - elapsed)

        setTimeout(() => {
            // Fade out Splash
            const fadeOutSplash = setInterval(() => {
                if (splash && splash.getOpacity() > 0) {
                    splash.setOpacity(splash.getOpacity() - 0.1)
                } else {
                    clearInterval(fadeOutSplash)
                    if (splash) {
                        splash.close()
                        splash = null
                    }

                    // Show Main Window
                    if (win) {
                        win.show()
                        win.focus()

                        // Fade in Main Window
                        let opacity = 0
                        win.setOpacity(0)
                        const fadeInMain = setInterval(() => {
                            if (opacity < 1) {
                                opacity += 0.05 // Slower fade in
                                win?.setOpacity(opacity)
                            } else {
                                clearInterval(fadeInMain)
                            }
                        }, 30)
                    }
                }
            }, 50) // Smooth fade out
        }, delay)
    })

    win.on('restore', () => {
        win?.webContents.send('window-restored')
    })

    win.on('maximize', () => {
        win?.webContents.send('window-maximized')
    })

    win.on('unmaximize', () => {
        win?.webContents.send('window-unmaximized')
    })

    // Custom Resize Handler for transparent windows (manual implementation)
    let resizing = false
    let resizeDir = ''
    let startBounds = { x: 0, y: 0, width: 0, height: 0 }
    let startCursor = { x: 0, y: 0 }

    ipcMain.on('start-resize', (_event, direction: string) => {
        if (!win) return
        resizing = true
        resizeDir = direction
        startBounds = win.getBounds()
        const screen = require('electron').screen
        startCursor = screen.getCursorScreenPoint()
    })

    // Poll cursor position while resizing
    const resizeInterval = setInterval(() => {
        if (!resizing || !win) return

        const screen = require('electron').screen
        const cursor = screen.getCursorScreenPoint()
        const dx = cursor.x - startCursor.x
        const dy = cursor.y - startCursor.y

        let { x, y, width, height } = startBounds
        const minW = 400, minH = 500

        if (resizeDir.includes('e')) width = Math.max(minW, startBounds.width + dx)
        if (resizeDir.includes('w')) { width = Math.max(minW, startBounds.width - dx); x = startBounds.x + dx }
        if (resizeDir.includes('s')) height = Math.max(minH, startBounds.height + dy)
        if (resizeDir.includes('n')) { height = Math.max(minH, startBounds.height - dy); y = startBounds.y + dy }

        win.setBounds({ x, y, width, height })
    }, 16) // ~60fps

    // Stop resizing on mouse up (global)
    const { globalShortcut } = require('electron')
    require('electron').powerMonitor // dummy to ensure electron is loaded

    // Listen for mouse up via renderer
    ipcMain.on('stop-resize', () => {
        resizing = false
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
