/*
Script: Core.js
	Examples for Core.js

License:
	MIT-style license.
*/

describe('ART.Sheet.lookupStyle - no rules defined.', {

	'should return an empty object when no rule is found': function(){
		value_of(ART.Sheet.lookupStyle('*')).should_be({});
		value_of(ART.Sheet.lookupStyle('foo')).should_be({});
	}

});

describe('ART.Sheet.defineStyle', {

	'should define multiple rules for comma seperated selectors': function(){
		ART.Sheet.defineStyle('multiA, multiB', {m: 1});
		value_of(ART.Sheet.lookupStyle('multiA')).should_be({m: 1});
		value_of(ART.Sheet.lookupStyle('multiB')).should_be({m: 1});
		value_of(ART.Sheet.lookupStyle('multiC')).should_be({});
	},

	'should define some rules': function(){
		ART.Sheet.defineStyle('*', {base: 1, asterix: 1});
		value_of(ART.Sheet.lookupStyle('*')).should_be({base: 1, asterix: 1});
		
		ART.Sheet.defineStyle('foo', {base: 2, extended: 1});
		ART.Sheet.defineStyle('foo.classA', {extended: 2});
		ART.Sheet.defineStyle('foo.classB', {'class': 'b', 'tag': 'foo'});
		ART.Sheet.defineStyle('foo.classA.classB', {'class': 'a and b'});
		ART.Sheet.defineStyle('foo.classA', {'class': 'a'});
	}

});

describe('ART.Sheet.lookupStyle - rules defined', {

	'should merge with *': function(){
		value_of(ART.Sheet.lookupStyle('*')).should_be({base: 1, asterix: 1});
		value_of(ART.Sheet.lookupStyle('madeup')).should_be({base: 1, asterix: 1});
		value_of(ART.Sheet.lookupStyle('foo')).should_be({base: 2, extended: 1, asterix: 1});
	},
	
	'should find the class': function(){
		value_of(ART.Sheet.lookupStyle('.classA')).should_be({asterix: 1, base: 1});
		value_of(ART.Sheet.lookupStyle('foo.classA')).should_be({asterix: 1, base: 2, extended: 2, 'class': 'a'});
		value_of(ART.Sheet.lookupStyle('foo.classA')).should_be({asterix: 1, base: 2, extended: 2, 'class': 'a'});
		value_of(ART.Sheet.lookupStyle('foo.classB.classA.madeup')).should_be({asterix: 1, base: 2, extended: 2, 'class': 'a and b', tag: 'foo'});
	}
});