// art.widget.js

// Base widget class. Based on » http://gist.github.com/85837

ART.Widget = new Class({
	
	Implements: [Options, Events],
	
	ns: 'art',
	name: 'widget',
	
	options: {
		// onShow: $empty,
		// onHide: $empty,
		// onFocus: $empty,
		// onBlur: $empty,
		// onEnable: $empty,
		// onDisable: $empty,
	},
	
	style: {
		base: null,
		active: null,
		disabled: null,
		focused: null,
		hidden: null
	},
	
	initialize: function(options){
		if (options) this.setOptions(options);
		
		this.prefix = this.ns + '-' + this.name;
		this.element = new Element('div');
		this.element.addClass(this.ns).addClass(this.prefix);
		
		this.style.now = $unlink(this.style.base);

		// initial render
		this.render();
	},
	
	// render placeholder
	
	render: function(style){
		if (style) $extend(this.style.now, style);
		
		this.element.setStyles(this.style.now);
		return this;
	},
	
	// special states
	
	hide: function(){
		if (!this.hidden){
			this.hidden = true;
			this.fireEvent('hide');
			this.element.addClass(this.prefix + '-hidden');
			this.render(this.style.hidden);
		}
		return this;
	},
	
	activate: function(){
		if (!this.active){
			this.active = true;
			this.fireEvent('activate');
			this.element.addClass(this.prefix + '-active');
			this.render(this.style.active);
		}
		return this;
	},
	
	focus: function(){
		if (!this.focused){
			this.focused = true;
			this.fireEvent('focus');
			this.element.addClass(this.prefix + '-focused');
			this.render(this.style.focused);
		}
		return this;
	},
	
	disable: function(){
		if (!this.disabled){
			this.disabled = true;
			this.fireEvent('disable');
			this.element.addClass(this.prefix + '-disabled');
			this.render(this.style.disabled);
		}
		return this;
	},
	
	// normal states
	
	show: function(){
		if (this.hidden){
			this.hidden = false;
			this.fireEvent('show');
			this.element.removeClass(this.prefix + '-hidden');
			this.render(this.style.base);
		}
		return this;
	},
	
	deactivate: function(){
		if (this.active){
			this.active = false;
			this.fireEvent('deactivate');
			this.element.removeClass(this.prefix + '-active');
			this.render(this.style.base);
		}
		return this;
	},
	
	blur: function(){
		if (this.focused){
			this.focused = false;
			this.fireEvent('blur');
			this.element.removeClass(this.prefix + '-focused');
			this.render(this.style.base);
		}
		return this;
	},
	
	enable: function(){
		if (this.disabled){
			this.disabled = false;
			this.fireEvent('enable');
			this.element.removeClass(this.prefix + '-disabled');
			this.render(this.style.base);
		}
		return this;
	},
	
	// toElement
	
	toElement: function(){
		return this.element;
	}
	
});
