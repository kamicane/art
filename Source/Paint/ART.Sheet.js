/*
Script: ART.Sheet.js

License:
	MIT-style license.
*/

ART.Sheet = {};


// Merge chain: * > button > button:hover > button.metal > button.metal:hover

(function(){
	var rules = {};

	ART.Sheet.defineStyle = function(sel, style){
		var parsed = SubtleSlickParse(sel)[0][0];
		sel = parsed.tag || '*';
		if (parsed.classes) sel += '.' + parsed.classes[0];
		if (parsed.pseudos) sel += ':' + parsed.pseudos[0].name;
		var styleCC = {};
		for (p in style) styleCC[p.camelCase()] = style[p];
		rules[sel] = styleCC;
	};

	ART.Sheet.lookupStyle = function(sel, state){
		sel = SubtleSlickParse(sel)[0][0];
		var style = {};
		var add = function(sel){
			$mixin(style, rules[sel]);
		};

		['*'].include(sel.tag || '*').each(function(tag){
			add(tag);
			if (state) add(tag + ':' + state);
			if (sel.classes){
				sel.classes.each(function(klass){
					add(tag + '.' + klass);
				});
			}
			if (state && sel.classes){
				sel.classes.each(function(klass){
					add(tag + '.' + klass + ':' + state);
				});
			}
		});
		
		return style;
	};
})();
