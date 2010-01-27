/*
---

name: ART.VML

description: VML implementation for ART

author: [Simo Kinnunen](http://twitter.com/sorccu)

provides: ART.VML

requires: ART

...
*/

ART.VML = new Class({
	
	initialize: function(id, width, height){
		this.element = new Element('canvas', {'id': id || 'c-' + $time()});
		this.precisionFactor = 10;
		this.halfPixel = Math.floor(this.precisionFactor / 2);
		this.resize({x: width, y: height});
	},

	resize: function(size){
		this.clear(); // for canvas compatibility
		var style = this.element.style;
		style.pixelWidth = size.x;
		style.pixelHeight = size.y;
		this.size = size;
		this.coordSize = {
			x: size.x * this.precisionFactor,
			y: size.y * this.precisionFactor
		};
	},
	
	clear: function(){
		this.element.innerHTML = '';
	},

	start: function(){
		this.currentShape = document.createElement('av:shape');
		this.currentShape.coordorigin = this.halfPixel + ',' + this.halfPixel; // optimize for fills
		this.currentShape.coordsize = this.coordSize.x + ',' + this.coordSize.y;
		var style = this.currentShape.style;
		style.width = '100%';
		style.height = '100%';
		this.currentPath = [];
	},
	
	end: function(style){
		
		this.outline(style.outline, style.outlineWidth, style.outlineCap, style.outlineJoin);
		
		var fill = $splat(style.fill);
		this.fill(fill[0], fill[1], style.fillMode);
		
		if (style.shadow != null) this.shadow(style.shadow, style.shadowOffset, style.shadowBlur);
		
		var stretch = 'm' + this.currentShape.coordorigin + 'l' + this.currentShape.coordsize;
		this.currentShape.path = this.currentPath.join('') + 'e' + stretch + 'nsnf';
		this.element.appendChild(this.currentShape);
	},

	join: function(){
		this.currentPath.push('x');
	},

	move: function(vector){
		var p = this.precisionFactor;
		this.currentPath.push('m' + ~~(vector.x * p) + ',' + ~~(vector.y * p));
	},

	line: function(vector){
		var p = this.precisionFactor;
		this.currentPath.push('l' + ~~(vector.x * p) + ',' + ~~(vector.y * p));
	},

	bezier: function(c1, c2, end){
		var p = this.precisionFactor;
		this.currentPath.push('c' + ~~(c1.x * p) + ',' + ~~(c1.y * p) + ',' + ~~(c2.x * p) + ',' + ~~(c2.y * p) + ',' + ~~(end.x * p) + ',' + ~~(end.y * p));
	},
	
	/* styles */
	
	fill: function(color1, color2, mode){
		var fill = document.createElement('av:fill'), on = false;

		if (color1 != null){
			
			color1 = new Color(color1);
			var opacity1 = color1.get('alpha');
			fill.color = color1.set('alpha', 1).toString();
			fill.opacity = opacity1;
			
			if (color2 != null){
				fill.method = 'none';
				fill.type = 'gradient';
				var angle;
				if (mode == 'horizontal') angle = 270;
				else if (mode == 'vertical') angle = 180;
				fill.angle = angle;
				
				color2 = new Color(color2);
				var opacity2 = color2.get('alpha');
				fill.color2 = color2.set('alpha', 1).toString();
				fill['ao:opacity2'] = opacity2;
			}

			on = true;
		}
		
		fill.on = on;
		this.currentShape.appendChild(fill);
	},
	
	outline: function(color, width, cap, join){
		var outline = document.createElement('av:stroke'), on = false;
		
		if (color != null){
			
			if (width == null) width = 1;
			if (cap == null) cap = 'round';
			if (join == null) join = 'round';
			
			outline.weight = width;
			outline.endcap = (cap == 'butt') ? 'flat' : cap;
			outline.joinstyle = join;

			color = new Color(color);
			outline.color = color.copy().set('alpha', 1).toString();
			outline.opacity = color.get('alpha');

			on = true;
		}

		outline.on = on;
		this.currentShape.appendChild(outline);
	},
	
	shadow: function(color, offset, blur){
		// The VML shadow element works correctly in terms of offsets, opacity and color. However, it does not support blur.
		if (blur != 0) return;
		var shadow = document.createElement('av:shadow');
		color = new Color(color);
		var alpha = color.get('alpha');
		shadow.color = color.set('alpha', 1).toString();
		shadow.opacity = alpha;
		shadow.offset = offset.x + 'px,' + offset.y + 'px';
		shadow.on = true;
		this.currentShape.appendChild(shadow);
	},
	
	/* $ */
	
	toElement: function(){
		return this.element;
	}

});

// create XMLNS

(function(){
	
var namespaces = document.namespaces;

if (namespaces == null) return;

namespaces.add('av', 'urn:schemas-microsoft-com:vml');
namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');

var sheet = document.createStyleSheet();
sheet.addRule('canvas', 'display:inline-block;position:relative;');

sheet.addRule('av\\:*', 'behavior:url(#default#VML);display:inline-block;position:absolute;');
sheet.addRule('ao\\:*', 'behavior:url(#default#VML);');

ART.registerAdapter(ART.VML);
	
})();
