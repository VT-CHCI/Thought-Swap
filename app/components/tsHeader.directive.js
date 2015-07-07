(function () {
	'use strict';

	/**
	 * @ngdoc overview ...
	 * @name ...
	 * @description
	 * # The ... controller ...
	 * # ...
	 */
	angular.module('app')
		.directive('tsHeader', function ($location, UserService) {
	  return {
	    restrict: 'E',
	    replace: true,
	    scope: {},
	    link: function(scope, element, attrs) {
	    	scope.userService = UserService;

	    	scope.logOut = function () {
	            scope.dataLoading = true;
	            scope.isFacilitator = UserService.isFacilitator
	            UserService.logout()
	                .then(function (user) {
	                	if (scope.isFacilitator) {
	                		$location.path('/login/facilitator')
	                	} else {
		                    $location.path('/login');
	                	}
	                })
	                .catch(function (err) {
	                    console.log('Error logging out', err);
	                    scope.dataLoading = false;
	                });
	        };

	        scope.shouldOfferLogin = function() {
	        	var path = $location.path();
	        	return !UserService.isLoggedIn() && (path === '/');
	        };
	    },
	    templateUrl: 'components/tsHeader.directive.html'
	  };
	});

})();
