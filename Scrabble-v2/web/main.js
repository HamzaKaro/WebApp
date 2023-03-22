const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fetch = require("node-fetch");
const Store = require('electron-store');
const store = new Store();
let appWindow;
let chatWindow;

async function POST(endpoint, data) {
    const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json',
        },
    });
    return response.status;
}

function closeApplication() {
    appWindow.destroy();
    appWindow = null;
    app.quit();
}
function initWindow() {
    appWindow = new BrowserWindow({
        height: 800,
        width: 1000,
        focusable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    // Electron Build Path
    const path = `file://${__dirname}/dist/client/index.html`;
    appWindow.loadURL(path);

    appWindow.setMenuBarVisibility(false);

    appWindow.on('close', (event) => {
        event.preventDefault();
        dialog
            .showMessageBox({
                type: 'question',
                buttons: ['Annuler', "Fermer l'application"],
                cancelId: 1,
                defaultId: 0,
                title: "Fermer l'application",
                detail: "Voulez vous fermer l'application ?",
            })
            .then( async ({ response, checkboxChecked }) => {
                if (response) {
                    await POST('user/logout', { username: store.get('pseudo')});
                    closeApplication()
                }
            }).catch((error) => {
                console.log("La deconnexion lors de la fermeture de l'app ne s'est pas produite. Voici l'erreur :")
                 console.log(error);
                 closeApplication()});
    });
    appWindow.on('closed', function () {
        appWindow = null;
    });
}


app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});

ipcMain.on('open-chat-window', (event, data) => {
    store.set('pseudo', data.pseudo);
    store.set('email', data.email);
    store.set('avatar', data.avatar);
    store.set('preferences', data.preferences);
    const childWindow = new BrowserWindow({
        parent: appWindow,
        height: 600,
        width: 400,
        closable: false,
        fullscreenable: false,
        maximizable: false,
        resizable: false,
        // modal: false,
        focusable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    chatWindow = childWindow;
    // chatWindow.webContents.openDevTools();
    chatWindow.removeMenu();
    chatWindow.loadURL(`file://${__dirname}/dist/client/index.html#chat`);
    chatWindow.show();
});

ipcMain.on('get-user-info', (event, data) => {
    const pseudo = store.get('pseudo');
    const email = store.get('email');
    const avatar = store.get('avatar');
    const preferences = store.get('preferences');
    if (!pseudo || !email) return;
    const userInfo = { pseudo : pseudo, email: email, avatar: avatar, preferences: preferences };
    if (!chatWindow) return;
    chatWindow.send('set-user-info', userInfo);
});

ipcMain.on('close-chat-window', (event, data) => {
    if (!chatWindow) return;
    chatWindow.destroy();
});

// Events (socket) to send to the main window from the chat window
ipcMain.on('socket-event-to-main-window', (event, data) => {
    if (!appWindow) return;
    appWindow.send('socket-event-to-main-window', data)
});

// Events (electron) to send to the chat window from the main window
ipcMain.on('redirect-electron-event-to-chat-window', (event, data) => {
    if (!chatWindow) return;
    chatWindow.send(data.electronEvent, data.electronEventData)
});

ipcMain.on('get-friends', (event, data) => {
    if (!appWindow) return;
    appWindow.send('get-friends-to-chat-window', []);
});
