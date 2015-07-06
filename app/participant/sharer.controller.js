(function () {
    'use strict';
    
    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The...
     */
    angular
        .module('app')
        .controller('SharerController', SharerController);
 
    SharerController.$inject = ['$scope', '$location', 'ThoughtSocket', 'UserService'];
    function SharerController($scope, $location, ThoughtSocket, UserService) {

        (function initController() {
            $scope.topic = 'Awaiting a topic from the facilitator';
            $scope.htmlThought = '';    // Only needed so that text-angular doesn't complain
            $scope.htmlThoughts = [];
            $scope.distributedThought = '';
            $scope.dataLoading = false;
            ThoughtSocket.emit('participant-join');
            if ('facilitator' in $location.search()) {
                $scope.attemptedFacilitator = true;
            }
        })();

        $scope.logOut = function () {
            $scope.dataLoading = true;
            UserService.logout()
                .then(function (user) {
                    $location.path('/login');
                })
                .catch(function (err) {
                    console.log('Error logging out', err);
                    $scope.dataLoading = false;
                });
        };
        
        $scope.submitThought = function () {
            $scope.htmlThoughts.push({thought: $scope.htmlThought})
            console.log($scope.htmlThought);
            ThoughtSocket.emit('new-thought', {
                content: $scope.htmlThought, 
                author: UserService.user
            });
            $scope.htmlThought = null;
            // $('#thoughtForm').focus(); // does not work atm
        };

        ThoughtSocket.on('facilitator-prompt', function (prompt) {
            console.log('got prompt:', prompt);
            $scope.topic = prompt.content;
        });

    }
 
})();