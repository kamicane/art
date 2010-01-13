/*
Script: ART.Widget.Window.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.

ART.Sheet.defineStyle('window', {
	'height': 300,
	'width': 400,
	
	'max-height': 800,
	'max-width': 1000,
	
	'min-height': 110,
	'min-width': 300,
	
	'top': 100,
	'left': 100,
	
	'caption-font': 'moderna',
	'caption-font-size': 13,
	'caption-font-color': hsb(0, 0, 30),
	
	'button-spacing': 20,
	'header-padding-top': 4,
	
	'content-overflow': 'auto',
	
	'corner-radius': 4,
	'header-height': 24,
	'footer-height': 17,
	'header-background-color': {0: hsb(0, 0, 95), 1: hsb(0, 0, 80)},
	'footer-background-color': {0: hsb(0, 0, 95), 1: hsb(0, 0, 90)},
	'header-reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
	'footer-reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
	'border-color': hsb(0, 0, 0, 0.2),
	'content-border-top-color': hsb(0, 0, 60),
	'content-border-bottom-color': hsb(0, 0, 70),
	'content-background-color': hsb(0, 0, 100)
});

ART.Sheet.defineStyle('window:focus', {
	'caption-font-color': hsb(0, 0, 10),
	'header-background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 60)},
	'footer-background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 70)},
	'header-reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
	'footer-reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
	'border-color': hsb(0, 0, 0, 0.4),
	'content-border-top-color': hsb(0, 0, 30),
	'content-border-bottom-color': hsb(0, 0, 50),
	'content-background-color': hsb(0, 0, 100)
});

ART.Sheet.defineStyle('window button', {
	'pill': true,
	'height': 14,
	'width': 14,
	'background-color': {0: hsb(0, 0, 100, 0.6), 1: hsb(0, 0, 100, 0.6)},
	'reflection-color': {0: hsb(0, 0, 100), 1: hsb(0, 0, 0, 0)},
	'shadow-color': hsb(0, 0, 100, 0.2),
	'border-color': hsb(0, 0, 45, 0.5),
	'glyph-color': hsb(0, 0, 0, 0.4)
});

ART.Sheet.defineStyle('window:focus button', {
	'background-color': {0: hsb(0, 0, 75), 1: hsb(0, 0, 55)},
	'reflection-color': {0: hsb(0, 0, 95), 1: hsb(0, 0, 0, 0)},
	'shadow-color': hsb(0, 0, 100, 0.4),
	'border-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 0, 0.6)
});

ART.Sheet.defineStyle('window button:active', {
	'background-color': hsb(0, 0, 65),
	'reflection-color': {0: hsb(0, 0, 65), 1: hsb(0, 0, 0, 0)},
	'border-color': hsb(0, 0, 45),
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

ART.WM = {

	instances: [],
	
	register: function(instance){
		
		if (this.instances.contains(instance)) return;
		
		$(instance).addEvent('mousedown', function(){
			if (!instance.focused) ART.WM.focus(instance);
		});
		
		this.instances.push(instance);
	},
	
	cascade: function(noAnim){
		this.instances.each(function(current, i){
			var styles = {top: 20 * i, left: 10 * i};
			(noAnim) ? current.element.setStyles(styles) : current.morph.start(styles);
		});
	},
	
	unregister: function(instance){
		this.instances.erase(instance);
	},
	
	focus: function(instance){
		if (instance) this.instances.erase(instance).push(instance);
		
		this.instances.each(function(current, i){
			$(current).setStyle('z-index', i);
			if (current === instance) current.focus();
			else current.blur();
		});
	}
	
};

ART.Widget.Window = new Class({
	
	Extends: ART.Widget,
	
	name: 'window',
	
	options: {
		caption: null,
		close: true,
		minimize: true,
		maximize: true,
		resizable: true,
		draggable: true
	},
	
	initialize: function(options){
		this.parent(options);
		var self = this;
		
		var relative = {'position': 'relative', 'top': 0, 'left': 0};
		var absolute = {'position': 'absolute', 'top': 0, 'left': 0};
		
		var style = ART.Sheet.lookupStyle(this.getSelector());
		
		this.currentHeight = style.height;
		this.currentWidth = style.width;
		
		this.element.setStyles({'position': 'absolute', 'top': style.top, 'left': style.left});
		this.morph = new Fx.Morph(this.element);
		
		this.paint = new ART.Paint();
		$(this.paint).setStyles(absolute).inject(this.element);
		
		this.contents = new Element('div').inject(this.element);
		this.contents.setStyles({'position': 'absolute', 'top': 5, 'left': 10});
		
		ART.WM.register(this);
		
		this.header = new Element('div', {'class': 'art-window-header'});
		this.content = new Element('div', {'class': 'art-window-content'});
		this.footer = new Element('div', {'class': 'art-window-footer'});
		this.resizeHandle = new Element('div', {'class': 'art-window-resize-handle'});
		
		this.header.setStyles(relative);
		this.content.setStyles(relative);
		this.footer.setStyles(relative);

		this.resizeHandle.setStyles({
			'position': 'absolute',
			'height': 17,
			'width': 17,
			'right': 0,
			'bottom': 0
		});
		
		this.footer.setStyles({
			'top': 1,
			'left': 1,
			'overflow': 'hidden'
		});
		
		this.header.setStyles({
			'top': 1,
			'left': 1,
			'overflow': 'hidden'
		});
		
		this.content.setStyles({
			'overflow': 'auto'
		});
		
		// this.footer.setStyles({'background-color': 'green', 'opacity': 0.5});
		// this.header.setStyles({'background-color': 'green', 'opacity': 0.5});
		// this.element.setStyles({'background-color': 'red', 'opacity': 0.5});
		
		this.resizeHandle.inject(this.footer);
		
		if (this.options.resizable){
			
			this.touchResize = new Touch(this.resizeHandle);
			
			this.touchResize.addEvent('start', function(){
				self.startHeight = self.contents.offsetHeight;
				self.startWidth = self.contents.offsetWidth;
			});
			
			this.touchResize.addEvent('move', function(dx, dy){
				var width = self.startWidth + dx;
				var height = self.startHeight + dy;
				self.resize(width, height);
			});
		}
		
		if (this.options.draggable){
			
			this.touchDrag = new Touch(this.header);
			
			this.touchDrag.addEvent('start', function(){
				self.startTop = self.element.offsetTop;
				self.startLeft = self.element.offsetLeft;
			});
			
			this.touchDrag.addEvent('move', function(dx, dy){
				var top = self.startTop + dy;
				var left = self.startLeft + dx;
				if (top < 0) top = 0;
				if (left < 0) left = 0;
				self.element.setStyles({
					'top': top,
					'left': left
				});
			});
		}
		
		this.contents.adopt(this.header, this.content, this.footer);
		
		if (this.options.close){
			this.close = new ART.Widget.Button({className: 'close'});
			this.close.setParent(this);
			$(this.close).setStyles(absolute).inject(this.header);
			this.close.addEvent('press', function(){
				ART.WM.focus(self);
				self.fireEvent('close');
			});
		}
		
		if (this.options.maximize){
			this.maximize = new ART.Widget.Button({className: 'maximize'});
			this.maximize.setParent(this);
			$(this.maximize).setStyles(absolute).inject(this.header);
			this.maximize.addEvent('press', function(){
				ART.WM.focus(self);
				self.fireEvent('maximize');
			});
		}
		
		if (this.options.minimize){
			this.minimize = new ART.Widget.Button({className: 'minimize'});
			this.minimize.setParent(this);
			$(this.minimize).setStyles(absolute).inject(this.header);
			this.minimize.addEvent('press', function(){
				ART.WM.focus(self);
				self.fireEvent('minimize');
			});
		}
		
		this.render();
	},
	
	setContent: function(){
		$(this.content).adopt(arguments);
		return this;
	},
	
	setCaption: function(text){
		this.options.caption = text;
		this.render();
		return this;
	},
	
	resize: function(width, height){
		this.render({'height': height, 'width': width});
		return this;
	},
	
	destroy: function(){
		ART.WM.unregister(this);
		this.element.dispose();
		return this;
	},
	
	render: function(override){
		this.parent();
		if (!this.paint) return;
		
		var style = ART.Sheet.lookupStyle(this.getSelector());
		
		// height / width management
		
		delete style.height;
		delete style.width;

		$mixin(style, override);
		if (style.height == null) style.height = this.currentHeight;
		if (style.width == null) style.width = this.currentWidth;
		
		style.height = style.height.limit(style.minHeight, style.maxHeight);
		style.width = style.width.limit(style.minWidth, style.maxWidth);
		
		this.currentHeight = style.height;
		this.currentWidth = style.width;
		
		this.paint.resize({x: style.width + 20, y: style.height + 20});
		
		this.contents.setStyles({
			'height': style.height + 20,
			'width': style.width + 20
		});
		
		this.contents.setStyles({
			'height': style.height,
			'width': style.width
		});
		
		var contentHeight = style.height - style.footerHeight - style.headerHeight - 2;
		var contentWidth = style.width -2;
		
		this.content.setStyles({
			'top': 2,
			'left': 1,
			'height': contentHeight,
			'width': contentWidth,
			'background-color': style.contentBackgroundColor,
			'overflow': style.contentOverflow
		});
		
		// border layer
		this.paint.save();
		
		this.paint.shift({x: 10, y: 5});
		
		this.paint.start();
		this.paint.shape('rounded-rectangle', {x: style.width, y: style.height}, style.cornerRadius + 1);
		
		var border = {'fill': true, 'fill-color': style.borderColor};
		
		if (Browser.Engine.webkit) $mixin(border, {
			'shadow-color': hsb(0, 0, 0),
			'shadow-blur': 8,
			'shadow-offset-x': 0,
			'shadow-offset-y': 5
		});
		
		this.paint.end(border);
		
		// header layers
		
		this.header.setStyles({'width': style.width - 2, height: style.headerHeight - 2});
		
		this.paint.start({x: 1, y: 1});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.headerHeight - 2}, [style.cornerRadius, style.cornerRadius, 0, 0]);
		this.paint.end({'fill': true, 'fill-color': style.headerReflectionColor});
		
		this.paint.start({x: 1, y: 2});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.headerHeight - 3}, [style.cornerRadius, style.cornerRadius, 0, 0]);
		this.paint.end({'fill': true, 'fill-color': style.headerBackgroundColor});
		
		// first content separator border
		
		this.paint.start({x: 1.5, y: style.headerHeight - 0.5});
		this.paint.lineTo({x: style.width - 3, y: 0});
		this.paint.end({'stroke': true, 'stroke-color': style.contentBorderTopColor});
		
		// second content separator border
		
		this.paint.start({x: 1.5, y: style.height - style.footerHeight - 1.5});
		this.paint.lineTo({x: style.width - 3, y: 0});
		this.paint.end({'stroke': true, 'stroke-color': style.contentBorderBottomColor});
		
		//footer layers
		
		this.footer.setStyles({'width': style.width - 2, 'height': style.footerHeight});
		
		this.paint.start({x: 1, y: style.height - style.footerHeight - 1});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.footerHeight}, [0, 0, style.cornerRadius, style.cornerRadius]);
		this.paint.end({'fill': true, 'fill-color': style.footerReflectionColor});
		
		this.paint.start({x: 1, y: style.height - style.footerHeight});
		this.paint.shape('rounded-rectangle', {x: style.width - 2, y: style.footerHeight - 1}, [0, 0, style.cornerRadius, style.cornerRadius]);
		this.paint.end({'fill': true, 'fill-color': style.footerBackgroundColor});
		
		if (this.options.resizable){
			
			var drawLines = function(){
				this.paint.lineBy({x: -10, y: 10}).moveBy({x: 4, y: 0}).lineBy({x: 6, y: -6}).moveBy({x: 0, y: 4}).lineBy({x: -2, y: 2});
			};
			
			this.paint.start({x: style.width - 2, y: style.height - 13});
			drawLines.call(this);
			this.paint.end({'stroke': true, 'stroke-color': hsb(0, 0, 100, 0.5)});
			
			this.paint.start({x: style.width - 3, y: style.height - 13});
			drawLines.call(this);
			this.paint.end({'stroke': true, 'stroke-color': hsb(0, 0, 0, 0.4)});
		}
		
		// painting buttons
		
		var baseLeft = 8;
		var oneLeft = baseLeft + style.buttonSpacing;
		var twoLeft = oneLeft + oneLeft - baseLeft;		
		if (this.close){
			$(this.close).setStyles({top: style.headerPaddingTop, left: baseLeft});
		}
		
		if (this.minimize){
			$(this.minimize).setStyles({
				'top': style.headerPaddingTop,
				'left': (this.close) ? oneLeft : baseLeft
			});
		}
		
		if (this.maximize){
			$(this.maximize).setStyles({
				'top': style.headerPaddingTop,
				'left': (this.close && this.maximize) ? twoLeft : (this.close || this.maximize) ? oneLeft : baseLeft
			});
		}
		
		if (this.options.caption == null) return;
		
		// font
		
		var font = ART.Paint.lookupFont(style.captionFont);
		var fontBounds = font.measure(style.captionFontSize, this.options.caption);
		
		// header text
		
		var spare = (style.width - fontBounds.x) / 2;
		
		this.paint.start({x: spare, y: style.headerPaddingTop + 3});
		this.paint.text(font, style.captionFontSize, this.options.caption);
		this.paint.end({'fill': true, 'fill-color': style.captionFontColor});
		
		this.paint.restore();
		
		this.fireEvent('resize', [contentWidth, contentHeight]);
	}
	
});
