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

	ART.Paint.defineFont = function(name, font){
		fonts[name.camelCase()] = new ART.Font(font);
		return this;
	};

	ART.Paint.lookupFont = function(name){
		return fonts[name.camelCase()];
	};
})();

(function(){
	
	// Canvas Adapter only
	
	function parseGlyph(glyph) {
		var path = 'm' + glyph.d;
		var shapes = [];
		
		var regexp = /([mrvxe])([^a-z]*)/g, match;
		while ((match = regexp.exec(path))){
			shapes.push([match[1]].concat(match[2].split(',').map(function(bit) {
				return ~~bit;
			})));
		}
		return (glyph.shapes = shapes);
	};
	
	function renderGlyph(ctx, size, glyph){
		var shapes = glyph.shapes || parseGlyph(glyph);
		
		var y = 0, y = 0, shape;
		for (var i = 0; shape = shapes[i]; i++){
			switch (shape[0]){
				case 'v':
					ctx.bezierCurveTo(
						x + size * shape[1], y + size * shape[2],
						x + size * shape[3], y + size * shape[4],
						x += size * shape[5], y += size * shape[6]
					);
					break;
				case 'r':
					ctx.lineTo(x += size * shape[1], y += size * shape[2]);
					break;
				case 'm':
					ctx.moveTo(x = size * shape[1], y = size * shape[2]);
					break;
				case 'x':
					ctx.closePath();
					break;
				case 'e': return;
			}
		}
	};

	ART.Adapter.Canvas.implement('text', function(font, size, text){
		if (typeof font == 'string') font = ART.Paint.lookupFont(font);
		if (!font) return this;

		size = size / font.units;
		
		this.context.save();
		
		this.context.translate(0, Math.round(size * font.ascent));
		
		Array.each(text, function(t){
			var glyph = font.glyphs[t] || font.glyphs[' '];
			if (glyph.d) renderGlyph(this.context, size, glyph);
			this.context.translate(size * (glyph.w || font.width), 0);
		}, this);
		
		this.context.restore();
		return this;
	});
	
})();
