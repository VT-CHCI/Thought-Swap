'use strict';

//-------------------------------------------------------------------------
/**
 *  The registration controller for the ThoughtSwap app, handles the
 *  registration process' interaction with the server and by extension,
 *  the database.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 1.0.0  (2014)
 */
//-------------------------------------------------------------------------

angular.module('thoughtSwapApp')
    .controller('RegistrationCtrl', function($scope, md5, thoughtSocket, $location, User) {

        $scope.username = '';
        $scope.password = '';
        $scope.email = '';
        $scope.registrationFailed = false;

        var registrationScope = $scope;

        $scope.registerUser = function() {
            $scope.registrationFailed = false;
            var registrationData = {
                user: $scope.username,
                pass: md5.createHash($scope.password),
                email: $scope.email
            };
            thoughtSocket.emit('new-registration', registrationData);

            // Needs to notify user if registration fails

        };

    });
