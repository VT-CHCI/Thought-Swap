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

        /* Added for Main Admin */
         var isMainAdmin = {
            isMainAdmin: function (UserService, $location) {
                if (!UserService.isMainAdmin()) {
                    $location.url('/mainAdmin');
                }
            }
        };

        /*Added for Demo Link
        var isDemo = {
            isDemo: function (UserService, $location) {
                if (!UserService.isDemo()) {
                    $location.path('/demo');
                }
            }
        };
        End of added for Demo Link*/


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
                //     facilitatorLogin: function () {
                //         return false;
                //     },
                //     demoLogin: function() {
                //         return false;
                //     }
                    role: function() {
                        return 'participant';
                    }
                }
            })

            //Added for Demo Link

           .when('/login/demo', {
                templateUrl: 'common/authentication/login/login.html',
                controller: 'LoginController',
                resolve: {
                    role: function() {
                        return 'demo';
                    }
                }
            }) 
           // End of added for Demo Link 

           //Added for Main Admin
           .when('/login/mainAdmin', {
                templateUrl: 'common/authentication/login/login.html',
                controller: 'LoginController',
                resolve: {
                    role: function() {
                        return 'mainAdmin';
                    }
                }
            })

            .when('/login/facilitator', {
                templateUrl: 'common/authentication/login/login.html',
                controller: 'LoginController',
                resolve: {
                    role: function() {
                        return 'facilitator';
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

            /*Added for Demo Link
             .when('/demo', {
                templateUrl: 'app/demo/demo.html',
                controller: 'DemoController',
                resolve: isAuthenticated
            })
            // End of added for Demo Link*/

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
            //for main admin
            ThoughtSocket.emit('mainAdmin-leave', $cookies.getObject('TS-sid').id);
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
                ThoughtSocket.emit('mainAdmin-leave', $cookies.getObject('TS-sid').id);
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
                ThoughtSocket.emit('mainAdmin-leave', $cookies.getObject('TS-sid').id);
            }
        });
    }
})();