/*
Script: ART.Font.js

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
		this.units = font.face['units-per-em'];
		this.glyphs = font.glyphs;
		this.width = font.w;
	},
	
	measure: function(size, text){
		var width = 0, height = size;
		size = size / this.units;
		Array.each(text, function(t){
			var glyph = this.glyphs[t] || this.glyphs[' '];
			width += size * (glyph.w || this.width);
		}, this);
		return {x: width, y: size * this.ascent};
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

(function(){
	
	var renderGlyph = function(ctx, s, glyph){
		var regexp = /([mrvxe])([^a-z]*)/g, match;
		for (var i = 0; match = regexp.exec(glyph); i++){
			var c = match[2].split(',');
			switch (match[1]){
				case 'v': ctx.bezierBy({x: s * c[0], y: s * c[1]}, {x: s * c[2], y: s * c[3]}, {x: s * c[4], y: s * c[5]}); break;
				case 'r': ctx.lineBy({x: s * c[0], y: s * c[1]}); break;
				case 'm': ctx.moveTo({x: s * c[0], y: s * c[1]}); break;
				case 'x': ctx.join(); break;
				case 'e': return;
			}
		}
	};

	ART.Paint.implement('text', function(font, size, text){
		if (typeof font == 'string') font = ART.Paint.lookupFont(font);
		if (!font) return this;

		this.save();
		var width = 0;
		size = size / font.units;
		this.shift({x: 0, y: Math.round(size * font.ascent)});
		Array.each(text, function(t){
			var glyph = font.glyphs[t] || font.glyphs[' '];
			if (glyph.d) renderGlyph(this, size, 'm' + glyph.d);
			var w = size * (glyph.w || font.width);
			width += w;
			this.shift({x: w, y: 0});
		}, this);
		return this.restore();
	});
	
})();
