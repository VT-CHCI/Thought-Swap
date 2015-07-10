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
 
    SharerController.$inject = ['$scope', '$location', 'ThoughtSocket',
     'UserService'];
    function SharerController($scope, $location, ThoughtSocket,
     UserService) {

        (function initController() {
            $scope.htmlThought = '';    // Only needed so that text-angular doesn't complain
            $scope.htmlThoughts = [];
            $scope.distributedThought = '';
            $scope.dataLoading = false;
            ThoughtSocket.emit('participant-join', {
                groupId: UserService.user.groupId
            });
            if ('facilitator' in $location.search()) {
                $scope.attemptedFacilitator = true;
            }
            console.log("user:", UserService.user);
            console.log('group:', UserService.user.groupId, ' session:', $scope.sessionId )
            // ThoughtSocket.emit('session-sync-req', {
            //     user: UserService.user,
            //     groupId: UserService.user.groupId,
            //     sessionId: $scope.sessionId
            // });
        })();

        // ThoughtSocket.on('session-sync-res', function (data) {
        //     console.log("Recieved session sync data:", data);
        //     $scope.topic = data.currentPrompt
        // });
        
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