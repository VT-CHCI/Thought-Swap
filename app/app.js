(function () {
	'use strict';

	/**
	 * @ngdoc overview
	 * @name app
	 * @description
	 * # The main module of ThoughtSwap application.
	 */
	angular.module('app', [
		/* Angular Modules */
      'ngRoute',
      'ngCookies',

    /* Custom Components */
      'authentication',

    /* 3rd-party modules */
      'btford.socket-io',
      'ui.bootstrap',
      'textAngular',
      'angular-md5'
	])
	.config(config);

	//===========================================================================

	config.$inject = ['$routeProvider'];
	function config($routeProvider) {
		var isAuthenticated = {
        	isloggedIn: function (UserService, $location) {
        		if (!UserService.isLoggedIn()) {
        			$location.path('/login');
        		}
        		return UserService.isLoggedIn();
        	}
        };

	    $routeProvider

	      /* Core Views */
	      .when('/', {
	        templateUrl: 'core/landing.html'
	      })
	      .when('/login', {
	        templateUrl: 'core/login.html',
	        controller: 'LoginController',
	        resolve: { 
	        	isFacilitator: function () {
	        		return false;
	        	}
	        }
	      })
	      .when('/login/facilitator', {
	        templateUrl: 'core/login.html',
	        controller: 'LoginController',
	        resolve: {
	        	isFacilitator: function () {
	        		return true;
	        	}
	        }
	      })
	      .when('/register', {
	        templateUrl: 'core/register.html',
	        controller: 'RegisterController'
	      })

	      /* Facilitator Views */
		  .when('/facilitator/mgmt/:id', {
	        templateUrl: 'facilitator/group-mgmt.html',
	        controller: 'GroupMgmtController',
	        resolve: isAuthenticated
	      })
	      
	      .when('/facilitator', { // TODO: add :groupId
	        templateUrl: 'facilitator/reciever.html',
	        controller: 'RecieverController',
	        resolve: isAuthenticated
	      })

	      /* Participant View */
	      .when('/participant', { // TODO: add :groupId
	        templateUrl: 'participant/sharer.html',
	        controller: 'SharerController',
	        resolve: isAuthenticated
	      })

	      .otherwise({
	        redirectTo: '/'
	      });

	}
})();