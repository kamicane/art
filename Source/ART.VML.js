/*
---

name: ART.VML

description: VML implementation for ART

provides: ART.VML

requires: ART.Base

...
*/

(function(){
	
var ARTNameSpace = 'art', ARTTag = 'canvas', namespaces = document.namespaces, sheet, dummy;

if (!namespaces) return;

namespaces.add(ARTNameSpace, 'urn:schemas-microsoft-com:vml');
sheet = document.createStyleSheet();
sheet.addRule(ARTTag, 'display:inline-block;position:relative;');
['shape', 'stroke', 'fill'].each(function(tag){
	sheet.addRule(ARTNameSpace + '\\:' + tag, 'behavior:url(#default#VML);display:inline-block;position:absolute;margin:-1px 0 0 -1px;');
});

dummy = document.createElement(ARTNameSpace + ':shape');
dummy.style.behavior = 'url(#default#VML)';

ART.VML = new Class({

	Extends: ART.Base,
	
	initialize: function(id, width, height){
		this.element = new Element(ARTTag, {'id': id || 'c-' + $time()});
		this.contextShape = null;
		this.drawingPath = [];
		this.precisionFactor = 10;
		if (width && height) this.resize({x: width, y: height});
		this.parent();
	},

	/* vml implementation */

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
		return this;
	},

	start: function(vector){
		var style, halfPixel = Math.floor(this.precisionFactor / 2);
		this.contextShape = this.createElement('shape');
		this.contextShape.coordorigin = halfPixel + ',' + halfPixel; // optimize for fills
		this.contextShape.coordsize = this.coordSize.x + ',' + this.coordSize.y;
		style = this.contextShape.style;
		style.width = '100%';
		style.height = '100%';
		this.drawingPath = [];
		return this.parent(vector);
	},

	join: function(){
		this.drawingPath.push('x');
		return this.parent();
	},

	moveTo: function(vector){
		var now = this.parent(vector);
		this.drawingPath.push('m' + ~~now.x + ',' + ~~now.y);
		return this;
	},

	lineTo: function(vector){
		var now = this.parent(vector);
		this.drawingPath.push('l' + ~~now.x + ',' + ~~now.y);
		return this;
	},

	bezierTo: function(c1, c2, end){
		var now = this.parent(c1, c2, end);
		this.drawingPath.push('c' + ~~now[0].x + ',' + ~~now[0].y + ',' + ~~now[1].x + ',' + ~~now[1].y + ',' + ~~now[2].x + ',' + ~~now[2].y);
		return this;
	},

	end: function(style){
		this.parent();
		style = this.sanitizeStyle(style);
		var stroke = this.createElement('stroke');
		var fill = this.createElement('fill');
		for (var key in style){
			var current = style[key];
			if (current == null) continue;
			switch (key){
				case 'fillColor':
					var stops = [], colors = {};
					switch ($type(current)){
						case 'object':
							for (var stop in current){
								stops.push(stop);
								colors[stop] = this.getColor(current[stop]);
							}
							break;
						case 'array':
							current.each(function(color, i, all){
								var stop = i / (all.length - 1);
								stops.push(stop);
								colors[stop] = this.getColor(color);
							}, this);
							break;
						default:
							colors[stops[0] = 0] = this.getColor(current);
							break;
					}
					stops.sort();
					var color1 = colors[stops.shift()], color2;
					fill.color = color1.color;
					fill.opacity = color1.alpha;
					if (stops.length){
						fill.type = 'gradient';
						fill.angle = 180;
						fill.method = 'none';
						color2 = colors[stops.pop()];
						fill.color2 = color2.color;
						// opacity2 doesn't seem to have any effect
						fill.opacity2 = color2.alpha;
						if (stops.length) fill.colors = stops.map(function(stop){
							return (stop * 100) + '% ' + colors[stop].color;
						}).join(', ');
					}
					break;
				case 'strokeColor':
					current = this.getColor(current);
					stroke.color = current.color;
					stroke.opacity = current.alpha;
					break;
				// can't be less than 1 full pixel
				case 'strokeWidth': stroke.width = Number(current); break;
				// butt => flat, round, square
				case 'strokeCap': stroke.endcap = (current == 'butt') ? 'flat' : current; break;
				// bevel, round, miter
				case 'strokeJoin': stroke.joinstyle = current; break;
				// UNIMPLEMENTED. For now.
				//case 'shadowColor': ctx.shadowColor = this.getSolidColor(current); break;
				//case 'shadowBlur': ctx.shadowBlur = Number(current); break;
				//case 'shadowOffsetX': ctx.shadowOffsetX = Number(current); break;
				//case 'shadowOffsetY': ctx.shadowOffsetY = Number(current); break;*/
			}
		}
		stroke.on = !!style.stroke;
		fill.on = !!style.fill;
		this.contextShape.appendChild(stroke);
		this.contextShape.appendChild(fill);
		var stretch = 'm' + this.contextShape.coordorigin + 'l' + this.contextShape.coordsize;
		this.contextShape.path = this.drawingPath.join('') + 'e' + stretch + 'nsnf';
		this.element.appendChild(this.contextShape);
		return this;
	},

	clear: function(){
		this.element.empty();
		return this;
	},

	/* privates */

	createElement: function(tag){
		return document.createElement(ARTNameSpace + ':' + tag);
	},

	getColor: function(color){
		var alpha = 1;
		switch ($type(color)){
			case 'object':
				for (var pos in color){
					color = color[pos];
					break;
				}
				break;
			case 'array':
				if (color.length) color = color[0];
				break;
		}
		if ($type(color) == 'color'){
			color = color.copy();
			alpha = color.get('alpha');
			color.set('alpha', 1);
		}
		return {
			color: color.valueOf(),
			alpha: alpha
		};
	},

	getUpdatedVector: function(vector){
		var v = this.parent(vector);
		v.x *= this.precisionFactor;
		v.y *= this.precisionFactor;
		return v;
	}

});


if (!!dummy.coordsize) ART.registerAdapter(ART.VML);
	
})();
