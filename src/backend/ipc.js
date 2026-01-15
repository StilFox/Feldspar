const { app, ipcMain, BrowserWindow } = require('electron');
const Resource = require('./resource.js');
const Login = require('./login.js');


exports.init = function(){
	ipcMain.on('isPackaged', function(event){
		event.returnValue = app.isPackaged;
	});
	ipcMain.handle('load_resource', function(event, res_name){
		return new Promise(function(resolve, reject){
			Resource.load(res_name, resolve, reject);
		});
	});
	ipcMain.handle('attempt_login', function(event, settings){
		return new Promise(function(resolve){
			Login.attempt(settings, resolve);
		});
	});
}

exports.send_notification = function(message){
	var main_window = BrowserWindow.getAllWindows()[0]; // we only use the one window, so it'll always be the first result
	main_window.webContents.send('notification', message);
	console.log('[Notification] ' + message);
}
