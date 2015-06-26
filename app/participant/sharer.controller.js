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
 
    SharerController.$inject = ['$scope', 'thoughtSocket'];
    function SharerController($scope, thoughtSocket) {
        
        $scope.topic = '';
        $scope.htmlThought = '';    // Only needed so that text-angular doesn't complain
        $scope.htmlThoughts = [];
        $scope.distributedThought = '';

        (function initController() {
            thoughtSocket.emit('participant-join');
        })();
 
        $scope.submitThought = function () {
            $scope.htmlThoughts.push({thought: $scope.htmlThought})
            console.log($scope.htmlThought);
            thoughtSocket.emit('new-thought', $scope.htmlThought)
            $scope.htmlThought = null;
            // $('#thoughtForm').focus(); // does not work atm
        };

        thoughtSocket.on('facilitator-prompt', function (content) {
            $scope.topic = content;
        });

    }
 
})();