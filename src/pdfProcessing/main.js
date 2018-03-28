const ipc = require("electron").ipcRenderer;

ipc.on("test", (event, message) => {
    alert("I did it! " + message)
});