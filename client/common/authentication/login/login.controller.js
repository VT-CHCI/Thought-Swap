(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The login controller is responsible for communicating with the server
     * # to authenticate facilitators and participants.
     */
    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$scope', '$location', '$http', 'UserService',
        'role', 'LoggerService'
    ];

    function LoginController($scope, $location, $http, UserService,
        role, Logger) {

        (function initController() {
            // reset login status?

            $scope.role = role;
            $scope.isFacilitator = role === 'facilitator';

            if ('participant' in $location.search()) {
                $scope.isChangingRoles = true;
            }
            console.log("user:", UserService.user);
        })();

        $scope.loginParticipant = function () {
            $scope.dataLoading = true;
            UserService.login({
                    username: $scope.sillyname,
                    role: role
                })
                .then(function (user) {
                    $location.path('/participant');
                    Logger.createEvent({
                        data: $scope.sillyname + ' successfully logged in',
                        type: 'logIn'
                    });
                })
                .catch(function (err) {
                    $scope.error = err;
                    $scope.dataLoading = false;
                    Logger.createEvent({
                        data: 'participant' + $scope.sillyname +
                            'encountered error ' + err + ' while logging in',
                        type: 'authenticateError'
                    });

                });
        };
        //For Demo Link
        $scope.loginDemo = function () {
            $scope.dataLoading = true;
            $scope.username = Math.random().toString(36).substring(2, 15); // randomly generated username for demos

            UserService.login({
                    username: $scope.username,
                    group: $scope.demoname,
                    role: role
                })
                .then(function (user) {
                    $location.path('/participant');
                    Logger.createEvent({
                        data: $scope.username + ' successfully logged in',
                        type: 'logIn'
                    });
                })
                .catch(function (err) {
                    $scope.error = err;
                    $scope.dataLoading = false;
                    Logger.createEvent({
                        data: 'demo' + $scope.username +
                            'encountered error ' + err + ' while logging in',
                        type: 'authenticateError'
                    });

                });
        };
        //End of for Demo Link

        $scope.loginFacilitator = function () {
            $scope.dataLoading = true;
            UserService.login({
                    username: $scope.username,
                    password: $scope.password,
                    role: role
                })
                .then(function (user) {
                    UserService.getGroups()
                        .then(function (groups) {
                            if (groups.length === 1) {
                                $location.path('/facilitator/' + groups[0].id);
                            } else {
                                $location.path('/facilitator/mgmt');
                            }
                        });
                    Logger.createEvent({
                        data: $scope.username + ' successfully logged in',
                        type: 'logIn'
                    });
                })
                .catch(function (err) {
                    $scope.error = err;
                    $scope.dataLoading = false;
                    Logger.createEvent({
                        data: 'facilitator ' + $scope.username +
                            ' encountered error ' + err + ' while logging in',
                        type: 'authenticateError'
                    });
                });
        };

        $scope.switchRoute = function () {
            if ($location.path() === '/login') {
                $location.path('/login/facilitator');
            } else if ($location.path() === '/login/facilitator') {
                $location.path('/login');
            }
        };
    }

})();