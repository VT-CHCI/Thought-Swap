(function () {
    'use strict';
    
    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The register controller is responsible for communicating with the server
     * # to log the new user into the database.
     */
    angular
        .module('app')
        .controller('RegisterController', RegisterController);
 
    RegisterController.$inject = ['$scope', '$location'];
    function RegisterController($scope, $location) {
 
        $scope.register = function () {
            $location.path('facilitator/mgmt/1');
            // vm.dataLoading = true;
            // UserService.Create(vm.user)
            //     .then(function (response) {
            //         if (response.success) {
            //             FlashService.Success('Registration successful', true);
            //             $location.path('/login');
            //         } else {
            //             FlashService.Error(response.message);
            //             vm.dataLoading = false;
            //         }
            //     });
        }
    }
 
})();