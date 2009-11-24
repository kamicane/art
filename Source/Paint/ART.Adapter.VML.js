/*
Script: ART.Adapter.VML.js

License:
	MIT-style license.
*/

ART.Adapter.VML = new Class({

	Extends: ART.Adapter,

	initialize: function(id, width, height){
		this.namespace = ART.Adapter.VML.namespace;
		this.tag = ART.Adapter.VML.tag;
		this.element = new Element(this.tag, {'id': id || 'c-' + $time()});
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
		style.width = size.x + 'px';
		style.height = size.y + 'px';
		this.size = size;
		this.coordSize = {
			x: size.x * this.precisionFactor,
			y: size.y * this.precisionFactor
		};
		return this;
	},

	start: function(vector){
		this.contextShape = this.createElement('shape');
		this.contextShape.coordorigin = '0,0';
		this.contextShape.coordsize = this.coordSize.x + ',' + this.coordSize.y;
		var style = this.contextShape.style;
		style.width = '100%';
		style.height = '100%';
		this.element.appendChild(this.contextShape);
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
		this.started = false;
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
		return this;
	},

	clear: function(){
		this.element.empty();
		return this;
	},

	/* privates */

	createElement: function(tag){
		return document.createElement(this.namespace + ':' + tag);
	},

	getColor: function(color){
		var alpha = 1;
		switch ($type(color)){
			case 'string':
				break;
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

ART.Adapter.VML.namespace = 'artvml';
ART.Adapter.VML.tag = 'avcanvas';

ART.Adapter.VML.prepare = function(){
	var ns = ART.Adapter.VML.namespace,
		namespaces = document.namespaces,
		sheet, dummy;
	if (!namespaces) return;
	if (!namespaces[ns]){
		namespaces.add(ns, 'urn:schemas-microsoft-com:vml');
		sheet = document.createStyleSheet();
		sheet.addRule(
			ART.Adapter.VML.tag,
			'display:inline-block;position:relative;');
		['shape', 'stroke', 'fill'].each(function(tag){
			sheet.addRule(
				ns + '\\:' + tag,
				'behavior:url(#default#VML);display:inline-block;position:absolute;margin:-1px 0 0 -1px;')
		});
	}
	dummy = document.createElement(ns + ':shape');
	dummy.style.behavior = 'url(#default#VML)';
	return !!dummy.coordsize;
};

ART.registerAdapter(ART.Adapter.VML, 0.5);