/*
---

name: ART

description: The heart of ART.

authors: [Valerio Proietti](http://mad4milk.net) && [MooTools development team](http://mootools.net/developers)

provides: ART

...
*/

/* # kappa */

Math.kappa = (4 * (Math.sqrt(2) - 1) / 3);

/* # ART */

var ART = new Class({
	
	style: {
		'fill': null,
		'fill-mode': 'vertical',
		'outline': null,
		'outline-width': 1,
		'outline-cap': 'round',
		'outline-join': 'round',
		'shadow': null,
		'shadow-blur': 0,
		'shadow-offset': {x: 0, y: 0}
	},
	
	initialize: function(options){
		options = options || {};
		if (!options.height) options.height = 240;
		if (!options.width) options.width = 320;
		if (!options.id) options.id = 'art-' + $time();
		var Adapter = (!options.adapter) ? ART.recoverAdapter() : options.adapter;
		
		if (!Adapter) new Error('No suitable adapter found.');
		
		this.adapter = new Adapter(options.id, options.width, options.height);
		
		this.stack = {global: []};
		this.global = {x: 0, y: 0};
		this.shift({x: 0, y: 0});
	},
	
	resize: function(vector){
		this.adapter.resize(vector);
		return this;
	},
	
	/* beginning a layer and ending a layer */
	
	start: function(vector){
		vector = vector || {x: 0, y: 0};

		this.started = true;
		
		this.stack.local = [];
		this.stack.pointer = [];

		this.local = {x: 0, y: 0};
		this.pointer = {x: 0, y: 0};
		this.adapter.start();
		return this.shift(vector);
	},
	
	end: function(style){
		this.started = false;
		this.adapter.end(this.sanitizeStyle(style));
		return this;
	},
	
	/* origin shifting */
	
	shift: function(vector){
		if (this.started){
			this.local = {x: this.local.x + vector.x, y: this.local.y + vector.y};
			this.moveBy({x: 0, y: 0});
		} else {
			this.global = {x: this.global.x + vector.x, y: this.global.y + vector.y};
		}
		
		return this;
	},
	
	/* states */
	
	save: function(){
		if (this.started){
			this.stack.pointer.push(this.pointer);
			this.stack.local.push(this.local);
		} else {
			this.stack.global.push(this.global);
		}
		
		return this;
	},
	
	restore: function(){
		if (this.started){
			var pointerVector = this.stack.pointer.pop();
			var localVector = this.stack.local.pop();
			this.local = localVector;
			this.moveTo(pointerVector);
		} else {
			var globalVector = this.stack.global.pop();
			this.global = globalVector;
		}
		
		return this;
	},
	
	join: function(){
		this.adapter.join();
		return this;
	},
	
	/* to methods */
	
	moveTo: function(vector){
		this.pointer = vector;
		this.adapter.move(this.updateVector(vector));
		return this;
	},
	
	lineTo: function(vector){
		this.updateVector(this.pointer);
		this.pointer = vector;
		this.adapter.line(this.updateVector(vector));
		return this;
	},

	bezierTo: function(c1, c2, end){
		this.updateVector(this.pointer);
		this.pointer = end;
		this.adapter.bezier(this.updateVector(c1), this.updateVector(c2), this.updateVector(end));
		return this;
	},
	
	/* by methods */
	
	moveBy: function(vector){
		return this.moveTo({x: this.pointer.x + vector.x, y: this.pointer.y + vector.y});
	},
	
	lineBy: function(vector){
		return this.lineTo({x: this.pointer.x + vector.x, y: this.pointer.y + vector.y});
	},
	
	bezierBy: function(c1, c2, end){
		var n = this.pointer;
		return this.bezierTo({x: c1.x + n.x, y: c1.y + n.y}, {x: c2.x + n.x, y: c2.y + n.y}, {x: end.x + n.x, y: end.y + n.y});
	},
	
	/* "protected" */
	
	updateVector: function(vector){
		return {x: this.global.x + this.local.x + vector.x, y: this.global.y + this.local.y + vector.y};
	},
	
	sanitizeStyle: function(style){
		var tSCC = {}, sCC = {}, p;
		for (p in this.style) tSCC[p.camelCase()] = this.style[p];

		for (p in style){
			var pCC = p.camelCase();
			if (pCC in tSCC) sCC[pCC] = style[p];
		}
		
		return $extend(tSCC, sCC);
	},
	
	/* $ */
	
	toElement: function(){
		return this.adapter.toElement();
	}
	
});

(function(){

var adapter = null;

ART.registerAdapter = function(klass){
	if (!adapter) adapter = klass;
	return ART;
};

ART.recoverAdapter = function(){
	return adapter;
};

})();
