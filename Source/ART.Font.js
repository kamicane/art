/*
---

name: ART.Font

description: Fonts for ART, implements code from Cufón (http://wiki.github.com/sorccu/cufon/about), (http://cufon.shoqolate.com/)

provides: [ART:text, ART.Font]

requires: [ART.Canvas, ART.VML]

...
*/

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

ART.registerFont = function(font){
	var face = font.face, name = face['font-family'].toLowerCase().split(' ');
	if (face['font-weight'] > 400) name.push('bold');
	if (face['font-stretch'] == 'oblique') name.push('italic');
	fonts[name.join('-')] = new ART.Font(font);
};

var path = function(path, s, self){
	var X = 0, Y = 0;
	var regexp = /([mrvxe])([^a-z]*)/g, match;
	while ((match = regexp.exec(path))){
		var c = match[2].split(',');
		switch (match[1]){
			case 'v':
				self.bezierTo({x: X + s * ~~c[0], y: Y + s * ~~c[1]}, {x: X + s * ~~c[2], y: Y + s * ~~c[3]}, {x: X += s * ~~c[4], y: Y += s * ~~c[5]});
				break;
			case 'r': self.lineTo({x: X += s * ~~c[0], y: Y += s * ~~c[1]}); break;
			case 'm': self.moveTo({x: X = s * ~~c[0], y: Y = s * ~~c[1]}); break;
			case 'x': self.join(); break;
			case 'e': return;
		}
	}
};

ART.implement({'text': function(font, size, text){
	if (typeof font == 'string') font = fonts[font];
	if (!font) return new Error('The specified font has not been found.');

	this.save();
	size = size / font.units;
	// Temporary "relative" fix shifting the whole layer by the pointer, since the pointer is lost with path. Should not matter since it's later restored.
	this.shift({x: this.pointer.x, y: this.pointer.y + Math.round(size * font.ascent)});
	for (var i = 0, l = text.length; i < l; ++i){
		var glyph = font.glyphs[text.charAt(i)] || font.glyphs[' '];
		if (glyph.d) path('m' + glyph.d, size, this);
		var w = size * (glyph.w || font.width);
		this.shift({x: w, y: 0});
	}
	return this.restore();
}});

})();
