// art.button.js

// Button Widget. Work in progress.

ART.Button = new Class({
	
	Extends: ART.Widget,
	
	name: 'button',
	
	style: {
		
		base: {
			
			'height': 20,
			'width': 100,

			'glyph': false,
			'glyph-stroke': 2,
			'glyph-color': hsb(0, 0, 0, 0.8),
			'glyph-height': 10,
			'glyph-width': 10,
			'glyph-top': 2,
			'glyph-left': 2,
			
			'pill': false,
			
			'corner-radius': 3,
			'background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 50)},
			'border-color': hsb(0, 0, 0, 0.7),
			'reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)}

		},
		
		active: {

			'background-color': hsb(0, 0, 40),
			'border-color': hsb(0, 0, 0, 0.8),
			'reflection-color': {0: hsb(0, 0, 30, 1), 1: hsb(0, 0, 0, 0)}

		}

	},
	
	options: {},
	
	initialize: function(options){
		this.parent(options);
		
		this.paint = new ART.Paint();
		$(this.paint).inject(this.element);
		
		var self = this;
		
		var deactivate = function(){
			self.deactivate();
			document.removeEvent('mouseup', deactivate);
		};
		
		this.element.addEvent('mousedown', function(){
			self.activate();
			document.addEvent('mouseup', deactivate);
		});
		
		this.render();
	},
	
	render: function(style){
		if (!this.paint) return this;
		if (style) $extend(this.style.now, style);

		var now = {};
		for (var p in this.style.now) now[p.camelCase()] = this.style.now[p];
		
		this.paint.resize({x: now.width, y: now.height});
		this.element.setStyles({height: now.height, width: now.width});
		
		var shape = (now.pill) ? (now.width > now.height) ? 'horizontal-pill' : 'vertical-pill' : 'rounded-rectangle';
		
		this.paint.start();
		this.paint.shape(shape, {x: now.width, y: now.height}, now.cornerRadius + 1);
		this.paint.render({'fill': now.borderColor});
		
		this.paint.start({x: 1, y: 1});
		this.paint.shape(shape, {x: now.width - 2, y: now.height - 2}, now.cornerRadius);
		this.paint.render({fill: now.reflectionColor});
		
		this.paint.start({x: 1, y: 2});
		this.paint.shape(shape, {x: now.width - 2, y: now.height - 3}, now.cornerRadius);
		this.paint.render({fill: now.backgroundColor});
		
		if (now.glyph){
			this.paint.start({x: now.glyphLeft, y: now.glyphTop});
			this.paint.shape(now.glyph, {x: now.glyphWidth, y: now.glyphHeight});
			this.paint.render({'stroke-width': now.glyphStroke, 'stroke': now.glyphColor});
		}
		
		return this;
	}
	
});
