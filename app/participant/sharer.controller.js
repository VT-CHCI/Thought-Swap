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
 
    SharerController.$inject = ['$scope', 'ThoughtSocket', 'UserService'];
    function SharerController($scope, ThoughtSocket, UserService) {
        
        $scope.topic = '';
        $scope.htmlThought = '';    // Only needed so that text-angular doesn't complain
        $scope.htmlThoughts = [];
        $scope.distributedThought = '';

        (function initController() {
            ThoughtSocket.emit('participant-join');
        })();
 
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