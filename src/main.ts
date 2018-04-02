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
let allWindows: Electron.BrowserWindow[] = []

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
    allWindows.push(window)

    newWindow = new BrowserWindow()
    newWindow.loadURL(`file://${__dirname}/pdfProcessing/index.html`)
    allWindows.push(newWindow)

    window.on('closed', () => {
        allWindows = allWindows.filter(win => window != null && win.id != window.id)
        window = null
    })
    newWindow.on('closed', () => {
        allWindows = allWindows.filter(win => newWindow != null && win.id != newWindow.id)
        newWindow = null
    })

    ipcMain.on('asyncMessage', (event, ipcMessage: {ipcName: string, message: any}) => {
        console.log(`Sending Message ${ipcMessage.ipcName} to ${allWindows.map(win => win.id)}`)
        allWindows.forEach(win => {
            win.webContents.send(ipcMessage.ipcName, ipcMessage.message)
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
