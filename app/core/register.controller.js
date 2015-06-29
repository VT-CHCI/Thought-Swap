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
 
    RegisterController.$inject = ['$scope', '$location', 'UserService'];
    function RegisterController($scope, $location, UserService) {

        $scope.register = function () {
            UserService.register({
                email: $scope.email,
                username: $scope.username,
                password: $scope.password
            })
                .then(function (user) {
                    $location.path('/facilitator/mgmt/' + user.id);
                })
                .catch(function (err) {
                    $scope.error = err;
                });

            
                    
        };
    }
 
})();