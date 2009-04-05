/*
Script: ART.Sheet.js

License:
	MIT-style license.
*/

ART.Sheet = {};

(function(){
	// http://www.w3.org/TR/CSS21/cascade.html#specificity
	var rules = [];

	var parseSelector = function(selector){
		return selector.map(function(chunk){
			var result = [];
			if (chunk.tag && chunk.tag != '*'){
				result.push(chunk.tag);
			}
			if (chunk.pseudos) chunk.pseudos.each(function(pseudo){
				result.push(':' + pseudo.name);
			});
			if (chunk.classes) chunk.classes.each(function(klass){
				result.push('.' + klass);
			});
			return result;
		});
	};

	var getSpecificity = function(selector){
		specificity = 0;
		selector.each(function(chunk){
			if (chunk.tag && chunk.tag != '*') specificity++;
			specificity += (chunk.pseudos || []).length;
			specificity += (chunk.classes || []).length * 100;
		});
		return specificity;
	};

	ART.Sheet.defineStyle = function(selectors, style){
		SubtleSlickParse(selectors).each(function(selector){
			var rule = {
				'specificity': getSpecificity(selector),
				'selector': parseSelector(selector),
				'style': {}
			};
			for (p in style) rule.style[p.camelCase()] = style[p];
			rules.push(rule);
		});
	};

	ART.Sheet.lookupStyle = function(selector){
		var style = {};
		rules.sort(function(a, b){
			return a.specificity - b.specificity;
		});

		selector = parseSelector(SubtleSlickParse(selector)[0]);
		rules.each(function(rule){
			if (selector.getLast().containsAll(rule.selector.getLast())){
				$mixin(style, rule.style);
			}
		});

		return style;
	};

})();

Array.implement('containsAll', function(other){
	return other.every(function(x){
		return this.contains(x);
	}, this);
});
