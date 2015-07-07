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
 
    LoginController.$inject = ['$scope', '$location', '$http', 'UserService', 'facilitatorLogin', 'md5'];
    function LoginController($scope, $location, $http, UserService, facilitatorLogin, md5) {
 
        (function initController() {
            // reset login status?

            $scope.isFacilitator = facilitatorLogin;

            if ('participant' in $location.search()) {
                $scope.isChangingRoles = true;
            }
        })();
 
        $scope.loginParticipant = function () {
            $scope.dataLoading = true;
            UserService.login({
                username: $scope.sillyname,
                facilitator: $scope.isFacilitator
            })
                .then(function (user) {
                    $location.path('/participant');
                })
                .catch(function (err) {
                    $scope.error = err;
                    $scope.dataLoading = false;

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
                    console.log(user);
                    UserService.getGroups()
                        .then(function (groups) {
                            console.log('groups', groups);
                            if (groups.length === 1) {
                                $location.path('/facilitator/'+groups[0].id);
                            } else {
                                $location.path('/facilitator/mgmt');
                            }
                        });
                })
                .catch(function (err) {
                    $scope.error = err;
                    $scope.dataLoading = false;
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