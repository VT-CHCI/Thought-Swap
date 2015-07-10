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
		'UserService', '$location', '$routeParams', '$rootScope'];
	function RecieverController($scope, $modal, $log, ThoughtSocket,
	 UserService, $location, $routeParams, $rootScope) {

		(function initController() {
			$scope.participantThoughts = [];
			// $scope.topic = '';
			$scope.prompt = {};
			$scope.numThoughts = 0;
			$scope.numSubmitters = 0;
			$scope.numConnected = 0;
			$scope.dataLoading = true;
			ThoughtSocket.emit('facilitator-join', {
				groupId: $routeParams.groupId,
					userId: UserService.user.id
				});
			// ThoughtSocket.emit('session-sync-req', {
			// 	user: UserService.user,
			// 	groupId: $routeParams.groupId,
			// 	sessionId: $scope.sessionId
			// });
		})();

		ThoughtSocket.on('session-sync-res', function (data) {
			console.log("Recieved session sync response:", data);
			$scope.participantThoughts = data.prompt.thoughts;
			$scope.prompt = data.prompt;
			$scope.sessionId = data.sessionId;
			// $scope.numThoughts = data.prompt.thoughts.length();
			// $scope.numSubmitters = ?

		});

		// $rootScope.$on("$routeChangeStart", function () {
		// 	console.log('leaving fac');
  //           ThoughtSocket.emit('facilitator-leave');
  //       });

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
			// $scope.topic = ''; //erase previous prompt
			$scope.prompt = {};
		}

		$scope.openPromptInput = function () {
			$scope.newSession();
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'facilitator/promptModal.html', // see script in reciever.html
				controller: 'PromptModalController',
				resolve: {
					prompt: function() {
						return $scope.prompt;
					},
					sessionId: function () {
						return $scope.sessionId;
					}
				}
			});

			modalInstance.result.then(function (newPromptContent) {
				$scope.prompt.content = newPromptContent;
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
			ThoughtSocket.emit('distribute', {
				groupId: $routeParams.groupId
			});
		};

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

	PromptModalController.$inject = ['$scope', '$modalInstance', 'prompt', 'sessionId', 'ThoughtSocket', 'UserService', '$routeParams'];
	function PromptModalController($scope, $modalInstance, prompt, sessionId, ThoughtSocket, UserService, $routeParams) {

		$scope.prompt = prompt;
		$scope.sessionId = sessionId

		$scope.submit = function () {
			console.log("Submit works");
			console.log('current user:', UserService.user);
			$modalInstance.close($scope.prompt.content);
			ThoughtSocket.emit('new-prompt', {
				prompt: $scope.prompt.content,
				userId: UserService.user.id,
				groupId: $routeParams.groupId,
				sessionId: $scope.sessionId
			});
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	};

})();