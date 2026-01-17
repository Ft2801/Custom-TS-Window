import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    onRestore: (callback: () => void) => ipcRenderer.on('window-restored', callback),
    onMaximize: (callback: () => void) => ipcRenderer.on('window-maximized', callback),
    onUnmaximize: (callback: () => void) => ipcRenderer.on('window-unmaximized', callback),
    appReady: () => ipcRenderer.send('app-ready'),
    startResize: (direction: string) => ipcRenderer.send('start-resize', direction),
    stopResize: () => ipcRenderer.send('stop-resize'),
})
