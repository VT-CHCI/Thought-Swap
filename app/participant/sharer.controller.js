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
     'UserService', '$rootScope', 'toastr', 'LoggerService'];
    function SharerController($scope, $location, ThoughtSocket,
     UserService, $rootScope, toastr, Logger) {

        (function initController() {
            $scope.htmlThought = '';    // Only needed so that text-angular doesn't complain
            $scope.htmlThoughts = [];
            $scope.distributedThought = '';
            $scope.viewingDistribution = false;
            $scope.dataLoading = false;
            console.log('about to participant join as', UserService.user.id);
            ThoughtSocket.emit('participant-join', {
                groupId: UserService.user.groupId,
                userId: UserService.user.id
            });
            if ('facilitator' in $location.search()) {
                $scope.attemptedFacilitator = true;
            }

            $rootScope.$on("$routeChangeStart", function () {
                ThoughtSocket.emit('participant-leave');
            });
        })();

        ThoughtSocket.on('sessionsyncres', function (data) {
            console.log("Recieved session sync data:", data);
            $scope.prompt = data.prompt;
            $scope.sessionId = data.sessionId;
            $scope.viewingDistribution = false;
            toastr.info('', 'New Session');
        });

        ThoughtSocket.on('new-session-prompt', function (prompt) {
            console.log("Got data in new-session-prompt", prompt);
            $scope.htmlThoughts = [];
            $scope.prompt = prompt;
        });
        
        // @pre - can only submit thought when not viewing a distributed thought
        $scope.submitThought = function () {
            $scope.htmlThoughts.push({thought: $scope.htmlThought});
            Logger.createEvent({
                data: 'new thought from ' + UserService.user.username + ': ' + $scope.htmlThought,
                type: 'submitThought'
            });
            ThoughtSocket.emit('new-thought', {
                content: $scope.htmlThought, 
                author: UserService.user,
                promptId: $scope.prompt.id
            });
            toastr.success('', 'Thought Submitted');
            $scope.htmlThought = null;
            // $('#thoughtForm').focus(); // does not work atm
        };

        ThoughtSocket.on('facilitator-prompt', function (prompt) {
            console.log('got prompt:', prompt);
            $scope.prompt = prompt;
            toastr.info('', 'Recieved New Prompt');
            $scope.viewingDistribution = false;
            // $scope.topic = prompt.content;
        });

        ThoughtSocket.on('distributed-thought', function (thoughtContent) {
            toastr.info('', 'Received Thought!');
            console.log('got thought:', thoughtContent);
            $scope.distributedThought = thoughtContent;
            $scope.viewingDistribution = true;
            // $scope.topic = prompt.content;
        });

    }
 
})();