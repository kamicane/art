/*
---
name: ART.Font
description: "Fonts for ART, implements code from [Cufón](http://cufon.shoqolate.com/)"
authors: ["[Simo Kinnunen](http://twitter.com/sorccu)", "[Valerio Proietti](http://mad4milk.net/)"]
provides: ART.Font
requires: ART.Shape
...
*/

(function(){

var fonts = {};

ART.registerFont = function(font){
	var face = font.face, name = face['font-family'];
	if (!fonts[name]) fonts[name] = {};
	var currentFont = fonts[name];
	var isBold = (face['font-weight'] > 400), isItalic = (face['font-stretch'] == 'oblique');
	if (isBold && isItalic) currentFont.boldItalic = font;
	else if (isBold) currentFont.bold = font;
	else if (isItalic) currentFont.italic = font;
	else currentFont.normal = font;
	return this;
};

var VMLToSVG = function(path, s, x, y){
	var end = '';
	var regexp = /([mrvxe])([^a-z]*)/g, match;
	while ((match = regexp.exec(path))){
		var c = match[2].split(',');
		switch (match[1]){
			case 'v': end += 'c ' + (s * c[0]) + ',' + (s * c[1]) + ',' + (s * c[2]) + ',' + (s * c[3]) + ',' + (s * c[4]) + ',' + (s * c[5]); break;
			case 'r': end += 'l ' + (s * c[0]) + ',' + (s * c[1]); break;
			case 'm': end += 'M ' + (x + (s * c[0])) + ',' + (y + (s * c[1])); break;
			case 'x': end += 'z'; break;
		}
	}
	
	return end;
};

ART.Font = new Class({
	
	Extends: ART.Shape,
	
	initialize: function(font, variant, text, size){
		this.parent();
		if (font != null && text != null && size != null) this.draw(font, variant, text, size);
	},
	
	draw: function(font, variant, text, size){
		if (typeof font == 'string') font = fonts[font][(variant || 'normal').camelCase()];
		if (!font) throw new Error('The specified font has not been found.');
		size = size / font.face['units-per-em'];
		
		var width = 0, height = size * font.face.ascent, path = '';

		for (var i = 0, l = text.length; i < l; ++i){
			var glyph = font.glyphs[text.charAt(i)] || font.glyphs[' '];
			var w = size * (glyph.w || font.w);
			if (glyph.d) path += VMLToSVG('m' + glyph.d + 'x', size, width, height);
			width += w;
		}
		
		this.fontSize = {width: width, height: size * (font.face.ascent - font.face.descent)};
		
		return this.parent(path);
	},
	
	measure: function(){
		return this.fontSize || this.parent();
	}

});

})();
