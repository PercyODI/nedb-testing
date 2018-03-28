// import {ipcRenderer} from 'electron'
let ipcRenderer = require("electron").ipcRenderer

ipcRenderer.on('test', (event, message) => {
    alert('I did it! ' + message)
})
