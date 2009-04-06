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
		classes: [],
		style: null
	},
	
	initialize: function(options){
		if (options) this.setOptions(options);

		this.prefix = this.ns + '-' + this.name;
		this.element = new Element('div');
		this.element.addClass(this.ns).addClass(this.prefix);
		this.classes = this.options.classes;
		this.pseudos = [];
		this.childWidgets = [];

		// initial render
		this.render();
	},

	getSelector: function(){
		var selector = (this.parentWidget) ? this.parentWidget.getSelector() + ' ' : '';
		selector += this.name;
		if (this.classes.length) selector += '.' + this.classes.join('.');
		if (this.pseudos.length) selector += ':' + this.pseudos.join(':');
		return selector;
	},

	addPseudo: function(pseudo){
		this.pseudos.include(pseudo);
	},

	removePseudo: function(pseudo){
		this.pseudos.erase(pseudo);
	},

	setParent: function(widget){
		this.parentWidget = widget;
		widget.childWidgets.include(this);
	},

	// render
	
	render: function(){
		this.childWidgets.each(function(child){
			child.render();
		});
		return this;
	},
	
	// special states
	
	hide: function(){
		if (!this.hidden){
			this.hidden = true;
			this.fireEvent('hide');
			this.element.addClass(this.prefix + '-hidden');
			this.addPseudo('hidden');
			this.render();
		}
		return this;
	},
	
	activate: function(){
		if (!this.active){
			this.active = true;
			this.fireEvent('activate');
			this.element.addClass(this.prefix + '-active');
			this.addPseudo('active');
			this.render();
		}
		return this;
	},
	
	focus: function(){
		if (!this.focused){
			this.focused = true;
			this.fireEvent('focus');
			this.element.addClass(this.prefix + '-focused');
			this.addPseudo('focus');
			this.render();
		}
		return this;
	},
	
	disable: function(){
		if (!this.disabled){
			this.disabled = true;
			this.fireEvent('disable');
			this.element.addClass(this.prefix + '-disabled');
			this.addPseudo('disabled');
			this.render();
		}
		return this;
	},
	
	// normal states
	
	show: function(){
		if (this.hidden){
			this.hidden = false;
			this.fireEvent('show');
			this.element.removeClass(this.prefix + '-hidden');
			this.removePseudo('hidden');
			this.render();
		}
		return this;
	},
	
	deactivate: function(){
		if (this.active){
			this.active = false;
			this.fireEvent('deactivate');
			this.element.removeClass(this.prefix + '-active');
			this.removePseudo('active');
			this.render();
		}
		return this;
	},
	
	blur: function(){
		if (this.focused){
			this.focused = false;
			this.fireEvent('blur');
			this.element.removeClass(this.prefix + '-focused');
			this.removePseudo('focused');
			this.render();
		}
		return this;
	},
	
	enable: function(){
		if (this.disabled){
			this.disabled = false;
			this.fireEvent('enable');
			this.element.removeClass(this.prefix + '-disabled');
			this.removePseudo('disabled');
			this.render();
		}
		return this;
	},
	
	// toElement
	
	toElement: function(){
		return this.element;
	}
	
});
