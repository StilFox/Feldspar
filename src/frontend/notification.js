
const Notification = {};
var active_timer = null;


Notification.display = function(text, display_length){
	if(active_timer !== null){
		clearTimeout(active_timer);
		active_timer = null;
	}
	document.getElementById('notificationText').innerText = text;
	document.getElementById('notificationWrapper').classList.remove('hidden');
	active_timer = setTimeout(function(){
		active_timer = null;
		document.getElementById('notificationWrapper').classList.add('hidden');
	}, display_length || 3000);
}
