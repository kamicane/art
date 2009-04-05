/* Subtle Parser */

var SubtleSlickParse = (function(ssp){
	
	function SubtleSlickParse(CSS3_Selectors){
		ssp.selector = ''+CSS3_Selectors;
		if(!SubtleSlickParse.debug && ssp.cache[ssp.selector]) return ssp.cache[ssp.selector];
		ssp.parsedSelectors = [];
		ssp.parsedSelectors.type=[];
		
		while (ssp.selector != (ssp.selector = ssp.selector.replace(ssp.parseregexp, ssp.parser)));
		
		// ssp.parsedSelectors.type = ssp.parsedSelectors.type.join('');
		return ssp.cache[''+CSS3_Selectors] = ssp.parsedSelectors;
	};
	
	// Public methods ad properties
	var parseregexpBuilder = ssp.parseregexp;
	SubtleSlickParse.setCombinators = function setCombinators(combinatorsArray){
		ssp.combinators = combinatorsArray;
		ssp.parseregexp = parseregexpBuilder(ssp.XRegExp_escape(ssp.combinators.join('')));
	};
	SubtleSlickParse.getCombinators = function getCombinators(){
		return ssp.combinators;
	};
	
	SubtleSlickParse.cache = ssp.cache;
	SubtleSlickParse.attribValueToRegex = ssp.attribValueToRegex(ssp);
	
	ssp.MAP(ssp);
	ssp.parser(ssp);
	SubtleSlickParse.setCombinators(ssp.combinators);
	
	return SubtleSlickParse;
})({
	parseregexp: function(combinators){
		return new RegExp(("(?x)\n\
			^(?:\n\
			         \\s   +  (?= ["+combinators+"] | $) # Meaningless Whitespace \n\
			|      ( \\s  )+  (?=[^"+combinators+"]    ) # CombinatorChildren     \n\
			|      ( ["+combinators+"] ) \\s* # Combinator             \n\
			|      ( ,                 ) \\s* # Separator              \n\
			|      ( [a-z0-9_-]+ | \\* )      # Tag                    \n\
			| \\#  ( [a-z0-9_-]+       )      # ID                     \n\
			| \\.  ( [a-z0-9_-]+       )      # ClassName              \n\
			| \\[  ( [a-z0-9_-]+       )(?: ([*^$!~|]?=) (?: \"([^\"]*)\" | '([^']*)' | ([^\\]]*) )     )?  \\](?!\\]) # Attribute \n\
			|   :+ ( [a-z0-9_-]+       )(            \\( (?: \"([^\"]*)\" | '([^']*)' | ([^\\)]*) ) \\) )?             # Pseudo    \n\
			)").replace(/\(\?x\)|\s+#.*$|\s+/gim, ''), 'i');
	},
	
	combinators:'> + ~'.split(' '),
	
	map: {
		rawMatch : 0,
		offset   : -2,
		string   : -1,
		
		combinator : 1,
		combinatorChildren : 2,
		separator  : 3,
		
		tagName   : 4,
		id        : 5,
		className : 6,
		
		attributeKey         : 7,
		attributeOperator    : 8,
		attributeValueDouble : 9,
		attributeValueSingle : 10,
		attributeValue       : 11,
		
		pseudoClass            : 12,
		pseudoClassArgs        : 13,
		pseudoClassValueDouble : 14,
		pseudoClassValueSingle : 15,
		pseudoClassValue       : 16
	},
	
	MAP: function(ssp){
		var obj = {};
		for (var property in ssp.map) {
			var value = ssp.map[property];
			if (value<1) continue;
			obj[value] = property;
		}
		return ssp.MAP = obj;
	},
	
	parser: function(ssp){
		function parser(){
			var a = arguments;
			var selectorBitMap;
			var selectorBitName;
		
			// MAP arguments
			for (var aN=1; aN < a.length; aN++) {
				if (a[aN]) {
					selectorBitMap = aN;
					selectorBitName = ssp.MAP[selectorBitMap];
					SubtleSlickParse.debug && console.log(a[0], selectorBitName);
					break;
				}
			}
		
			SubtleSlickParse.debug && console.log((function(){
				var o = {};
				o[selectorBitName] = a[selectorBitMap];
				return o;
			})());
		
			if (!ssp.parsedSelectors.length || a[ssp.map.separator]) {
				ssp.parsedSelectors.push([]);
				ssp.these_simpleSelectors = ssp.parsedSelectors[ssp.parsedSelectors.length-1];
				if (ssp.parsedSelectors.length-1) return '';
			}
		
			if (!ssp.these_simpleSelectors.length || a[ssp.map.combinatorChildren] || a[ssp.map.combinator]) {
				ssp.this_simpleSelector && (ssp.this_simpleSelector.reverseCombinator = a[ssp.map.combinatorChildren] || a[ssp.map.combinator]);
				ssp.these_simpleSelectors.push({
					combinator: a[ssp.map.combinatorChildren] || a[ssp.map.combinator]
				});
				ssp.this_simpleSelector = ssp.these_simpleSelectors[ssp.these_simpleSelectors.length-1];
				ssp.parsedSelectors.type.push(ssp.this_simpleSelector.combinator);
				if (ssp.these_simpleSelectors.length-1) return '';
			}
		
			switch(selectorBitMap){
			
			case ssp.map.tagName:
				ssp.this_simpleSelector.tag = a[ssp.map.tagName];
				break;
			
			case ssp.map.id:
				ssp.this_simpleSelector.id  = a[ssp.map.id];
				break;
			
			case ssp.map.className:
				if(!ssp.this_simpleSelector.classes)
					ssp.this_simpleSelector.classes = [];
				ssp.this_simpleSelector.classes.push(a[ssp.map.className]);
				break;
			
			case ssp.map.attributeKey:
				if(!ssp.this_simpleSelector.attributes)
					ssp.this_simpleSelector.attributes = [];
				ssp.this_simpleSelector.attributes.push({
					name     : a[ssp.map.attributeKey],
					operator : a[ssp.map.attributeOperator] || null,
					value    : a[ssp.map.attributeValue] || a[ssp.map.attributeValueDouble] || a[ssp.map.attributeValueSingle] || null,
					regexp   : SubtleSlickParse.attribValueToRegex(a[ssp.map.attributeOperator], a[ssp.map.attributeValue] || a[ssp.map.attributeValueDouble] || a[ssp.map.attributeValueSingle] || '')
				});
				break;
			
			case ssp.map.pseudoClass:
				if(!ssp.this_simpleSelector.pseudos)
					ssp.this_simpleSelector.pseudos = [];
				var pseudoClassValue = a[ssp.map.pseudoClassValue] || a[ssp.map.pseudoClassValueDouble] || a[ssp.map.pseudoClassValueSingle];
				if (pseudoClassValue == 'odd') pseudoClassValue = '2n+1';
				if (pseudoClassValue == 'even') pseudoClassValue = '2n';
			
				pseudoClassValue = pseudoClassValue || (a[ssp.map.pseudoClassArgs] ? "" : null);
			
				ssp.this_simpleSelector.pseudos.push({
					name     : a[ssp.map.pseudoClass],
					argument : pseudoClassValue
				});
				break;
			}
		
			ssp.parsedSelectors.type.push(selectorBitName + (a[ssp.map.attributeOperator]||''));
			return '';
		};
		return ssp.parser = parser;
	},
	
	attribValueToRegex: function(ssp){
		function attribValueToRegex(operator, value){
			if (!operator) return null;
			var val = ssp.XRegExp_escape(value);
			switch(operator){
			case  '=': return new RegExp('^'      +val+ '$'     );
			case '!=': return new RegExp('^(?!'   +val+ '$)'    );
			case '*=': return new RegExp(          val          );
			case '^=': return new RegExp('^'      +val          );
			case '$=': return new RegExp(          val+ '$'     );
			case '~=': return new RegExp('(^|\\s)'+val+'(\\s|$)');
			case '|=': return new RegExp('(^|\\|)'+val+'(\\||$)');
			default  : return null;
			}
		};
		return ssp.attribValueToRegex = attribValueToRegex;
	},
	
	cache:{},
	
	selector: null,
	parsedSelectors: null,
	this_simpleSelector: null,
	these_simpleSelectors: null,
	
	/* XRegExp_escape taken from XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License */
	/*** XRegExp.escape accepts a string; returns the string with regex metacharacters escaped. the returned string can safely be used within a regex to match a literal string. escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $, |, #, [comma], and whitespace. */
	XRegExp_escape: function(str){ return String(str).replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&"); }
	
});
