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

window.fonts = {};

ART.registerFont = function(font){
	var face = font.face, name = face['font-family'].toLowerCase().split(' ');
	if (face['font-weight'] > 400) name.push('bold');
	if (face['font-stretch'] == 'oblique') name.push('italic');
	fonts[name.join('-')] = new ART.Font(font);
};

ART.implement({'text': function(font, size, text){
	if (typeof font == 'string') font = fonts[font];
	if (!font) return new Error('The specified font has not been found.');

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
}});

})();
