const { app, BrowserWindow, Menu } = require('electron')

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true
        }
    })
/*
    var menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {label:'Exit'}
            ],
        },
        {
            label: 'Aide',
            submenu: [
                {label:'Mode d\'emploi'},
                {label:'À propos'}
            ],
        }
    ])
    Menu.setApplicationMenu(menu);*/

    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})