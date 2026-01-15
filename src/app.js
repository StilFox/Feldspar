const { app, session, BrowserWindow, Menu } = require('electron');
const path = require('node:path');
const IPC = require('./backend/ipc.js');
const homedir = ensure_home_dir(require('os').homedir());

global.feldspar_dir = path.join(homedir, '.feldspar');


function ensure_home_dir(dir){
	if(dir == null || dir.length <= 0){
		console.error("Couldn't find a valid home directory..?" + '\n' + dir);
		process.exit(1);
	}else{
		return dir;
	}
}

const menu_template = [
	...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
	{
		label: 'View',
		submenu: [
			{ role: 'togglefullscreen' },
			{ type: 'separator' },
			{ role: 'zoomIn' },
			{ role: 'zoomOut' },
			{ role: 'resetZoom' },
			{ type: 'separator' },
			{ role: 'toggleDevTools' }
		]
	}
];
const custom_menu = Menu.buildFromTemplate(menu_template);
Menu.setApplicationMenu(custom_menu);

const create_window = function(){
	const main_window = new BrowserWindow({
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		}
	});
	main_window.menuBarVisible = false;
	main_window.loadFile(path.join(__dirname, 'frontend/client.html'));
	if(app.isPackaged === false){
		main_window.maximize();
		main_window.webContents.openDevTools();
	}
};

app.on('web-contents-created', function(event, contents){
	contents.on('will-navigate', function(event, navigation_url){
		// prevent navigating away from the client
		console.log('Prevented the window from navigating to: ' + navigation_url);
		event.preventDefault();
	});
});

app.on('window-all-closed', function(){
	app.quit();
});

app.whenReady().then(function(){

	// setup content security policy (CSP)
	session.defaultSession.webRequest.onHeadersReceived(function(details, callback){
		// can check policy with - https://csp-evaluator.withgoogle.com/
		const csp = [];
		csp.push("default-src 'none'");
		// these hashes are used for the importmap which is created dynamically at runtime
		// the first hash is the checksum before packaging, the second is after packaging
		csp.push("script-src 'self' 'sha256-X6iiidHozmwG1vSWnwAtCZ76JdOGaEUDQp0URe30JTQ=' 'sha256-UanxxfqkbQYY8WDiIJ+4+Xp6X605wVj0XnThQkrHpPo='");
		csp.push("style-src 'self'");
		csp.push("img-src 'self' data:");
		csp.push("worker-src 'self' blob:");
		csp.push("connect-src 'self' data:");
		callback({
			responseHeaders: {
				...details.responseHeaders,
				'Content-Security-Policy': [ csp.join(';') ]
			}
		});
	});

	// setup inter process communication (IPC)
	IPC.init();

	// create the window
	create_window();
});
