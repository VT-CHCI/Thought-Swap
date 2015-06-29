(function () {
    'use strict';
    
    /**
     * @ngdoc overview: Allows Facilitators to create accounts on the app
     * @name RegisterController
     * @description
     * # The register controller is responsible for communicating with the 
     * # UserService which in turn tells server to create a Facilitator object
     * # in the database.
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