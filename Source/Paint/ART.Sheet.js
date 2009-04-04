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
		rules[sel] = style;
	};

	ART.Sheet.lookupStyle = function(sel){
		sel = SubtleSlickParse(sel)[0][0];
		var style = {};
		var add = function(sel){
			$mixin(style, rules[sel]);
		};

		['*'].include(sel.tag || '*').each(function(tag){
			add(tag);
			if (sel.pseudos) add(tag + ':' + sel.pseudos[0].name);
			if (sel.classes){
				sel.classes.each(function(klass){
					add(tag + '.' + klass);
				});
			}
			if (sel.pseudos && sel.classes){
				sel.classes.each(function(klass){
					add(tag + '.' + klass + ':' + sel.pseudos[0].name);
				});
			}
		});
		
		return style;
	};
})();
