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
     'UserService', '$rootScope'];
    function SharerController($scope, $location, ThoughtSocket,
     UserService, $rootScope) {

        (function initController() {
            $scope.htmlThought = '';    // Only needed so that text-angular doesn't complain
            $scope.htmlThoughts = [];
            $scope.distributedThought = '';
            $scope.dataLoading = false;
            console.log('about to participant join as', UserService.user.id);
            ThoughtSocket.emit('participant-join', {
                groupId: UserService.user.groupId,
                userId: UserService.user.id
            });
            if ('facilitator' in $location.search()) {
                $scope.attemptedFacilitator = true;
            }
            console.log('session:', $scope.sessionId )
            // ThoughtSocket.emit('session-sync-req', {
            //     user: UserService.user,
            //     groupId: UserService.user.groupId,
            //     sessionId: $scope.sessionId
            // });

            $rootScope.$on("$routeChangeStart", function () {
                ThoughtSocket.emit('participant-leave');
            });
        })();

        ThoughtSocket.on('session-sync-res', function (data) {
            console.log("Recieved session sync data:", data);
            $scope.prompt = data.prompt;
            $scope.sessionId = data.sessionId;
        });
        
        $scope.submitThought = function () {
            $scope.htmlThoughts.push({thought: $scope.htmlThought})
            console.log($scope.htmlThought);
            console.log('current prompt:', $scope.prompt);
            ThoughtSocket.emit('new-thought', {
                content: $scope.htmlThought, 
                author: UserService.user,
                promptId: $scope.prompt.id
            });
            $scope.htmlThought = null;
            // $('#thoughtForm').focus(); // does not work atm
        };

        ThoughtSocket.on('facilitator-prompt', function (prompt) {
            console.log('got prompt:', prompt);
            $scope.prompt = prompt;
            // $scope.topic = prompt.content;
        });

        ThoughtSocket.on('distributed-thought', function (thoughtContent) {
            console.log('got thought:', thoughtContent);
            $scope.distributedThought = thoughtContent;
            // $scope.topic = prompt.content;
        });

    }
 
})();