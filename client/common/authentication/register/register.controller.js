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

    RegisterController.$inject = ['$scope', '$location', 'UserService',
        'LoggerService'
    ];

    function RegisterController($scope, $location, UserService,
        Logger) {

        $scope.register = function () {
            UserService.register({
                    email: $scope.email,
                    username: $scope.username,
                    password: $scope.password
                })
                .then(function () {
                    $location.path('/facilitator/mgmt');
                    Logger.createEvent({
                        data: $scope.username + ' successfully registered',
                        type: 'register'
                    });
                })
                .catch(function (err) {
                    $scope.error = err.data.message;
                    Logger.createEvent({
                        data: $scope.username + ' encountered error ' + err + ' while registering',
                        type: 'authenticateError'
                    });
                });
        };
    }

})();