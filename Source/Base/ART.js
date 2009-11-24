/*
Script: ART.js

License:
	MIT-style license.
*/

var ART = (function(){

	var api = function(){}, defaultAdapter;

	api.getDefaultAdapter = function(){
		return defaultAdapter[0];
	};

	api.registerAdapter = function(adapter, priority){
		if (adapter.prepare()){
			if (!defaultAdapter || defaultAdapter[1] < priority){
				defaultAdapter = arguments;
			}
		}
		return api;
	};

	return api;

})();

// kappa!

Math.kappa = (4 * (Math.sqrt(2) - 1) / 3);
