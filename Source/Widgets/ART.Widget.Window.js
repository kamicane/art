/*
Script: ART.Widget.Window.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.

ART.Sheet.defineStyle('window', {
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
});

ART.Sheet.defineStyle('window button', {
	'pill': true,
	'background-color': {0: hsb(200, 15, 75), 1: hsb(200, 35, 55)},
	'reflection-color': {0: hsb(200, 10, 95), 1: hsb(200, 0, 0, 0)},
	'border-color': hsb(200, 35, 45),
	'glyph-color': hsb(0, 0, 100, 0.5),
	'height': 14,
	'width': 14
});

ART.Sheet.defineStyle('window button:active', {
	'background-color': hsb(200, 15, 65),
	'reflection-color': {0: hsb(200, 35, 65), 1: hsb(0, 0, 0, 0)},
	'border-color': hsb(200, 35, 45),
	'glyph-color': hsb(0, 0, 100)
});

ART.Sheet.defineStyle('window button.close', {
	'glyph': 'close-icon',
	
	'glyph-height': 4,
	'glyph-width': 4,
	'glyph-top': 5,
	'glyph-left': 5
});

ART.Sheet.defineStyle('window button.minimize', {
	'glyph': 'minus-icon',

	'glyph-height': 6,
	'glyph-width': 6,
	'glyph-top': 4,
	'glyph-left': 4
});

ART.Sheet.defineStyle('window button.maximize', {
	'glyph': 'plus-icon',

	'glyph-height': 6,
	'glyph-width': 6,
	'glyph-top': 4,
	'glyph-left': 4
});

ART.Widget.Window = new Class({
	
	Extends: ART.Widget,
	
	name: 'window',
	
	options: {
		close: true,
		minimize: true,
		maximize: true,
		resize: true
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
			this.close = new ART.Widget.Button({classes: ['close']});
			this.close.setParent(this);
			$(this.close).setStyles(absolute).inject(this.header);
		}
		
		if (this.options.maximize){
			this.maximize = new ART.Widget.Button({classes: ['maximize']});
			this.maximize.setParent(this);
			$(this.maximize).setStyles(absolute).inject(this.header);
		}
		
		if (this.options.minimize){
			this.minimize = new ART.Widget.Button({classes: ['minimize']});
			this.minimize.setParent(this);
			$(this.minimize).setStyles(absolute).inject(this.header);
		}
		
		this.render();
	},
	
	setContent: function(){
		this.content.adopt(arguments);
		return this;
	},
	
	render: function(){
		this.parent();
		if (!this.paint) return this;

		var style = ART.Sheet.lookupStyle(this.getSelector());
		
		this.paint.resize({x: style.width, y: style.height});
		this.element.setStyles({height: style.height, width: style.width});
		this.content.setStyles({top: 0, left: 1, height: style.height - style.footerHeight - style.headerHeight - 2, width: style.width -2});
		
		this.paint.start();
		this.paint.shape('rounded-rectangle', {x: style.width, y: style.height}, style.cornerRadius + 1);
		this.paint.end({'fill': true, 'fill-color': style.borderColor});
		
		this.header.setStyles({'width': style.width, height: style.headerHeight});
		
		this.paint.start({x: 1, y: 1});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.headerHeight - 2}, [style.cornerRadius, style.cornerRadius, 0, 0]);
		this.paint.end({'fill': true, 'fill-color': style.headerReflectionColor});
		
		this.paint.start({x: 1, y: 2});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.headerHeight - 3}, [style.cornerRadius, style.cornerRadius, 0, 0]);
		this.paint.end({'fill': true, 'fill-color': style.headerBackgroundColor});
		
		this.footer.setStyles({'width': style.width, height: style.footerHeight});
		
		this.paint.start({x: 1, y: style.height - style.footerHeight - 1});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.footerHeight}, [0, 0, style.cornerRadius, style.cornerRadius]);
		this.paint.end({'fill': true, 'fill-color': style.footerReflectionColor});
		
		this.paint.start({x: 1, y: style.height - style.footerHeight});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.footerHeight - 1}, [0, 0, style.cornerRadius, style.cornerRadius]);
		this.paint.end({'fill': true, 'fill-color': style.footerBackgroundColor});
		
		if (this.options.resize){
			
			var drawLines = function(self){
				self.paint.lineBy({x: -10, y: 10}).moveBy({x: 4, y: 0}).lineBy({x: 6, y: -6}).moveBy({x: 0, y: 4}).lineBy({x: -2, y: 2});
			};
			
			this.paint.start({x: style.width - 4, y: style.height - 14});
			drawLines(this);
			this.paint.end({'stroke': true, 'stroke-color': hsb(0, 0, 100, 0.6)});
			
			this.paint.start({x: style.width - 5, y: style.height - 14});
			drawLines(this);
			this.paint.end({'stroke': true, 'stroke-color': hsb(0, 0, 0, 0.6)});
		}
		
		// painting buttons
		
		var baseLeft = 8;
		var oneLeft = baseLeft + style.buttonMargin;
		var twoLeft = oneLeft + oneLeft - baseLeft;
		
		if (this.close) $(this.close).setStyles({top: style.buttonTop, left: baseLeft});
		
		if (this.maximize) $(this.maximize).setStyles({
			top: style.buttonTop,
			left: (this.close && this.maximize) ? twoLeft : (this.close || this.maximize) ? oneLeft : baseLeft
		});
		
		if (this.minimize) $(this.minimize).setStyles({
			top: style.buttonTop,
			left: (this.close) ? oneLeft : baseLeft
		});
		
		return this;
	}
	
});
