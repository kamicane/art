/*=
name: Touch
version: 0.1
description: Simple drag implementation that works with standard-sized browsers and hooks with mobile safari touch events.
license: MooTools MIT-Style License (http://mootools.net/license.txt)
copyright: Valerio Proietti (http://mad4milk.net)
authors: Valerio Proietti (http://mad4milk.net)
requires: MooTools 1.2.3+ (Core) (http://mootools.net/download)
=*/

var Touch = new Class({
	
	Implements: Events,
	
	initialize: function(element){
		this.element = document.id(element);
		
		this.bound = {
			start: this.start.bind(this),
			move: this.move.bind(this),
			end: this.end.bind(this)
		};
		
		if (Browser.Platform.ipod){
			this.context = this.element;
			this.startEvent = 'touchstart';
			this.endEvent = 'touchend';
			this.moveEvent = 'touchmove';
		} else {
			this.context = document;
			this.startEvent = 'mousedown';
			this.endEvent = 'mouseup';
			this.moveEvent = 'mousemove';
		}
		
		this.attach();
	},
	
	// public methods
	
	attach: function(){
		this.element.addListener(this.startEvent, this.bound.start);
	},
	
	detach: function(){
		this.element.removeListener(this.startEvent, this.bound.start);
	},
	
	// protected methods
	
	start: function(event){
		this.preventDefault(event);
		// this prevents the copy-paste dialog to show up when dragging. it only affects mobile safari.
		document.body.style.WebkitUserSelect = 'none';
		
		this.hasDragged = false;
		
		this.context.addListener(this.moveEvent, this.bound.move);
		this.context.addListener(this.endEvent, this.bound.end);
		
		var page = this.getPage(event);
			
		this.startX = page.pageX;
		this.startY = page.pageY;
		
		this.fireEvent('start');
	},
	
	move: function(event){
		this.preventDefault(event);
		
		this.hasDragged = true;
		
		var page = this.getPage(event);
		
		this.deltaX = page.pageX - this.startX;
		this.deltaY = page.pageY - this.startY;
		
		this.fireEvent('move', [this.deltaX, this.deltaY]);
	},
	
	end: function(event){
		this.preventDefault(event);
		// we re-enable the copy-paste dialog on drag end
		document.body.style.WebkitUserSelect = '';
		
		this.context.removeListener(this.moveEvent, this.bound.move);
		this.context.removeListener(this.endEvent, this.bound.end);

		this.fireEvent((this.hasDragged) ? 'end' : 'cancel');
	},
	
	preventDefault: function(event){
		if (event.preventDefault) event.preventDefault();
		else event.returnValue = false;
	},
	
	getPage: function(event){
		//when on mobile safari, the coordinates information is inside the targetTouches object
		if (event.targetTouches) event = event.targetTouches[0];
		if (event.pageX != null && event.pageY != null) return {pageX: event.pageX, pageY: event.pageY};
		var element = (!document.compatMode || document.compatMode == 'CSS1Compat') ? document.documentElement : document.body;
		return {pageX: event.clientX + element.scrollLeft, pageY: event.clientY + element.scrollTop};
	}
	
});
