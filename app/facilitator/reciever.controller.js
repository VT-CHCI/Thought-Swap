(function () {
    'use strict';
    
    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The...
     */
    angular.module('app')
        .controller('RecieverController', RecieverController);
 
    RecieverController.$inject = ['$scope', '$modal', '$log', 'thoughtSocket'];
    function RecieverController($scope, $modal, $log, thoughtSocket) {
        
        $scope.participantThoughts = [];
        $scope.topic = '';
        $scope.numThoughts = 0;
        $scope.numSubmitters = 0;
        $scope.numConnected = 0;
 
        (function initController() {
            thoughtSocket.emit('facilitator-join');
        })();

        $scope.openPrompt = function () {
            var modalInstance = $modal.open({
              animation: true,
              templateUrl: 'facilitator/promptModal.html', // see script in reciever.html
              controller: 'PromptModalController',
              resolve: {
                topic: function() {
                  return $scope.topic;
                }
              }
            });

            modalInstance.result.then(function (newPrompt) {
              $scope.topic = newPrompt;
            });
          };

        thoughtSocket.on('participant-thought', function (content) {
            $scope.participantThoughts.push({
                thought: content
            });
            $scope.numThoughts++;
        });

        $scope.distribute = function () {
            // TODO:
        }

        $scope.newSession = function () {
            // TODO:
        }
 
    };

    /**
     * @ngdoc The controller for the modal that handles prompt input.
     * @name PromptModal 
     * @description
     * # From Docs: Please note that $modalInstance represents a modal 
     *   window (instance) dependency. It is not the same as the $modal
     *   service used above. 
     * # Included within this controller file because it
     *   is tightly related to the above controller
     */
    angular.module('app')
        .controller('PromptModalController', PromptModalController);

    PromptModalController.$inject = ['$scope', '$modalInstance', 'topic', 'thoughtSocket'];
    function PromptModalController($scope, $modalInstance, topic, thoughtSocket) {

        $scope.topic = topic;

        $scope.submit = function () {
            console.log("Submit works");
            $modalInstance.close($scope.topic);
            thoughtSocket.emit('new-prompt', $scope.topic)
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

})();