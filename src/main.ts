import {app, BrowserWindow} from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import {enableLiveReload} from 'electron-compile'
import {ipcMain} from 'electron'

const isDevMode = process.execPath.match(/[\\/]electron/)
if (isDevMode) {
    enableLiveReload()
}

let window: Electron.BrowserWindow | null

const createWindow = async () => {
    window = new BrowserWindow({
        darkTheme: true,
        width: 1024,
        height: 768
    })
    window.loadURL(`file://${__dirname}/index.jade`)
    if (isDevMode) {
        await installExtension(VUEJS_DEVTOOLS)
        window.webContents.openDevTools({mode: 'bottom'})
    }

    window.on('closed', () => {
        window = null
    })

    ipcMain.on('testStart', (event, message) => {
        let newWindow = new BrowserWindow()
        newWindow.loadURL(`file://${__dirname}/pdfProcessing/index.html`)
        newWindow.webContents.on("did-finish-load", () => {
            newWindow.webContents.send("test", "This is a Test Message")
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
