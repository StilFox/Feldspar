
const Screens = {};

Screens.display = function(screen){
	var screens = document.getElementsByClassName('screen');
	for(var i = 0 ; i < screens.length ; i++){
		if(screens[i].id === screen){
			// display this screen
			screens[i].classList.remove('hidden');
		}else{
			// hide the rest
			screens[i].classList.add('hidden');
		}
	}
}
