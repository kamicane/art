// Canvas Adapter.

ART.Adapter.Canvas = new Class({
	
	Extends: ART.Adapter,
	
	initialize: function(id, width, height){
		this.element = new Element('canvas', {'id': id || 'c-' + $time()});
		this.context = this.element.getContext('2d');
		this.resize({x: width, y: height});
		this.parent();
	},
	
	/* canvas implementation */
	
	resize: function(size){
		this.element.width = size.x;
		this.element.height = size.y;
		return this;
	},
	
	start: function(vector){
		this.context.beginPath();
		return this.parent(vector);
	},
	
	join: function(){
		this.context.closePath();
		return this.parent();
	},
	
	moveTo: function(vector){
		var now = this.parent(vector);
		this.context.moveTo(now.x, now.y);
		return this;
	},
	
	lineTo: function(vector){
		var now = this.parent(vector);
		this.context.lineTo(now.x, now.y);
		return this;
	},

	bezierTo: function(c1, c2, end){
		var now = this.parent(c1, c2, end);
		this.context.bezierCurveTo(now[0].x, now[0].y, now[1].x, now[1].y, now[2].x, now[2].y);
		return this;
	},
	
	end: function(style){
		this.started = false;
		style = this.sanitizeStyle(style);
		var ctx = this.context;
		for (var key in style){
			var current = style[key];
			if (current == null) continue;
			switch (key){
				case 'fillColor': ctx.fillStyle = this.getColor(current); break;
				case 'strokeColor': ctx.strokeStyle = this.getColor(current); break;
				case 'strokeWidth': ctx.lineWidth = Number(current); break;
				case 'strokeCap': ctx.lineCap = current; break;
				case 'strokeJoin': ctx.lineJoin = current; break;
				case 'shadowColor': ctx.shadowColor = this.getColor(current); break;
				case 'shadowBlur': ctx.shadowBlur = Number(current); break;
				case 'shadowOffsetX': ctx.shadowOffsetX = Number(current); break;
				case 'shadowOffsetY': ctx.shadowOffsetY = Number(current); break;
			}
		}
		if (style.fill) this.context.fill();
		if (style.stroke) this.context.stroke();
		return this;
	},
	
	clear: function(){
		this.context.clearRect(0, 0, this.element.width, this.element.height);
		return this;
	},
	
	/* privates */
	
	getColor: function(color){
		color = color.valueOf();
		var type = $type(color);
		if (type == 'string') return color;
		
		var gradient = this.context.createLinearGradient(0, this.boundsMin.y, 0, this.boundsMax.y);
		switch (type){
			case 'object': for (var pos in color) gradient.addColorStop(pos, color[pos].valueOf()); break;
			case 'array': color.each(function(col, i){
				gradient.addColorStop(i / (color.length - 1), col.valueOf());
			});
		}
		return gradient;
	}
	
});
