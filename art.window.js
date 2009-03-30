// art.window.js

// Window Widget. Work in progress.

ART.Window = new Class({
	
	Extends: ART.Widget,
	
	name: 'window',
	
	style: {
		
		base: {
			
			'height': 300,
			'width': 400,
			
			'button-margin': 20,
			'button-top': 5,
			
			'corner-radius': 3,
			'header-height': 24,
			'footer-height': 16,
			'header-background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 60)},
			'footer-background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 70)},
			'header-reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
			'footer-reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
			'border-color': hsb(0, 0, 0, 0.5)
		}

	},
	
	options: {
		close: true,
		minimize: true,
		maximize: true,
		resize: true,
		
		closeStyle: {base: {
			'pill': true,
			
			'background-color': {0: hsb(200, 15, 75), 1: hsb(200, 35, 55)},
			'reflection-color': {0: hsb(200, 10, 95), 1: hsb(200, 0, 0, 0)},
			'border-color': hsb(200, 35, 45),
			'glyph-color': hsb(0, 0, 100, 0.5),
			
			'glyph': 'close-icon',
			
			'height': 14,
			'width': 14,
			
			'glyph-height': 4,
			'glyph-width': 4,
			'glyph-top': 5,
			'glyph-left': 5
		}, active: {
			'glyph-color': hsb(0, 0, 100),
			'background-color': hsb(200, 15, 65),
			'reflection-color': {0: hsb(200, 35, 65), 1: hsb(0, 0, 0, 0)},
			'border-color': hsb(200, 35, 45)
		}},
		
		minimizeStyle: {base: {
			'pill': true,
			
			'background-color': {0: hsb(200, 15, 75), 1: hsb(200, 35, 55)},
			'reflection-color': {0: hsb(200, 10, 95), 1: hsb(200, 0, 0, 0)},
			'border-color': hsb(200, 35, 45),
			'glyph-color': hsb(0, 0, 100, 0.5),
			
			'glyph': 'minus-icon',
			
			'height': 14,
			'width': 14,
			
			'glyph-height': 6,
			'glyph-width': 6,
			'glyph-top': 4,
			'glyph-left': 4
		}, active: {
			'glyph-color': hsb(0, 0, 100),
			'background-color': hsb(200, 15, 65),
			'reflection-color': {0: hsb(200, 35, 65), 1: hsb(0, 0, 0, 0)},
			'border-color': hsb(200, 35, 45)
		}},
		
		maximizeStyle: {base: {
			'pill': true,
			
			'background-color': {0: hsb(200, 15, 75), 1: hsb(200, 35, 55)},
			'reflection-color': {0: hsb(200, 10, 95), 1: hsb(200, 0, 0, 0)},
			'border-color': hsb(200, 35, 45),
			'glyph-color': hsb(0, 0, 100, 0.5),
			
			'glyph': 'plus-icon',
			
			'height': 14,
			'width': 14,

			'glyph-height': 6,
			'glyph-width': 6,
			'glyph-top': 4,
			'glyph-left': 4
		}, active: {
			'glyph-color': hsb(0, 0, 100),
			'background-color': hsb(200, 15, 65),
			'reflection-color': {0: hsb(200, 35, 65), 1: hsb(0, 0, 0, 0)},
			'border-color': hsb(200, 35, 45)
		}}
	},
	
	initialize: function(options){
		this.parent(options);
		
		var relative = {'position': 'relative', 'top': 0, 'left': 0};
		var absolute = {'position': 'absolute', 'top': 0, 'left': 0};
		
		this.paint = new ART.Paint();
		$(this.paint).setStyles(absolute).inject(this.element);
		
		this.element.setStyles({'position': 'relative'});
		
		this.header = new Element('div', {'class': 'art-window-header'});
		this.content = new Element('div', {'class': 'art-window-content'});
		this.footer = new Element('div', {'class': 'art-window-footer'});
		
		this.header.setStyles(relative);
		this.content.setStyles(relative);
		this.footer.setStyles(relative);
		
		this.element.adopt(this.header, this.content, this.footer);
		
		if (this.options.close){
			this.close = new ART.Button({style: this.options.closeStyle});
			$(this.close).setStyles(absolute).inject(this.header);
		}
		
		if (this.options.maximize){
			this.maximize = new ART.Button({style: this.options.maximizeStyle});
			$(this.maximize).setStyles(absolute).inject(this.header);
		}
		
		if (this.options.minimize){
			this.minimize = new ART.Button({style: this.options.minimizeStyle});
			$(this.minimize).setStyles(absolute).inject(this.header);
		}
		
		this.render();
	},
	
	setContent: function(){
		this.content.adopt(arguments);
		return this;
	},
	
	render: function(style){
		if (!this.paint) return this;
		if (style) $extend(this.style.now, style);

		var now = {};
		for (var p in this.style.now) now[p.camelCase()] = this.style.now[p];
		
		this.paint.resize({x: now.width, y: now.height});
		this.element.setStyles({height: now.height, width: now.width});
		this.content.setStyles({top: 0, left: 1, height: now.height - now.footerHeight - now.headerHeight - 2, width: now.width -2});
		
		this.paint.start();
		this.paint.shape('rounded-rectangle', {x: now.width, y: now.height}, now.cornerRadius + 1);
		this.paint.end({'fill': true, 'fill-color': now.borderColor});
		
		this.header.setStyles({'width': now.width, height: now.headerHeight});
		
		this.paint.start({x: 1, y: 1});
		this.paint.shape('rounded-rectangle', {x: now.width - 2, y: now.headerHeight - 2}, [now.cornerRadius, now.cornerRadius, 0, 0]);
		this.paint.end({'fill': true, 'fill-color': now.headerReflectionColor});
		
		this.paint.start({x: 1, y: 2});
		this.paint.shape('rounded-rectangle', {x: now.width - 2, y: now.headerHeight - 3}, [now.cornerRadius, now.cornerRadius, 0, 0]);
		this.paint.end({'fill': true, 'fill-color': now.headerBackgroundColor});
		
		this.footer.setStyles({'width': now.width, height: now.footerHeight});
		
		this.paint.start({x: 1, y: now.height - now.footerHeight - 1});
		this.paint.shape('rounded-rectangle', {x: now.width - 2, y: now.footerHeight}, [0, 0, now.cornerRadius, now.cornerRadius]);
		this.paint.end({'fill': true, 'fill-color': now.footerReflectionColor});
		
		this.paint.start({x: 1, y: now.height - now.footerHeight});
		this.paint.shape('rounded-rectangle', {x: now.width - 2, y: now.footerHeight - 1}, [0, 0, now.cornerRadius, now.cornerRadius]);
		this.paint.end({'fill': true, 'fill-color': now.footerBackgroundColor});
		
		if (this.options.resize){
			
			this.paint.start({x: now.width - 4, y: now.height - 14});
			this.paint.lineBy({x: -10, y: 10});
			this.paint.moveBy({x: 4, y: 0});
			this.paint.lineBy({x: 6, y: -6});
			this.paint.moveBy({x: 0, y: 4});
			this.paint.lineBy({x: -2, y: 2});
			this.paint.end({'stroke': true, 'stroke-color': hsb(0, 0, 100, 0.6)});
			
			this.paint.start({x: now.width - 5, y: now.height - 14});
			this.paint.lineBy({x: -10, y: 10});
			this.paint.moveBy({x: 4, y: 0});
			this.paint.lineBy({x: 6, y: -6});
			this.paint.moveBy({x: 0, y: 4});
			this.paint.lineBy({x: -2, y: 2});
			this.paint.end({'stroke': true, 'stroke-color': hsb(0, 0, 0, 0.6)});
		}
		
		// painting buttons
		
		var baseLeft = 8;
		var oneLeft = baseLeft + now.buttonMargin;
		var twoLeft = oneLeft + oneLeft - baseLeft;
		
		if (this.close) $(this.close).setStyles({top: now.buttonTop, left: baseLeft});
		
		if (this.maximize) $(this.maximize).setStyles({
			top: now.buttonTop,
			left: (this.close && this.maximize) ? twoLeft : (this.close || this.maximize) ? oneLeft : baseLeft
		});
		
		if (this.minimize) $(this.minimize).setStyles({
			top: now.buttonTop,
			left: (this.close) ? oneLeft : baseLeft
		});
		
		return this;
	}
	
});
