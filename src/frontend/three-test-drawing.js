import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const plant_vars = {
	beetroot: {stages: 4, variants: 3, num: 5},
	carrot: {stages: 5, variants: 3, num: 4},
	flax: {stages: 4, variants: 3, num: 20},
	hemp: {stages: 5, variants: 3, num: 2},
	hops: {stages: 4, variants: 3, num: 4},
	onion: {stages: 4, variants: 3, num: 4},
	peas: {stages: 5, variants: 3, num: 4},
	pepper: {stages: 4, variants: 3, num: 3},
	poppy: {stages: 5, variants: 3, num: 10},
	pumpkin: {stages: 7, variants: 3, num: 1},
	tea: {stages: 4, variants: 3, num: 4},
	tobacco: {stages: 5, variants: 3, num: 2},
	wheat: {stages: 4, variants: 2, num: 20, rev: true},
	wine: {stages: 4, variants: 3, num: 2}
};


// setup pretend tiles for crops to grow on
const grid_width = 80;
const grid_height = 80;
const tiles = new Array(grid_width * grid_height);
const instances = new Array(9);
const matrix = new THREE.Matrix4();

var need_crops_update = true;
var instance_counts = new Array(instances.length); // this keeps track of how many of objects exist for each type of instanced sprite

// start crops at stage 1
for(var i = 0 ; i < tiles.length ; i++){
	tiles[i] = 4;
}


function test_update_crops(){
	need_crops_update = true;
	for(var i = 0 ; i < tiles.length ; i++){
		tiles[i]++;
		if(tiles[i] === 8){
			tiles[i] = 4;
		}
	}
}


export async function three_init_test(){
	Screens.display('screenGameWrapper');

	const scene = new THREE.Scene();
	scene.scale.set(1, 1, 1);

	const camera = new THREE.OrthographicCamera(innerWidth / -2, innerWidth / 2, innerHeight / 2, innerHeight / -2, 1, 1000);
	camera.position.z = 100;

	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas: document.getElementById('gameCanvas')
	});
	renderer.setSize(innerWidth, innerHeight);
	renderer.setClearColor(0x115511);
	renderer.setAnimationLoop(animate);


	var frames = 0;
	function animate(time){
		frames++;
		if(frames === 1){
			test_update_crops();
		}

		// make sure all of our instanced sprites have finished loading before we start drawing
		var loaded = true;
		for(var i = 0 ; i < instances.length ; i++){
			if(instances[i] == null){
				loaded = false;
			}
		}

		if(loaded === true && need_crops_update === true){
			need_crops_update = false;

			// reset the instanced sprite counts
			for(var i = 0 ; i < instance_counts.length ; i++){
				instance_counts[i] = 0;
			}

			for(var ty = 0 ; ty < grid_width ; ty++){
				for(var tx = 0 ; tx < grid_height ; tx++){
					var index = (ty * grid_width) + tx;
					if(tiles[index] !== undefined){
						var coord = map_to_screen({
							x: (tx * 11) - ((grid_width / 2) * 11),
							y: (ty * 11) - ((grid_height / 2) * 11)
						});

						// we'll draw the shadow first
						var shadow_x = coord.x - instances[8].neg_layer.cc.x + instances[8].image_layer.o.x;
						var shadow_y = coord.y + instances[8].neg_layer.cc.y - instances[8].image_layer.o.y;
						var shadow_z = (coord.y / -100) + (instances[8].image_layer.z / 100);

						matrix.setPosition(shadow_x, shadow_y, shadow_z);
						instances[8].setMatrixAt(instance_counts[8], matrix);
						instance_counts[8]++;

						// now lets draw the actual wheat strands
						var wheat_type = tiles[index];
						for(var i = 0 ; i < plant_vars.wheat.num ; i++){
							var random_x = (Math.random() * 22) - 11;
							var random_y = (Math.random() * 22) - 11;
							var strand_x = coord.x + random_x - instances[wheat_type].neg_layer.cc.x + instances[wheat_type].image_layer.o.x;
							var strand_y = coord.y + random_y + instances[wheat_type].neg_layer.cc.y - instances[wheat_type].image_layer.o.y;
							var strand_z = ((coord.y + random_y) / -100) + (instances[wheat_type].image_layer.z / 100);

							matrix.setPosition(strand_x, strand_y, strand_z);
							instances[wheat_type].setMatrixAt(instance_counts[wheat_type], matrix);
							instance_counts[wheat_type]++;
						}
					}
				}
			}

			for(var i = 0 ; i < instances.length ; i++){
				// we'll just mark everything for update for simplicity
				instances[i].count = instance_counts[i];
				instances[i].instanceMatrix.needsUpdate = true;
			}
		}
		renderer.render(scene, camera);
	}

	// update title
	setInterval(function(){
		var icounts = 0;
		for(var i = 0 ; i < instances.length ; i++){
			icounts += instances[i].count;
		}
		document.title = `Feldspar - FPS: ${frames}, Objects: ${icounts}`;
		frames = 0;
	}, 1000);


	// test resize
	window.addEventListener('resize', function(event){
		camera.left = -innerWidth / 2;
		camera.right = innerWidth / 2;
		camera.top = innerHeight / 2;
		camera.bottom = -innerHeight / 2;
		camera.updateProjectionMatrix();
		renderer.setSize(innerWidth, innerHeight);
	});

	// test zoom
	document.addEventListener('wheel', function(event){
		var amount = (scene.scale.x * 0.05);
		if(event.deltaY > 0){
			set_scene_zoom(scene.scale.x - amount);
		}else{
			set_scene_zoom(scene.scale.x + amount);
		}
	});

	// test reset zoom
	document.addEventListener('mousedown', function(event){
		if(event.button === 2){ set_scene_zoom(1); }
	});

	function set_scene_zoom(zoom){
		scene.scale.set(zoom, zoom, 1);
	}

	Feldspar.load_resource('gfx/terobjs/plants/wheat').then(async function(data){
		for(var i = 0 ; i < data.length ; i++){
			if(data[i].layer_type === 'image'){
				var instance_count;
				if(data[i].layer === 8){
					// shadow, we only need one of these per tile
					instance_count = tiles.length;
				}else{
					// wheat strand
					instance_count = tiles.length * plant_vars.wheat.num;
				}
				var imesh = await create_instanced_sprite(instance_count, data[i].data, data[9].data);
				instances[data[i].layer] = imesh;
				scene.add(imesh);
			}
		}
	});

	// add test house to see how it interacts with the wheat
	Feldspar.load_resource('gfx/arch/cabin-log-big').then(async function(data){
		var coord = map_to_screen({x: 0, y: 0});
		// cabin
		var imesh = await create_instanced_sprite(1, data[0].data, data[2].data);
		var x = coord.x - imesh.neg_layer.cc.x + imesh.image_layer.o.x;
		var y = coord.y + imesh.neg_layer.cc.y - imesh.image_layer.o.y;
		var z = (coord.y / -100) + (imesh.image_layer.z / 100);
		matrix.setPosition(x, y, z);
		imesh.setMatrixAt(0, matrix);
		imesh.count = 1;
		scene.add(imesh);
		// shadow
		var imesh = await create_instanced_sprite(1, data[1].data, data[2].data);
		var x = coord.x - imesh.neg_layer.cc.x + imesh.image_layer.o.x;
		var y = coord.y + imesh.neg_layer.cc.y - imesh.image_layer.o.y;
		var z = (coord.y / -100) + (imesh.image_layer.z / 100);
		matrix.setPosition(x, y, z);
		imesh.setMatrixAt(0, matrix);
		imesh.count = 1;
		scene.add(imesh);
	});
}

async function load_texture(path){
	const texture = await loader.loadAsync(path);
	texture.colorSpace = THREE.SRGBColorSpace;
	// other filter types here - https://threejs.org/docs/?q=center#Texture.magFilter
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	return texture;
}

async function create_instanced_sprite(max_count, image_layer, neg_layer){
	// Instance counts cannot be raised after initialization, so we need to set them to their max possible value first, then lower them
	//  - https://discourse.threejs.org/t/modified-three-instancedmesh-dynamically-instancecount/18124/10

	const texture = await load_texture(image_layer.image);
	delete image_layer.image; // don't need this anymore
	const geometry = new THREE.PlaneGeometry(texture.width, texture.height);
	geometry.translate(texture.width / 2, texture.height / -2, 0);

	const material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		alphaToCoverage: true
	});

	const imesh = new THREE.InstancedMesh(geometry, material, max_count);
	imesh.count = 0;
	imesh.image_layer = image_layer;
	imesh.neg_layer = neg_layer;
	return imesh;
}

function map_to_screen(coord){
	return {
		x: (coord.x * 2) - (coord.y * 2),
		y: coord.x + coord.y
	}
}
