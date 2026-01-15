import * as TEST from 'testing';
window.TEST = TEST;


Feldspar.load_resource('gfx/hud/curs/arw').then(function(data){
	var offset = {
		x: data[0].data.cc.x,
		y: data[0].data.cc.y
	};
	document.styleSheets[0].insertRule(`body{ cursor: url("${data[1].data.image}") ${offset.x} ${offset.y}, auto; }`);
});

Feldspar.onNotification(function(message){
	Notification.display(message);
	console.log('[Notification] ' + message);
});

Login.init_screen();
