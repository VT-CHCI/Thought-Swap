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
 
    LoginController.$inject = ['$scope', '$location', '$http', 'UserService', 'isFacilitator'];
    function LoginController($scope, $location, $http, UserService, isFacilitator) {

        $scope.isFacilitator = isFacilitator;
 
        (function initController() {
            // reset login status
            //AuthenticationService.ClearCredentials();
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
                password: $scope.password,
                facilitator: $scope.isFacilitator
            })
                .then(function (user) {
                    $location.path('/facilitator');
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