/*
---

name: ART.VML

description: VML implementation for ART

authors: [Simo Kinnunen](http://twitter.com/sorccu), [Valerio Proietti](http://mad4milk.net)

provides: [ART.VML, ART.VML.Group, ART.VML.Shape]

requires: [ART, ART.Element, ART.Container, ART.Path]

...
*/

(function(){

var precision = 100, UID = 0;

// VML Base Class

ART.VML = new Class({

	Extends: ART.Element,
	Implements: ART.Container,
	
	initialize: function(width, height){
		this.element = document.createElement('vml');
		this.children = [];
		if (width != null && height != null) this.resize(width, height);
	},
	
	resize: function(width, height){
		this.width = width;
		this.height = height;
		var style = this.element.style;
		style.pixelWidth = width;
		style.pixelHeight = height;

		this.children.each(function(child){
			child._transform();
		});
		
		return this;
	},
	
	toElement: function(){
		return this.element;
	}
	
});

// VML Initialization

var styleSheet, styledTags = {}, styleTag = function(tag){
	if (styleSheet) styledTags[tag] = styleSheet.addRule('av\\:' + tag, 'behavior:url(#default#VML);display:inline-block;position:absolute;width:100%;height:100%;left:0px;top:0px;');
};

ART.VML.init = function(document){

	var namespaces = document.namespaces;
	if (!namespaces) return false;

	namespaces.add('av', 'urn:schemas-microsoft-com:vml');
	namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');

	styleSheet = document.createStyleSheet();
	styleSheet.addRule('vml', 'display:inline-block;position:relative;overflow:hidden;');
	styleTag('fill');
	styleTag('stroke');

	// sheet.addRule('ao\\:*', 'behavior:url(#default#VML);'); - Office extension elements currently not in use

	return true;

};

// VML Element Class

ART.VML.Element = new Class({
	
	Extends: ART.Element,
	
	initialize: function(tag){
		this.uid = (UID++).toString(16);
		if (!(tag in styledTags)) styleTag(tag);

		var element = this.element = document.createElement('av:' + tag);
		element.setAttribute('id', 'e' + this.uid);
		
		this.transform = {translate: [0, 0], scale: [1, 1], rotate: [0, 0, 0]};
	},
	
	/* dom */
	
	inject: function(container){
		this.eject();
		this.container = container;
		container.children.include(this);
		this._transform();
		this.parent(container);
		
		return this;
	},

	eject: function(){
		if (this.container){
			this.container.children.erase(this);
			this.container = null;
			this.parent();
		}
		return this;
	},

	/* transform */

	_transform: function(){
		var l = this.left || 0, t = this.top || 0,
		    w = this.width, h = this.height;
		
		if (w == null || h == null) return;
		
		var tn = this.transform,
			tt = tn.translate,
			ts = tn.scale,
			tr = tn.rotate;

		var cw = w, ch = h,
		    cl = l, ct = t,
		    pl = tt[0], pt = tt[1],
		    rotation = tr[0],
		    rx = tr[1], ry = tr[2];
		
		// rotation offset
		var theta = rotation / 180 * Math.PI,
		    sin = Math.sin(theta), cos = Math.cos(theta);
		
		var dx = w / 2 - rx,
		    dy = h / 2 - ry;
				
		pl -= cos * -(dx + l) + sin * (dy + t) + dx;
		pt -= cos * -(dy + t) - sin * (dx + l) + dy;
		
		// halfpixel
		cl += 0.5;
		ct += 0.5;
 
		// scale
		cw /= ts[0];
		ch /= ts[1];
		cl /= ts[0];
		ct /= ts[1];
 
		// transform into multiplied precision space		
		cw *= precision;
		ch *= precision;
		cl *= precision;
		ct *= precision;

		// check if Element is within a precision space
		// TODO: use av:group element as the root node so that elements are always placed in a precision space
		if (!(this.container instanceof ART.VML)){
			pl *= precision;
			pt *= precision;
			w *= precision;
			h *= precision;
		}
		
		var element = this.element;
		element.coordorigin = cl + ',' + ct;
		element.coordsize = cw + ',' + ch;
		element.style.left = pl;
		element.style.top = pt;
		element.style.width = w;
		element.style.height = h;
		element.style.rotation = rotation;
	},
	
	// transformations
	
	translate: function(x, y){
		this.transform.translate = [x, y];
		this._transform();
		return this;
	},
	
	scale: function(x, y){
		this.transform.scale = [x, y];
		this._transform();
		return this;
	},
	
	rotate: function(deg, x, y){
		if (x == null || y == null){
			var box = this.measure();
			x = box.left + box.width / 2; y = box.top + box.height / 2;
		}
		this.transform.rotate = [deg, x, y];
		this._transform();
		return this;
	},
	
	// visibility
	
	hide: function(){
		this.element.style.display = 'none';
		return this;
	},
	
	show: function(){
		this.element.style.display = '';
		return this;
	}
	
});

// VML Group Class

ART.VML.Group = new Class({
	
	Extends: ART.VML.Element,
	Implements: ART.Container,
	
	initialize: function(){
		this.parent('group');
		this.children = [];
	},
	
	/* dom */
	
	inject: function(container){
		this.parent(container);
		this.width = container.width;
		this.height = container.height;
		this._transform();
		return this;
	},
	
	eject: function(){
		this.parent();
		this.width = this.height = null;
		return this;
	}

});

// VML Base Shape Class

ART.VML.Base = new Class({

	Extends: ART.VML.Element,
	
	initialize: function(tag){
		this.parent(tag);
		var element = this.element;

		var fill = this.fillElement = document.createElement('av:fill');
		fill.on = false;
		element.appendChild(fill);
		
		var stroke = this.strokeElement = document.createElement('av:stroke');
		stroke.on = false;
		element.appendChild(stroke);
	},
	
	/* styles */
	
	fill: function(flag){
		var fill = this.fillElement;

		if (flag == null){
			fill.on = false;
		} else {
			var color1 = Color.detach(arguments[0]);
			fill.color = color1[0];
			fill.opacity = color1[1];
			
			if (arguments.length > 1){
				fill.method = 'none';
				fill.type = 'gradient';
				var color2 = Color.detach(arguments[arguments.length - 1]);
				fill.angle = 180; //TODO angle
				fill.color2 = color2[0];
				fill['ao:opacity2'] = color2[1];
			} else {
				fill.color2 = null;
				fill['ao:opacity2'] = null;
			}
			
			fill.on = true;
		}

		return this;
	},
	
	stroke: function(flag, width, cap, join){
		var stroke = this.strokeElement;
		
		stroke.weight = (width != null) ? width : 1;
		stroke.endcap = (cap != null) ? ((cap == 'butt') ? 'flat' : cap) : 'round';
		stroke.joinstyle = (join != null) ? join : 'round';

		if (flag == null){
			stroke.on = false;
		} else {
			var color = Color.detach(arguments[0]);
			stroke.color = color[0];
			stroke.opacity = color[1];
			stroke.on = true;
		}
		return this;
	}

});

// VML Shape Class

ART.VML.Shape = new Class({

	Extends: ART.VML.Base,
	
	initialize: function(path){
		this.parent('shape');
		if (path != null) this.draw(path);
	},
	
	// SVG to VML
	
	draw: function(path){
		
		path = this.currentPath = new ART.Path(path);
		var vml = path.toVML(precision), size = path.measure();
		
		this.right = size.right;
		this.bottom = size.bottom;
		this.top = size.top;
		this.left = size.left;
		this.height = size.height;
		this.width = size.width;
		
		this._transform();

		this.element.path = vml + 'e';
		return this;
	},
	
	measure: function(){
		return new ART.Path(this.currentPath).measure();
	}

});
	
})();
