(function () {
	'use strict';

	/**
	 * @ngdoc overview ...
	 * @name ...
	 * @description
	 * # The ... controller ...
	 * # ...
	 */
	angular.module('logger', ['thoughtSwap'])
			.service('LoggerService', LoggerService);

	LoggerService.$inject = ['ThoughtSocket'];
	function LoggerService(ThoughtSocket) {
		var LoggerService = this;
		this.createEvent = function(info) {
			ThoughtSocket.emit('log', info);
		}
	}
 
})();