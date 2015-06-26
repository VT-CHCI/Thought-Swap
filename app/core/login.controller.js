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
 
    LoginController.$inject = ['$scope', '$location'];
    function LoginController($scope, $location) {
 
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
            $location.path('facilitator');
            // vm.dataLoading = true;
            // AuthenticationService.Login(vm.username, vm.password, function (response) {
            //     if (response.success) {
            //         AuthenticationService.SetCredentials(vm.username, vm.password);
            //         $location.path('/');
            //     } else {
            //         FlashService.Error(response.message);
            //         vm.dataLoading = false;
            //     }
            // });
        };
    }
 
})();