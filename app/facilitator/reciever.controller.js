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
		'UserService', '$location', '$routeParams', '$rootScope', '$timeout',
		'toastr', '$animate'];
	function RecieverController($scope, $modal, $log, ThoughtSocket,
		UserService, $location, $routeParams, $rootScope, $timeout, 
	 toastr, $animate) {

		(function initController() {
			$scope.participantThoughts = [];
			$scope.prompt = {};
			$scope.numSubmitters = 0;
			$scope.numConnected = 0;
			$scope.dataLoading = true;

			ThoughtSocket.emit('facilitator-join', {
				groupId: $routeParams.groupId,
				userId: UserService.user.id
			});

		})();

		// TEMP METHOD: Test thoughts - adds some thoughts automatically to the
		// teacher view for ui testing.
		$scope.testThoughts = function () {
			console.log("got testThoughts cmd");
			for (var i = 0; i < 16; i++) {
				$scope.participantThoughts.push({
					content: i + " Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
				});
			}
		};

		$scope.animatedBounce = function (elemId) {
			$animate.addClass($(elemId), 'animated bounce')
				.then(function () {
					$timeout(function () {
						$animate.removeClass($('#numConnected'),'animated bounce');
					}, 1000);
				});
		};

		$scope.$watch('participantThoughts.length', function (nv, ov) {
			if (nv !== ov) {
				$scope.animatedBounce('#numThoughts');
			}
		});

		$scope.$watch('numSubmitters', function (nv, ov) {
			if (nv !== ov) {
				$scope.animatedBounce('#numSubmitters');
			}
		});

		$scope.$watch('numConnected', function (nv, ov) {
			if (nv !== ov) {
				$scope.animatedBounce('#numConnected');
			}
		});

		ThoughtSocket.on('facilitator-prompt', function (data) {
			console.log('facilitator-prompt', data);
			$scope.prompt = data;
			toastr.success('', 'New Prompt Created');
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
			console.log('Recieved session sync response:', data);
			// $scope.participantThoughts = data.prompt.get('thoughts'); //TODO: at somepoint sync should send us the existing thoughts if we're late joining
			$scope.prompt = data.prompt;
			$scope.sessionId = data.sessionId;
			// $scope.numThoughts = data.prompt.thoughts.length();
			// $scope.numSubmitters = ?
		});

		$scope.newSession = function () {
			$scope.participantThoughts = [];
			//$scope.numThoughts = 0;
			$scope.numSubmitters = 0;
			ThoughtSocket.emit('session-sync-req', {
				userId: UserService.user.id,
				groupId: $routeParams.groupId,
				sessionId: $scope.sessionId
			});
			
			toastr.success('', 'Started New Session');
		};

		ThoughtSocket.on('new-session-prompt', function (prompt) {
			console.log("Got data in new-session-prompt", prompt);
			// $scope.prompt = {};
			$scope.prompt = prompt;
		});

		$scope.openPromptInput = function () {
			// $scope.newSession();
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'facilitator/promptModal.html', // see script in reciever.html
				controller: 'PromptModalController',
				resolve: {
					prompt: function () {
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
			console.log(participantThought);
			$scope.participantThoughts.push(participantThought);
			$scope.numThoughts++;

			var submitters = [];
			$scope.participantThoughts.forEach(function (thought) {
				if (submitters.indexOf(thought.userId) < 0) {
					submitters.push(thought.userId);
				}
			});

			$scope.numSubmitters = submitters.length;
		});

		$scope.distribute = function () {
			toastr.success('', 'Thoughts Distributed!');
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

		$scope.displayThought = function (thought) {
			return thought.content;
		};

	}

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
		$scope.sessionId = sessionId;

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
	}

})();