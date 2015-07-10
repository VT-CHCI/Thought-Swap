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

    /* Custom Modules */
      'authentication',
      'groups',

    /* 3rd-party modules */
      'btford.socket-io',
      'ui.bootstrap',
      'textAngular',
      'angular-md5',
      'thoughtSwap'
	])
	.config(config)
	.run(run);

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
        var isFacilitator = {
        	isFacilitator: function (UserService, $location) {
        		if (!UserService.isFacilitator()) {
        			$location.url('/participant?facilitator');
        		}
        	}
        };
        var isParticipant = {
        	isParticipant: function (UserService, $location) {
        		if (UserService.isParticipant()) {
        			$location.url('/participant');

        		}
        	}
        }

	    $routeProvider

	      /* Core Views */
	      .when('/', {
	        templateUrl: 'core/landing.html',
	        resolve: isParticipant
	      })
	      .when('/login', {
	        templateUrl: 'core/login.html',
	        controller: 'LoginController',
	        resolve: { 
	        	facilitatorLogin: function () {
	        		return false;
	        	}
	        }
	      })
	      .when('/login/facilitator', {
	        templateUrl: 'core/login.html',
	        controller: 'LoginController',
	        resolve: {
	        	facilitatorLogin: function () {
	        		return true;
	        	}
	        }
	      })
	      .when('/register', {
	        templateUrl: 'core/register.html',
	        controller: 'RegisterController'
	      })

	      /* Facilitator Views */
		  .when('/facilitator/mgmt', {
	        templateUrl: 'facilitator/group-mgmt.html',
	        controller: 'GroupMgmtController',
	        resolve: isFacilitator
	      })
	      
	      .when('/facilitator/:groupId', {
	        templateUrl: 'facilitator/reciever.html',
	        controller: 'RecieverController',
	        resolve: isFacilitator
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

	run.$inject = ['$rootScope', 'ThoughtSocket', '$cookies'];
	function run ($rootScope, ThoughtSocket, $cookies) {
		ThoughtSocket.on('socket-id', function (socketId) {
			console.log('got socket id', socketId);
			$cookies.putObject('TS-sid', {id:socketId});
		});
		$rootScope.$on('$locationChangeStart', function () {
			if ($cookies.getObject('TS-sid') && $cookies.getObject('TS-sid').hasOwnProperty('id')) {
				console.log($cookies.getObject('TS-sid').id);
		        console.log('$locationChangeStart changed!', new Date());
		        ThoughtSocket.emit('facilitator-leave', $cookies.getObject('TS-sid').id);
				
			}
	    });
	    $rootScope.$on('$routeChangeStart', function () {
	    	if ($cookies.getObject('TS-sid') && $cookies.getObject('TS-sid').hasOwnProperty('id')) {
				console.log($cookies.getObject('TS-sid').id);
		        console.log('$routeChangeStart changed!', new Date());
		        ThoughtSocket.emit('facilitator-leave', $cookies.getObject('TS-sid').id);
				
			}
	    });
	}
})();