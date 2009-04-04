/*
Script: ART.Widget.js

License:
	MIT-style license.
*/

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
		style: null
	},
	
	initialize: function(options){
		if (options) this.setOptions(options);
		
		this.prefix = this.ns + '-' + this.name;
		this.element = new Element('div');
		this.element.addClass(this.ns).addClass(this.prefix);
		
		// initial render
		this.render();
	},
	
	// render placeholder
	
	render: function(state){
		return this;
	},
	
	// special states
	
	hide: function(){
		if (!this.hidden){
			this.hidden = true;
			this.fireEvent('hide');
			this.element.addClass(this.prefix + '-hidden');
			this.render('hidden');
		}
		return this;
	},
	
	activate: function(){
		if (!this.active){
			this.active = true;
			this.fireEvent('activate');
			this.element.addClass(this.prefix + '-active');
			this.render('active');
		}
		return this;
	},
	
	focus: function(){
		if (!this.focused){
			this.focused = true;
			this.fireEvent('focus');
			this.element.addClass(this.prefix + '-focused');
			this.render('focus');
		}
		return this;
	},
	
	disable: function(){
		if (!this.disabled){
			this.disabled = true;
			this.fireEvent('disable');
			this.element.addClass(this.prefix + '-disabled');
			this.render('disabled');
		}
		return this;
	},
	
	// normal states
	
	show: function(){
		if (this.hidden){
			this.hidden = false;
			this.fireEvent('show');
			this.element.removeClass(this.prefix + '-hidden');
			this.render();
		}
		return this;
	},
	
	deactivate: function(){
		if (this.active){
			this.active = false;
			this.fireEvent('deactivate');
			this.element.removeClass(this.prefix + '-active');
			this.render();
		}
		return this;
	},
	
	blur: function(){
		if (this.focused){
			this.focused = false;
			this.fireEvent('blur');
			this.element.removeClass(this.prefix + '-focused');
			this.render();
		}
		return this;
	},
	
	enable: function(){
		if (this.disabled){
			this.disabled = false;
			this.fireEvent('enable');
			this.element.removeClass(this.prefix + '-disabled');
			this.render();
		}
		return this;
	},
	
	// toElement
	
	toElement: function(){
		return this.element;
	}
	
});
