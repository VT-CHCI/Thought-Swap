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
				link: function (scope, element, attrs) {
					scope.userService = UserService;

					scope.logOut = function () {
						scope.dataLoading = true;
						scope.isFacilitator = UserService.isFacilitator;
						UserService.logout()
							.then(function () {
								if (scope.isFacilitator) {
									$location.path('/login/facilitator');
								} else {
									$location.path('/login');
								}
							})
							.catch(function (err) {
								console.log('Error logging out', err);
								scope.dataLoading = false;
							});
					};

					

					scope.hideUsername = function () { 
						scope.isNameHidden =true;
					};

					scope.showUsername = function () { 
						scope.isNameHidden =false;
					};


					scope.shouldOfferLogin = function () {
						var path = $location.path();
						return !UserService.isLoggedIn() && 
						(path === '/' || path === '/about' || path === '/help');
					};
				},
				templateUrl: 'common/directives/tsHeader/tsHeader.html'
			};
		});

})();