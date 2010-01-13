/*
Script: ART.Widget.SplitView.js

License:
	MIT-style license.
*/

ART.Sheet.defineStyle('splitview', {
	'width': 600,
	'height': 400,
	'fixed-width': 200,
	'max-fixed-width': 400,
	'min-fixed-width': null,
	'splitter-width': 3,
	'splitter-cursor': 'ew-resize',
	
	'splitter-background-color': hsb(0, 0, 70),
	'left-background-color': '#e8e8e8',
	
	'right-background-color': '#fff'
});

ART.Sheet.defineStyle('splitview:focus', {
	'splitter-background-color': hsb(0, 0, 50),
	'left-background-color': '#d6dde5'
});

ART.Widget.SplitView = new Class({
	
	Extends: ART.Widget,
	
	options: {
		fixed: 'left', resizable: true, foldable: true
	},
	
	name: 'splitview',
	
	initialize: function(options){
		this.parent(options);
		
		var style = ART.Sheet.lookupStyle(this.getSelector());
		this.currentHeight = style.height;
		this.currentWidth = style.width;
		
		this.splitterWidth = style.splitterWidth;
		
		this.element.addClass('art-splitview').setStyles({'position': 'relative'});
		var styles = {'float': 'left', 'overflow-x': 'hidden'};
		this.left = new Element('div', {'class': 'art-splitview-left'}).inject(this.element).setStyles(styles);
		this.splitter = new Element('div', {'class': 'art-splitview-splitter'}).inject(this.element).setStyles(styles);
		this.right = new Element('div', {'class': 'art-splitview-right'}).inject(this.element).setStyles(styles);
		this['resize' + this.options.fixed.capitalize()](style.fixedWidth);
		
		this.fx = new Fx();
		this.touch = new Touch(this.splitter);
		var self = this;
		var fix = self.options.fixed;
		var Fix = fix.capitalize();
		
		if (this.options.resizable || this.options.foldable){
			this.touch.addEvent('start', function(){
				self.startFixWidth = self[fix + 'Width'];
			});
		}
		
		if (this.options.resizable){

			this.touch.addEvent('move', function(dx){
				var targetWidth = self.startFixWidth + dx;
				if (targetWidth < 0) targetWidth = 0;
				else if (targetWidth > self.currentWidth - style.splitterWidth) targetWidth = self.currentWidth - style.splitterWidth;
				self['resize' + Fix](targetWidth);
			});

		}
		
		if (this.options.foldable){
			this.touch.addEvent('cancel', function(){
				if (self[fix + 'Width'] == 0){
					self['fold' + Fix](self.previousSize);
				} else {
					self.previousSize = self.startFixWidth;
					self['fold' + Fix](0);
				}
			});
		}
		
		this.initialized = true;
		this.render(style.width, style.height);

	},
	
	render: function(override){
		if (!this.initialized) return this;

		var style = ART.Sheet.lookupStyle(this.getSelector());
		
		// height / width management
		
		delete style.height;
		delete style.width;
		
		$mixin(style, override);
		if (style.height == null) style.height = this.currentHeight;
		if (style.width == null) style.width = this.currentWidth;
		
		this.currentHeight = style.height;
		this.currentWidth = style.width;
		
		// render
		
		this.element.setStyles({'width': this.currentWidth, 'height': this.currentHeight});
		this.splitter.setStyles({'width': style.splitterWidth, 'background-color': style.splitterBackgroundColor, 'cursor': style.splitterCursor});
		this.left.setStyles({'background-color': style.leftBackgroundColor});
		this.right.setStyles({'background-color': style.rightBackgroundColor});
		
		$$(this.left, this.right, this.splitter).setStyle('height', this.currentHeight);
		
		var side = this.options.fixed;
		
		if (side == 'left'){
			this.resizeRight(this.currentWidth - this.leftWidth - style.splitterWidth);
		} else if (side == 'right'){
			this.resizeLeft(this.currentWidth - this.rightWidth - style.splitterWidth);
		}
		
		return this;
	},
	
	resize: function(w, h){
		return this.render({'height': h, 'width': w});
	},
	
	resizeLeft: function(width){
		width = width.limit(0, this.currentWidth - this.splitterWidth);
		this.left.setStyle('width', width);
		this.leftWidth = width;
		this.rightWidth = this.currentWidth - this.splitterWidth - width;
		this.right.setStyle('width', this.rightWidth);
	},
	
	resizeRight: function(width){
		width = width.limit(0, this.currentWidth - this.splitterWidth);
		this.right.setStyle('width', width);
		this.rightWidth = width;
		this.leftWidth = this.currentWidth - this.splitterWidth - width;
		this.left.setStyle('width', this.leftWidth);
	},
	
	foldLeft: function(to){
		var self = this;
		this.fx.set = function(now){
			self.resizeLeft(now);
		};
		
		this.fx.start(this.leftWidth, to);
		
		return this;
	},
	
	foldRight: function(to){
		var self = this;
		this.fx.set = function(now){
			self.resizeRight(now);
		};
		
		this.fx.start(this.rightWidth, to);
		
		return this;
	},
	
	setLeftContent: function(){
		$(this.left).adopt(arguments);
		return this;
	},
	
	setRightContent: function(){
		$(this.right).adopt(arguments);
		return this;
	}

});
