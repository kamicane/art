// art.paint.js

// Painter class

ART.Paint = new Class({
	
	Implements: Options,
	
	options: {
		id: null,
		width: 500,
		height: 400
	},
	
	initialize: function(options, baseStyle){
		this.setOptions(options);
		this.adapter = new ART.Adapters.Canvas(this.options.id, this.options.width, this.options.height);
		this.style = $merge(this.adapter.style, baseStyle);
		this.global = {x: 0, y: 0};
	},
	
	resize: function(size){
		this.adapter.resize(size.x, size.y);
		return this;
	},
	
	start: function(cursor){
		cursor = cursor || {x: 0, y: 0};
		this.adapter.beginPath(cursor.x, cursor.y);
		return this;
	},

	move: function(cursor){
		this.global = {x: cursor.x, y: cursor.y};
		return this;
	},
	
	render: function(style){
		this.adapter.render($merge(this.style, style));
		return this;
	},
	
	clear: function(){
		this.adapter.clear();
		return this;
	},
	
	toElement: function(){
		return this.adapter.toElement();
	}
	
});

(function(){

// Painter

	var Painter = new Class({
	
		initialize: function(paint){
			this.adapter = paint.adapter;
		},
	
		join: function(){
			this.adapter.closePath();
			return this;
		},

		lift: function(cursor){
			this.adapter.lift(cursor.x, cursor.y);
			return this;
		},

		line: function(end){
			this.adapter.line(end.x, end.y);
			return this;
		},

		bezier: function(cv1, cv2, end){
			this.adapter.bezier(cv1.x, cv1.y, cv2.x, cv2.y, end.x, end.y);
			return this;
		}
	
	});

	// Painter to ART.Paint

	ART.Paint.defineShape = function(name, shape){
		var object = {};
		object[name.camelCase()] = function(){
			shape.apply(this, arguments);
			return this;
		};
		Painter.implement(object);
		return this;
	};

	ART.Paint.lookupShape = function(name){
		return Painter.prototype[name.camelCase()];
	};

	ART.Paint.defineShapes = function(shapes){
		for (var shape in shapes) this.defineShape(shape, shapes[shape]);
		return this;
	};

	ART.Paint.implement({

		shape: function(name){
			if (!this.painter) this.painter = new Painter(this);
			var shape = ART.Paint.lookupShape(name);
			if (shape) shape.apply(this.painter, Array.slice(arguments, 1));
			return this;
		}

	});

})();
