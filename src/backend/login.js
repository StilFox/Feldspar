
exports.attempt = function(settings, resolve){
	if(settings.type === 'credentials'){
		Rustroot.attempt_credential_login({
			username: settings.username,
			password: settings.password
		}, function(error, session_cookie){
			if(error){
				console.error(error);
				resolve('Not good..');
			}else{
				console.log('Login successful!\nGot token: ' + session_cookie);
				resolve(session_cookie);
			}
		});
	}else{
		throw Error('Unsupported login type: ' + settings.type);
		resolve('Not good..');
	}
}
