/*
Script: ART.Sheet.js

License:
	MIT-style license.
*/

ART.Sheet = {};

(function(){
	// http://www.w3.org/TR/CSS21/cascade.html#specificity
	var rules = [];

	ART.Sheet.defineStyle = function(sel, style){
		var rule = {'specificity': 0, 'selector': [], 'style': {}};
		rules.push(rule);
		for (p in style) rule.style[p.camelCase()] = style[p];

		var parsed = SubtleSlickParse(sel)[0][0];
		if (parsed.tag && parsed.tag != '*'){
			rule.specificity += 1;
			rule.selector.push(parsed.tag);
		}
		if (parsed.pseudos) parsed.pseudos.each(function(pseudo){
			rule.specificity += 1;
			rule.selector.push(':' + pseudo.name);
		});
		if (parsed.classes) parsed.classes.each(function(klass){
			rule.specificity += 10;
			rule.selector.push('.' + klass);
		});
	};

	ART.Sheet.lookupStyle = function(sel){
		var style = {};
		rules.sort(function(a, b){
			return a.specificity - b.specificity;
		});

		var selector = [];
		var parsed = SubtleSlickParse(sel)[0][0];
		if (parsed.tag && parsed.tag != '*'){
			selector.push(parsed.tag);
		}
		if (parsed.pseudos) parsed.pseudos.each(function(pseudo){
			selector.push(':' + pseudo.name);
		});
		if (parsed.classes) parsed.classes.each(function(klass){
			selector.push('.' + klass);
		});

		rules.each(function(rule){
			if (rule.selector.every(function(chunk){
				return selector.contains(chunk);
			})){
				$mixin(style, rule.style);
			}
		});
		
		return style;
	};
})();
