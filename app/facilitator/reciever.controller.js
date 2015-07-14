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
		'UserService', '$location', '$routeParams', '$rootScope', '$timeout'];
	function RecieverController($scope, $modal, $log, ThoughtSocket,
	 UserService, $location, $routeParams, $rootScope, $timeout) {

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

		ThoughtSocket.on('facilitator-prompt', function (data) {
			console.log('facilitator-prompt', data);
			$scope.prompt = data;
		});

		ThoughtSocket.on('participant-join', function () {
			console.log('participant-join');
			$scope.numConnected++;
		});

		ThoughtSocket.on('participant-leave', function () {
			console.log('participant-leave');
			$scope.numConnected--;
		});

		ThoughtSocket.on('sessionsyncres', function (data) {
			console.log("Recieved session sync response:", data);
			// $scope.participantThoughts = data.prompt.get('thoughts'); //TODO: at somepoint sync should send us the existing thoughts if we're late joining
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
			
		}

		$scope.openPromptInput = function () {
			// $scope.newSession();
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
				$scope.prompt = {};
				$scope.prompt.content = newPromptContent;
			});
		};

		$scope.highlightForDeletion = function (idx) {
			console.log('high', idx);
			$scope.highlight = idx;
		};

		$scope.unHighlightForDeletion = function () {
			console.log('unhigh');
			$scope.highlight = -1;
		};

		ThoughtSocket.on('participant-thought', function (participantThought) {
			$scope.participantThoughts.push(participantThought);
			$scope.numThoughts++;

			var submitters = [];
			$scope.participantThoughts.forEach(function (thought) {
				console.log(thought);
				if (submitters.indexOf(thought.userId) < 0) {
					submitters.push(thought.userId);
				}
			});

			$scope.numSubmitters = submitters.length;
		});

		$scope.distribute = function () {
			console.log('should distribute in future NOT IMPLEMENTED!', $scope.prompt);
			ThoughtSocket.emit('distribute', {
				groupId: $routeParams.groupId,
				promptId: $scope.prompt.id
			});
		};

		$scope.deleteThought = function (thoughtIndex) {
			console.log('i should delete the thought at position', thoughtIndex, 'in $scope.participantThoughts');
			var removed = $scope.participantThoughts.splice(thoughtIndex, 1);
			if (removed.length > 0) {
				ThoughtSocket.emit('fac-delete-thought', {
					thoughtId: removed[0].id
				});
			}
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

	PromptModalController.$inject = ['$scope', '$modalInstance', 'sessionId', 'ThoughtSocket', 'UserService', '$routeParams'];
	function PromptModalController($scope, $modalInstance, sessionId, ThoughtSocket, UserService, $routeParams) {

		// $scope.prompt = prompt;
		$scope.newPromptContent = '';
		$scope.sessionId = sessionId

		$scope.submit = function () {
			console.log("Submit works");
			console.log('current user:', UserService.user);
			$modalInstance.close($scope.newPromptContent);
			ThoughtSocket.emit('new-prompt', {
				prompt: $scope.newPromptContent,
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