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
 
    RegisterController.$inject = ['$scope', '$location', 'UserService', 'md5'];
    function RegisterController($scope, $location, UserService, md5) {

        $scope.register = function () {
            UserService.register({
                email: $scope.email,
                username: $scope.username,
                password: md5.createHash($scope.password)
            })
                .then(function (user) {
                    $location.path('/facilitator/mgmt');
                })
                .catch(function (err) {
                    $scope.error = err;
                });            
        };
    }
 
})();