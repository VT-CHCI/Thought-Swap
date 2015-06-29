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
 
    LoginController.$inject = ['$scope', '$location', '$http', 'UserService'];
    function LoginController($scope, $location, $http, UserService) {
 
        (function initController() {
            // reset login status
            //AuthenticationService.ClearCredentials();
        })();
 
        $scope.loginParticipant = function () {
            $location.path('participant');
            // vm.dataLoading = true;
            // AuthenticationService.Login(vm.username, vm.password, function (response) {
            //     if (response.success) {
            //         AuthenticationService.SetCredentials(vm.username);
            //         $location.path('/participant/:groupId');
            //     } else {
            //         FlashService.Error(response.message);
            //         vm.dataLoading = false;
            //     }
            // });
        };

        $scope.loginFacilitator = function () {
            UserService.login({
                username: $scope.username,
                password: $scope.password
            })
                .then(function (user) {
                    $location.path('/facilitator');
                })
                .catch(function (err) {
                    $scope.error = err;
                });
        };
    }
 
})();