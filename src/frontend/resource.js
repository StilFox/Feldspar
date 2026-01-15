
const Resource = {};

Resource.add_image_to_elm = function(res, selector, image_index){
	Feldspar.load_resource(res).then(function(data){
		document.styleSheets[0].insertRule(selector + '{ background-image: url("' + data[image_index || 0].data.image + '"); }');
	});
}
