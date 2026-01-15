const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const cavebulb = require('@stil-fox/cavebulb');
const IPC = require('./ipc.js');


const download_queue = [];
var is_downloading = false;

function load(res_name, resolve, reject){
	var filepath = path.join(global.feldspar_dir, 'cache/res', res_name) + '.cached';

	fs.readFile(filepath, function(error, data){
		if(error){
			if(error.code === 'ENOENT'){
				// we don't have this resource file cached yet, so lets download it
				download_queue.unshift({
					res_name: res_name,
					filepath: filepath,
					resolve: resolve,
					reject: reject
				});
				if(is_downloading === false){
					// start downloading
					download_assets();
				}
			}else{
				// some other type of read error, maybe a permissions issue or something?
				reject(error);
			}
		}else{
			var parsed = cavebulb.decode(data);
			// before we pass the parsed data to the front end, lets convert all image buffers into data urls
			for(var i = 0 ; i < parsed.length ; i++){
				if(parsed[i].layer_type === 'image'){
					parsed[i].data.image = `data:image/png;base64,${parsed[i].data.image.toString('base64')}`;
				}
			}
			resolve(parsed);
		}
	});
}
exports.load = load;

function download_assets(){
	if(download_queue.length > 0){
		is_downloading = true;

		var next = download_queue.splice(0, 1)[0];
		IPC.send_notification('Downloading: ' + next.res_name);
		var res_url = 'http://legacy.havenandhearth.com/res/' + next.res_name + '.res';

		if(fs.existsSync(path.dirname(next.filepath)) === false){
			// the directory doesn't exist yet, lets create it quickly
			fs.mkdirSync(path.dirname(next.filepath), { recursive: true });
		}

		const file = fs.createWriteStream(next.filepath);

		http.get(res_url, function(response){
			response.pipe(file);
			file.on('finish', function(){
				file.close(function(){
					setTimeout(function(){
						// file downloaded successfully, we can go back to loading it now
						load(next.res_name, next.resolve, next.reject);
						// and start the next download
						download_assets();
					}, 0);
				});
			});
		}).on('error', function(error){
			fs.unlink(next.filepath, function(){
				console.error('Error downloading resource: ', next.res_name);
				next.reject(error);

				// I guess we'll just quietly move on for now...
				setTimeout(function(){ download_assets(); }, 0);
			});
		});

	}else{
		// nothing left in the queue to download
		is_downloading = false;
	}
}
