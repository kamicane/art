/*
---

name: ART

description: The heart of ART.

authors: [Valerio Proietti](http://mad4milk.net), [The MooTools development team](http://mootools.net/developers)

provides: [ART, ART.Element, ART.Container]

...
*/

/* # kappa */

Math.kappa = (4 * (Math.sqrt(2) - 1) / 3);

var ART = new Class;

ART.Element = new Class({
	
	/* dom */

	inject: function(element){
		if (element.toElement) element = element.toElement();
		element.appendChild(this.element);
		return this;
	},
	
	eject: function(){
		var parent = this.element.parentNode;
		if (parent) parent.removeChild(this.element);
		return this;
	},
	
	/* attributes */
	
	set: function(k, v){
		var element = this.toElement();
		if (typeof k != 'string') for (var p in k) this.set(p, k[p]);
		else element.setAttribute(k.hyphenate(), v);
		return this;
	},
	
	get: function(a){
		var element = this.toElement();
		if (arguments.length > 1){
			var res = {};
			for (var i = 0; i < arguments.length; i++){
				var argCC = arguments[i].camelCase();
				res[argCC] = element.getAttribute(arg.hyphenate());
			}
			return res;
		} else {
			return this.element.getAttribute(a.hyphenate());
		}
	},
	
	/* $ */

	toElement: function(){
		return this.element;
	}

});

ART.Container = new Class({

	push: function(){
		for (var i = 0; i < arguments.length; i++) arguments[i].inject(this);
		return this;
	},
	
	pull: function(){
		var element = (this.toElement) ? this.toElement() : null;
		for (var i = 0; i < arguments.length; i++){
			var child = arguments[i], parent = child.parentNode;
			if (child.parentNode && child.parentNode === element) child.eject();
		}
		return this;
	}

});

Color.detach = function(color){
	color = new Color(color); var alpha = color.get('alpha');
	return [color.set('alpha', 1).toString(), alpha];
};
