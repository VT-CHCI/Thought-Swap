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
            'logger',

            /* 3rd-party modules */
            'btford.socket-io',
            'ui.bootstrap',
            'textAngular',
            'thoughtSwap',
            'mp.autoFocus',
            'toastr',
            'dndLists',
            'ngMorph'
        ])
        .config(config)
        .run(run);

    //===========================================================================

    config.$inject = ['$routeProvider', 'toastrConfig', '$locationProvider'];

    function config($routeProvider, toastrConfig, $locationProvider) {
        angular.extend(toastrConfig, {
            closeButton: true,
        });

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
                    $location.path('/participant');

                }
            }
        }

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $routeProvider

            /* Core */
            .when('/', {
                templateUrl: 'app/core/home.html',
                resolve: isParticipant
            })
            .when('/help', {
              templateUrl: 'app/core/help.html'
            })
            .when('/about', {
              templateUrl: 'app/core/about.html'
            })

            /* Authentication */
            .when('/login', {
                templateUrl: 'common/authentication/login/login.html',
                controller: 'LoginController',
                resolve: {
                    facilitatorLogin: function () {
                        return false;
                    }
                }
            })
            .when('/login/facilitator', {
                templateUrl: 'common/authentication/login/login.html',
                controller: 'LoginController',
                resolve: {
                    facilitatorLogin: function () {
                        return true;
                    }
                }
            })
            .when('/register', {
                templateUrl: 'common/authentication/register/register.html',
                controller: 'RegisterController'
            })

            /* Facilitator */
            .when('/facilitator/mgmt', {
                templateUrl: 'app/facilitator/groupManager/groupManager.html',
                controller: 'GroupManagerController',
                resolve: isFacilitator
            })

            .when('/facilitator/:groupId', {
                templateUrl: 'app/facilitator/facilitator.html',
                controller: 'FacilitatorController',
                resolve: isFacilitator
            })

            /* Participant View */
            .when('/participant', {
                templateUrl: 'app/participant/participant.html',
                controller: 'ParticipantController',
                resolve: isAuthenticated
            })

            .otherwise({
                redirectTo: '/'
            });

    }

    run.$inject = ['$rootScope', 'ThoughtSocket', '$cookies', '$window',
        '$location', 'LoggerService'
    ];

    function run($rootScope, ThoughtSocket, $cookies, $window,
        $location, Logger) {

        $window.onbeforeunload = function () {
            // $cookies.putObject('ts-noticed-unload', {something:true});
            ThoughtSocket.emit('facilitator-leave', $cookies.getObject('TS-sid').id);
            ThoughtSocket.emit('participant-leave', $cookies.getObject('TS-sid').id);
        };

        ThoughtSocket.on('socket-id', function (socketId) {
            console.log('got socket id', socketId);
            $cookies.putObject('TS-sid', {
                id: socketId
            });
        });
        $rootScope.$on('$locationChangeStart', function () {
            if ($cookies.getObject('TS-sid') && $cookies.getObject('TS-sid').hasOwnProperty('id')) {
                console.log($cookies.getObject('TS-sid').id);
                console.log('$locationChangeStart changed!', new Date());
                ThoughtSocket.emit('facilitator-leave', $cookies.getObject('TS-sid').id);
                ThoughtSocket.emit('participant-leave', $cookies.getObject('TS-sid').id);

            }
        });
        $rootScope.$on('$routeChangeStart', function () {
            Logger.createEvent({
                data: 'navigated to' + $location.path(),
                type: 'navigation'
            });
            if ($cookies.getObject('TS-sid') && $cookies.getObject('TS-sid').hasOwnProperty('id')) {
                console.log($cookies.getObject('TS-sid').id);
                console.log('$routeChangeStart changed!', new Date());
                ThoughtSocket.emit('facilitator-leave', $cookies.getObject('TS-sid').id);
                ThoughtSocket.emit('participant-leave', $cookies.getObject('TS-sid').id);
            }
        });
    }
})();