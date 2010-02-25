/*
---

name: ART.SVG

description: SVG implementation for ART

authors: [Valerio Proietti](http://mad4milk.net)

provides: [ART.SVG, ART.Group, ART.Shape]

requires: [ART, ART.Element, ART.Container]

...
*/

(function(){
	
var implementation = document.implementation;
if (!implementation || !implementation.hasFeature || !document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) return;
	
var NS = 'http://www.w3.org/2000/svg', XLINK = 'http://www.w3.org/1999/xlink', UID = 0, createElement = function(tag){
	return document.createElementNS(NS, tag);
};

// SVG Base Class

ART.SVG = new Class({

	Extends: ART.Element,
	Implements: ART.Container,

	initialize: function(width, height){
		var element = this.element = createElement('svg');
		element.setAttribute('xmlns', NS);
		element.setAttribute('version', 1.1);
		var defs = this.defs = createElement('defs');
		element.appendChild(defs);
		this.resize(width, height);
	},

	resize: function(width, height){
		var element = this.element;
		element.setAttribute('width', width);
		element.setAttribute('height', height);
		return this;
	}

});

// SVG Element Class

ART.SVG.Element = new Class({
	
	Extends: ART.Element,

	initialize: function(tag){
		this.uid = (UID++).toString(16);
		var element = this.element = createElement(tag);
		element.setAttribute('id', 'e' + this.uid);
		this.transform = {translate: [0, 0], scale: [1, 1], rotate: [0, 0, 0]};
	},
	
	// get bounding box
	
	getBBox: function(){
		return this.element.getBBox();
	},
	
	/* transforms */
	
	_writeTransform: function(){
		var transforms = [];
		for (var transform in this.transform) transforms.push(transform + '(' + this.transform[transform].join(',') + ')');
		this.element.setAttribute('transform', transforms.join(' '));
	},
	
	rotate: function(deg, x, y){
		if (x == null || y == null){
			var box = this.getBBox();
			x = box.x + box.width / 2; y = box.y + box.height / 2;
		}
		this.transform.rotate = [deg, x, y];
		this._writeTransform();
		return this;
	},

	scale: function(x, y){
		this.transform.scale = [x, y];
		this._writeTransform();
		return this;
	},

	translate: function(x, y){
		this.transform.translate = [x, y];
		this._writeTransform();
		return this;
	},
	
	// visibility
	
	hide: function(){
		this.element.setAttribute('display', 'none');
		return this;
	},
	
	show: function(){
		this.element.setAttribute('display', '');
		return this;
	}
	
});

// SVG Group Class

ART.SVG.Group = new Class({
	
	Extends: ART.SVG.Element,
	Implements: ART.Container,
	
	initialize: function(){
		this.parent('g');
		this.defs = createElement('defs');
		this.element.appendChild(this.defs);
	}
	
});

// SVG Base Shape Class

ART.SVG.Base = new Class({
	
	Extends: ART.SVG.Element,

	initialize: function(tag){
		this.parent(tag);
		this.fill();
		this.stroke();
	},
	
	/* insertions */
	
	inject: function(container){
		this.eject();
		this.container = container;
		this._injectGradient('fill');
		this._injectGradient('stroke');
		this.parent(container);
		return this;
	},
	
	eject: function(){
		if (this.container){
			this.parent();
			this._ejectGradient('fill');
			this._ejectGradient('stroke');
			this.container = null;
		}
		return this;
	},
	
	_injectGradient: function(type){
		if (!this.container) return;
		var gradient = this[type + 'Gradient'];
		if (gradient) this.container.defs.appendChild(gradient);
	},
	
	_ejectGradient: function(type){
		if (!this.container) return;
		var gradient = this[type + 'Gradient'];
		if (gradient) this.container.defs.removeChild(gradient);
	},
	
	/* styles */
	
	_createGradient: function(type, colors){
		var gradient = createElement('linearGradient');
		//TODO angle calculation from angle argument
		var coords = {x1: '0%', x2: '0%', y1: '0%', y2: '100%'};
		for (var c in coords) gradient.setAttribute(c, coords[c]);
		
		var id = type + '-gradient-e' + this.uid;
		
		gradient.setAttribute('id', id);

		this[type + 'Gradient'] = gradient;
		
		for (var i = 0; i < colors.length; i++){
			var stop = createElement('stop'), color = Color.detach(colors[i]);
			stop.setAttribute('offset', i / (colors.length - 1));
			stop.setAttribute('stop-color', color[0]);
			stop.setAttribute('stop-opacity', color[1]);
			gradient.appendChild(stop);
		}
		
		this._injectGradient(type);
		return 'url(#' + id + ')';
	},
	
	_setColor: function(type, color){
		var element = this.element;
		if (color.length > 1){
			color = this._createGradient(type, color);
		} else {
			color = Color.detach(color[0]);
			element.setAttribute(type + '-opacity', color[1]);
			color = color[0];
		}
		
		element.setAttribute(type, color);
	},

	fill: function(flag){
		this._ejectGradient('fill');
		this.fillGradient = null;
		if (flag == null) this.element.setAttribute('fill', 'none');
		else this._setColor('fill', Array.slice(arguments));
		return this;
	},

	stroke: function(flag, width, cap, join){
		this._ejectGradient('stroke');
		var element = this.element;
		this.strokeGradient = null;
		
		element.setAttribute('stroke-width', (width != null) ? width : 1);
		element.setAttribute('stroke-linecap', (cap != null) ? cap : 'round');
		element.setAttribute('stroke-linejoin', (join != null) ? join : 'round');
		
		if (flag == null) element.setAttribute('stroke', 'none');
		else this._setColor('stroke', [flag]);
		return this;
	}
	
});

// SVG Shape Class

ART.SVG.Shape = new Class({
	
	Extends: ART.SVG.Base,
	
	initialize: function(path){
		this.parent('path');
		if (path != null) this.draw(path);
	},
	
	draw: function(path){
		this.element.setAttribute('d', path.toString());
		return this;
	}

});

// Assign to ART

ART.Shape = new Class({Extends: ART.SVG.Shape});
ART.Group = new Class({Extends: ART.SVG.Group});
ART.implement({Extends: ART.SVG});

})();
