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
    //	'htmlTrusted',

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
	    $routeProvider

	      /* Core Views */
	      .when('/', {
	        templateUrl: 'core/landing.html'
	      })
	      .when('/login', {
	        templateUrl: 'core/login.html',
	        controller: 'LoginController'
	      })
	      .when('/register', {
	        templateUrl: 'core/register.html',
	        controller: 'RegisterController'
	      })

	      /* Facilitator Views */
		  .when('/facilitator/mgmt/:id', {
	        templateUrl: 'facilitator/group-mgmt.html',
	        controller: 'GroupMgmtController'
	        // TODO: resolve block w/ isloggedIn() isFacilitator()
	      })
	      .when('/facilitator', { // TODO: add :groupId
	        templateUrl: 'facilitator/reciever.html',
	        controller: 'RecieverController'
	        // TODO: resolve block w/ isloggedIn() isFacilitator()
	      })

	      /* Participant View */
	      .when('/participant', { // TODO: add :groupId
	        templateUrl: 'participant/sharer.html',
	        controller: 'SharerController'
	        // TODO: resolve block w/ isloggedIn() isParticipant()
	      })

	      .otherwise({
	        redirectTo: '/'
	      });

	}
})();