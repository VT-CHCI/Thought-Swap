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

	RecieverController.$inject = ['$scope', '$modal', '$log', 'ThoughtSocket',
		'UserService', '$location', '$routeParams'];
	function RecieverController($scope, $modal, $log, ThoughtSocket,
	 UserService, $location, $routeParams) {

		(function initController() {
			$scope.participantThoughts = [];
			$scope.topic = '';
			$scope.numThoughts = 0;
			$scope.numSubmitters = 0;
			$scope.numConnected = 0;
			$scope.dataLoading = true;
			ThoughtSocket.emit('facilitator-join', {
				groupId: $routeParams.groupId
			});
			// ThoughtSocket.emit('session-sync-req', {
			// 	user: UserService.user,
			// 	groupId: $routeParams.groupId,
			// 	sessionId: $scope.sessionId
			// });
		})();

		// ThoughtSocket.on('session-sync-res', function (data) {
		// 	console.log("Recieved session sync response:", data);
		// 	$scope.participantThoughts = data.prompt.thoughts;
		// 	$scope.topic = data.prompt.content;
		// 	$scope.numThoughts = data.prompt.thoughts.length();
		// 	// $scope.numSubmitters = ?

		// });

		$scope.newSession = function () {
			$scope.participantThoughts = [];
			$scope.numThoughts = 0;
			$scope.numSubmitters = 0;
			ThoughtSocket.emit('session-sync-req', {
				user: UserService.user,
				groupId: $routeParams.groupId,
				sessionId: $scope.sessionId
			});
			newPrompt();
		};

		function newPrompt() {
			$scope.topic = ''; //erase previous prompt
		}

		$scope.openPrompt = function () {
			$scope.newSession();
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

		ThoughtSocket.on('participant-thought', function (participantThought) {
			$scope.participantThoughts.push({
					thought: participantThought.content
			});
			$scope.numThoughts++;
		});

		$scope.distribute = function () {
				console.log('should distribute in future NOT IMPLEMENTED!');
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

	PromptModalController.$inject = ['$scope', '$modalInstance', 'topic', 'ThoughtSocket', 'UserService'];
	function PromptModalController($scope, $modalInstance, topic, ThoughtSocket, UserService) {

		$scope.topic = topic;

		$scope.submit = function () {
			console.log("Submit works");
			console.log('current user:', UserService.user);
			$modalInstance.close($scope.topic);
			ThoughtSocket.emit('new-prompt', {
				topic: $scope.topic,
				author: UserService.user
			});
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	};

})();