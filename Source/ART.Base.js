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

	try { //this currently throws an error in some IE8 modes. NEED TO FIX.

		namespaces.add('av', 'urn:schemas-microsoft-com:vml');
		namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');

		var sheet = document.createStyleSheet();
		sheet.addRule('vml', 'display:inline-block;position:relative;overflow:hidden;');

		sheet.addRule('av\\:*', 'behavior:url(#default#VML);display:inline-block;position:absolute;width:100%;height:100%;left:0px;top:0px;');
		sheet.addRule('ao\\:*', 'behavior:url(#default#VML);');
		
		return true;

	} catch(e){
		return false;
	}

};

var MODE = SVG() ? 'SVG' : VML() ? 'VML' : null;
if (!MODE) return;

ART.Shape = new Class({Extends: ART[MODE].Shape});
ART.Group = new Class({Extends: ART[MODE].Group});
ART.implement({Extends: ART[MODE]});

})();
