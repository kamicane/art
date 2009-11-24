/*
Script: ART.Text.js

License:
	MIT-style license.
*/

// ========================================== 
// This file implements code from Cufón
// http://wiki.github.com/sorccu/cufon/about
// http://cufon.shoqolate.com/
// MIT License
// ==========================================

ART.Font = new Class({
	
	initialize: function(font){
		this.ascent = font.face.ascent;
		this.descent = font.face.descent;
		this.units = font.face['units-per-em'];
		this.glyphs = font.glyphs;
		this.width = font.w;
	},
	
	measure: function(size, text){
		var width = 0, height = size;
		size = size / this.units;
		for (var i = 0, l = text.length; i < l; ++i){
			var glyph = this.glyphs[text.charAt(i)] || this.glyphs[' '];
			width += size * (glyph.w || this.width);
		}
		return {x: width, y: size * (this.ascent - this.descent)};
	}

});

(function(){
	var fonts = {};

	ART.Paint.defineFont = function(name, font){
		fonts[name.camelCase()] = new ART.Font(font);
		return this;
	};

	ART.Paint.lookupFont = function(name){
		return fonts[name.camelCase()];
	};
})();

ART.Paint.implement('text', function(font, size, text){
	if (typeof font == 'string') font = ART.Paint.lookupFont(font);
	if (!font) return this;

	this.save();
	var width = 0;
	size = size / font.units;
	this.shift({x: 0, y: Math.round(size * font.ascent)});
	for (var i = 0, l = text.length; i < l; ++i){
		var glyph = font.glyphs[text.charAt(i)] || font.glyphs[' '];
		if (glyph.d) this.path('m' + glyph.d, size);
		var w = size * (glyph.w || font.width);
		width += w;
		this.shift({x: w, y: 0});
	}
	return this.restore();
});
