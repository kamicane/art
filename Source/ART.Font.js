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
	var face = font.face,
	    family = face['font-family'],
	    weight = (face['font-weight'] > 400 ? 'bold' : 'normal'),
	    style = (face['font-stretch'] == 'oblique' ? 'italic' : 'normal');
	fonts[weight + style + name] = font;
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

var parseFontString = function(font){
	var regexp = /^\s*((?:(?:normal|bold|italic)\s+)*)(?:(\d+(?:\.\d+)?)[ptexm\%]*(?:\s*\/.*?)?\s+)?\s*\"?([^\"]*)/i,
	    match = regexp.exec(font);
	return {
		fontFamily: match[3],
		fontSize: match[2],
		fontStyle: (/italic/.exec(match[1]) || ''),
		fontWeight: (/bold/.exec(match[1]) || '')
	};
};

ART.Font = new Class({
	
	Extends: ART.Shape,
	
	initialize: function(text, font){
		this.parent();
		if (text != null && font != null) this.draw(text, font);
	},
	
	draw: function(text, font){
		if (typeof font == 'string') font = parseFontString(font);
		
		var family = font.fontFamily || font['font-family'],
			weight = font.fontWeight || font['font-weight'] || 'normal',
			style = font.fontStyle || font['font-style'] || 'normal',
			size = parseFloat(font.fontSize || font['font-size'] || font.size);
		
		font = font.glyphs ? font : fonts[weight + style + name];
		
		if (!font) throw new Error('The specified font has not been found.');
		size = size / font.face['units-per-em'];
		
		var width = 0, height = size * font.face.ascent, path = '';

		for (var i = 0, l = text.length; i < l; ++i){
			var glyph = font.glyphs[text.charAt(i)] || font.glyphs[' '];
			var w = size * (glyph.w || font.w);
			if (glyph.d) path += VMLToSVG('m' + glyph.d + 'x', size, width, height);
			width += w;
		}
		
		height -= size * font.face.descent;
		
		this.fontSize = {left: 0, top: 0, right: width, bottom: height, width: width, height: height};
		
		return this.parent(path);
	},
	
	measure: function(){
		return this.fontSize || this.parent();
	}

});

})();
