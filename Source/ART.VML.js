/*
---

name: ART.VML

description: VML implementation for ART

authors: [Simo Kinnunen](http://twitter.com/sorccu), [Valerio Proietti](http://mad4milk.net)

provides: [ART.VML, ART.Group, ART.Shape]

requires: [ART, ART.Element, ART.Container, ART.Path]

...
*/

(function(){

try {
	
	var namespaces = document.namespaces;
	
	namespaces.add('av', 'urn:schemas-microsoft-com:vml');
	namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');

	var sheet = document.createStyleSheet();
	sheet.addRule('vml', 'display:inline-block;position:relative;overflow:hidden;');

	sheet.addRule('av\\:*', 'behavior:url(#default#VML);display:inline-block;position:absolute;width:100%;height:100%;left:0px;top:0px;');
	sheet.addRule('ao\\:*', 'behavior:url(#default#VML);');
	
} catch(e){

	return;

}

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

// VML Element Class

ART.VML.Element = new Class({
	
	Extends: ART.Element,
	
	initialize: function(tag){
		this.uid = (UID++).toString(16);
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
	},
	
	eject: function(){
		this.parent();
		this.width = this.height = null;
	},
	
	_transform: function(){
		var container = this.container;
		if (!container) return;
		var cw = container.width, ch = container.height, w = this.width, h = this.height;
		if (cw == null || ch == null || w == null || h == null) return;
		
		this.element.coordorigin = (precision) + ',' + (precision);
		this.element.coordsize = (cw * precision) + ',' + (ch * precision);
		
		this.children.each(function(child){
			child._transform();
		});
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
	
	/* transform */
	
	_transform: function(){
		var container = this.container;
		if (!container) return;
		
		var cw = container.width, ch = container.height, w = this.width, h = this.height;
		if (cw == null || ch == null || w == null || h == null) return;
	
		var p = precision, hp = p / 2;
		var ct = this.container.transform, cts = (ct) ? ct.scale : [1, 1], ctt = (ct) ? ct.translate : [0, 0], ctr = (ct) ? ct.rotate : [0, 0, 0];
		var ttt = this.transform.translate, tts = this.transform.scale, ttr = this.transform.rotate;
		
		var tx = ctt[0] + ttt[0], ty = ctt[1] + ttt[1];
		var sx = cts[0] * tts[0], sy = cts[1] * tts[1];
		
		var realX = tx / sx, realY = ty / sy;

		// translate + halfpixel
		this.element.coordorigin = (-(realX * p) - hp) + ',' + (-(realY * p) - hp);
		
		// scale
		this.element.coordsize = ((cw * p) / sx) + ',' + ((ch * p) / sy);
		
		//rotation
		this.element.rotation = 0;
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

// Assign to ART

ART.Shape = new Class({Extends: ART.VML.Shape});
ART.Group = new Class({Extends: ART.VML.Group});
ART.implement({Extends: ART.VML});
	
})();
