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
        'facilitatorLogin', 'md5', 'LoggerService'];
    function LoginController($scope, $location, $http, UserService,
        facilitatorLogin, md5, Logger) {
 
        (function initController() {
            // reset login status?

            $scope.isFacilitator = facilitatorLogin;

            if ('participant' in $location.search()) {
                $scope.isChangingRoles = true;
            }
            console.log("user:", UserService.user);
        })();
 
        $scope.loginParticipant = function () {
            $scope.dataLoading = true;
            UserService.login({
                username: $scope.sillyname,
                facilitator: $scope.isFacilitator
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

        $scope.loginFacilitator = function () {
            $scope.dataLoading = true;
            UserService.login({
                username: $scope.username,
                password: md5.createHash($scope.password),
                facilitator: $scope.isFacilitator
            })
                .then(function (user) {
                    UserService.getGroups()
                        .then(function (groups) {
                            if (groups.length === 1) {
                                $location.path('/facilitator/'+groups[0].id);
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
            }
            else if ($location.path() === '/login/facilitator') {
                $location.path('/login');
            }
        };
    }
 
})();