const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('Feldspar', {
	isPackaged: () => ipcRenderer.sendSync('isPackaged'),
	onNotification: (callback) => ipcRenderer.on('notification', (_event, message) => callback(message)),
	load_resource: (res_name) => ipcRenderer.invoke('load_resource', res_name),
	attempt_login: (settings) => ipcRenderer.invoke('attempt_login', settings)
});
