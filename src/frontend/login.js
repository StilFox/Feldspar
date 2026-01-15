
const Login = {};

Login.init_screen = function(){
	Screens.display('screenLoginWrapper');

	Resource.add_image_to_elm('gfx/loginscr', '#loginArea');
	Resource.add_image_to_elm('gfx/logo', '#loginLogo');
	Resource.add_image_to_elm('gfx/hud/buttons/loginu', '#loginButton');
	Resource.add_image_to_elm('gfx/hud/buttons/logind', '#loginButton:active');

	document.getElementById('loginButton').addEventListener('click', function(event){
		// Feldspar.attempt_login({
		// 	type: 'credentials',
		// 	username: document.getElementById('loginUsername').value,
		// 	password: document.getElementById('loginPassword').value
		// }).then(function(data){
		// 	console.log(data);
		// });

		TEST.three_init_test();
	});
}
