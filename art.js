// art.js

// Graphic adapters

var ART = function(){};

// Adapters NS

ART.Adapters = {};

// Canvas adapter

ART.Adapters.Canvas = new Class({
	
	style: {
		'fill': null,
		'stroke': null,
		'stroke-width': 1,
		'stroke-cap': 'round',
		'stroke-join': 'round',
		'shadow-color': null,
		'shadow-blur': 0,
		'shadow-offset-x': 0,
		'shadow-offset-y': 0
	},
	
	initialize: function(id, width, height){
		this.element = new Element('canvas', {'id': id || 'c-' + $time()});
		this.context = this.element.getContext('2d');
		this.resize(width, height);
	},
	
	resize: function(x, y){
		this.element.width = x || 0;
		this.element.height = y || 0;
	},
	
	getUpdatedCursor: function(x, y){
		return {x: this.cursor.x + x, y: this.cursor.y + y};
	},

	beginPath: function(x, y){
		if (this.started) return;
		this.started = true;
		this.cursor = {x: 0, y: 0};
		this.bounds = {min: {x: null, y: null}, max: {x: null, y: null}};
		this.context.beginPath();
		this.lift(x, y);
	},
	
	closePath: function(){
		if (!this.started) return;
		this.context.closePath();
	},
	
	lift: function(x, y){
		if (!this.started) return;
		this.cursor = this.getUpdatedCursor(x, y);
		this.context.moveTo(this.cursor.x, this.cursor.y);
	},
	
	line: function(x, y){
		if (!this.started) return;
		this.checkBounds();
		this.cursor = this.getUpdatedCursor(x, y);
		this.checkBounds();
		this.context.lineTo(this.cursor.x, this.cursor.y);
	},
	
	bezier: function(cx1, cy1, cx2, cy2, ex, ey){
		if (!this.started) return;
		this.checkBounds();
		var c1 = this.getUpdatedCursor(cx1, cy1), c2 = this.getUpdatedCursor(cx2, cy2);
		this.cursor = this.getUpdatedCursor(ex, ey);
		this.checkBounds();
		this.context.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, this.cursor.x, this.cursor.y);
	},
	
	set: function(key, value){
		this.context[key] = value;
	},
	
	getColor: function(color){
		if ($type(color) == 'object'){
			var gradient = this.context.createLinearGradient(0, this.bounds.min.y, 0, this.bounds.max.y);
			for (var i in color) gradient.addColorStop(i, color[i].valueOf());
			return gradient;
		} else {
			return color.valueOf();
		}
	},
	
	render: function(style){
		if (!this.started) return;
		this.started = false;
		
		style = $merge(this.style, style);
		var ctx = this.context;

		for (var key in style){
			var current = style[key];
			if (current == null) continue;
			var camel = key.camelCase();
			
			switch (camel){
				case 'fill': ctx.fillStyle = this.getColor(current); break;
				case 'stroke': ctx.strokeStyle = this.getColor(current); break;
				case 'strokeWidth': ctx.lineWidth = Number(current); break;
				case 'strokeCap': ctx.lineCap = current; break;
				case 'strokeJoin': ctx.lineJoin = current; break;
				case 'shadowColor': ctx.shadowColor = this.getColor(current); break;
				case 'shadowBlur': ctx.shadowBlur = Number(current); break;
				case 'shadowOffsetX': ctx.shadowOffsetX = Number(current); break;
				case 'shadowOffsetY': ctx.shadowOffsetY = Number(current); break;
			}
			
			delete style[key];
			style[camel] = true;
		}
		
		if (style.fill) this.context.fill();
		if (style.stroke && style.strokeWidth) this.context.stroke();
	},
	
	clear: function(){
		this.context.clearRect(0, 0, this.element.width, this.element.height);
	},
	
	checkBounds: function(){
		var b = this.bounds, v = this.cursor;
		if (b.max.x == null || b.max.x < v.x) b.max.x = v.x;
		if (b.max.y == null || b.max.y < v.y) b.max.y = v.y;
		if (b.min.x == null || b.min.x > v.x) b.min.x = v.x;
		if (b.min.y == null || b.min.y > v.y) b.min.y = v.y;
	},
	
	toElement: function(){
		return this.element;
	}
	
});

// Math

Math.kappa = (4 * (Math.sqrt(2) - 1) / 3);
