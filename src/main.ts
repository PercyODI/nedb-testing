import { app, BrowserWindow } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { enableLiveReload } from 'electron-compile'
import { ipcMain } from 'electron'
import { isNullOrUndefined } from 'util'

const isDevMode = process.execPath.match(/[\\/]electron/)
if (isDevMode) {
    enableLiveReload()
}

let window: Electron.BrowserWindow | null
let newWindow: Electron.BrowserWindow | null

const createWindow = async () => {
    window = new BrowserWindow({
        darkTheme: true,
        width: 1024,
        height: 768
    })
    window.loadURL(`file://${__dirname}/index.jade`)
    if (isDevMode) {
        await installExtension(VUEJS_DEVTOOLS)
        window.webContents.openDevTools({ mode: 'bottom' })
    }

    window.on('closed', () => {
        window = null
    })
    ipcMain.on('loadPdf', (event, message) => {
        if (!isNullOrUndefined(newWindow)) {
            console.log('sending to newWindow')
            newWindow.webContents.send('loadPdf', message)
        }
    })
    ipcMain.on('testStart', (event, message) => {
        newWindow = new BrowserWindow()
        newWindow.loadURL(`file://${__dirname}/pdfProcessing/index.html`)
        newWindow.on('closed', () => {
            newWindow = null
        })
        newWindow.webContents.on('did-finish-load', () => {
            if (!isNullOrUndefined(window)) {
                window.webContents.send('windowReady')
            }
        })
        ipcMain.on('pdfCanvas', (event, canvas: HTMLCanvasElement) => {
            if (!isNullOrUndefined(window)) {
                window.webContents.send('pdfCanvas', canvas)
            }
        })
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (window === null) {
        createWindow()
    }
})
