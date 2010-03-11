/*
---

name: ART.Base

description: implements ART, ART.Shape and ART.Group based on the current browser.

authors: [Valerio Proietti](http://mad4milk.net)

provides: [ART.Base, ART.Group, ART.Shape]

requires: [ART.VML, ART.SVG]

...
*/

(function(){
	
var SVG = function(){

	var implementation = document.implementation;
	return (implementation && implementation.hasFeature && implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));

};

var VML = function(){

	var namespaces = document.namespaces;
	if (!namespaces) return false;

	namespaces.add('av', 'urn:schemas-microsoft-com:vml');
	namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');
	return true;

};

var MODE = SVG() ? 'SVG' : VML() ? 'VML' : null;
if (!MODE) return;

ART.Shape = new Class({Extends: ART[MODE].Shape});
ART.Group = new Class({Extends: ART[MODE].Group});
ART.implement({Extends: ART[MODE]});

})();
