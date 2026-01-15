var import_map = document.createElement('script');
import_map.type = 'importmap';

import_map.text = JSON.stringify({
	imports: {
		three: (Feldspar.isPackaged() ? '../../../three.module.min.js' : '../../node_modules/three/build/three.module.js'),
		testing: './three-test-drawing.js'
	}
});

document.currentScript.parentNode.insertBefore(import_map, document.currentScript);
