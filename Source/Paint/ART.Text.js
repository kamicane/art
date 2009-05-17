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
		this.descent = font.face.descent;
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
		return {x: width, y: size * (this.ascent - this.descent)};
	}

});

(function(){
	var fonts = {};
	
	var parse = function(font) {
		font.parsed = true;
		
		Hash.each(font.glyphs, function(glyph, char, self) {
			if (!glyph.d) return;
			var path = 'm' + glyph.d;
			glyph.parsed = [];
			
			var regexp = /([mrvxe])([^a-z]*)/g, match;
			while ((match = regexp.exec(path))){
				glyph.parsed.push([match[1]].concat(match[2].split(',').map(function(bit) {
					return ~~bit;
				})));
			}
		});
		
		return font;
	};

	ART.Paint.defineFont = function(name, font){
		fonts[name.camelCase()] = new ART.Font(font);
		return this;
	};

	ART.Paint.lookupFont = function(name){
		var font = fonts[name.camelCase()];
		return (font && !font.parsed) ? parse(font) : font;
	};
})();

(function(){
	
	var renderGlyph = function(ctx, s, glyphs){
		for (var i = 0, glyph; glyph = glyphs[i]; i++){
			switch (glyph[0]){
				case 'v':
					ctx.bezierBy({x: s * glyph[1], y: s * glyph[2]}, {x: s * glyph[3], y: s * glyph[4]}, {x: s * glyph[5], y: s * glyph[6]});
					break;
				case 'r':
					ctx.lineBy({x: s * glyph[1], y: s * glyph[2]});
					break;
				case 'm':
					ctx.moveTo({x: s * glyph[1], y: s * glyph[2]});
					break;
				case 'x':
					ctx.join();
					break;
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
			if (glyph.parsed) renderGlyph(this, size, glyph.parsed);
			var w = size * (glyph.w || font.width);
			width += w;
			this.shift({x: w, y: 0});
		}, this);
		return this.restore();
	});
	
})();
