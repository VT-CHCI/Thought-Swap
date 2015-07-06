(function () {
	'use strict';
	
	/**
	 * @ngdoc overview ...
	 * @name ...
	 * @description
	 * # The ... controller ...
	 * # ...
	 */
	angular
		.module('app')
		.controller('GroupMgmtController', GroupMgmtController);
 
	GroupMgmtController.$inject = ['$scope', 'UserService', '$location',
	 'GroupsService', '$modal'];
	function GroupMgmtController($scope, UserService, $location,
	 GroupsService, $modal) {

		(function initController() {
            // reset login status?
            $scope.dataLoading = true;
            $scope.isFirstOpen = true;
            $scope.isOpen = false;
            $scope.groups = GroupsService.getGroups({
            	id: UserService.user.id
            })
            	.then(function (groups) {
            		$scope.groups = groups;
            	})
            	.catch(function (err) {
            		console.log('Error loading groups', err);
            		// TODO: set to msg for user
            	})
            	.finally(function () {
            		$scope.dataLoading = false;
            	});

        })();

		$scope.createGroup = function () {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'facilitator/newGroupModal.html', // see script in reciever.html
				controller: 'NewGroupModalController',
				resolve: {
					groups: function() {
						return $scope.groups;
					}
				}
			});

			modalInstance.result.then(function (group) {
				$scope.groups.push(group);
			});
		}

		$scope.logOut = function () {
			$scope.dataLoading = true;
			UserService.logout()
				.then(function (user) {
					$location.path('/login/facilitator');
				})
				.catch(function (err) {
					console.log('Error logging out', err);
					$scope.dataLoading = false;
				});
		};
		
	}

	/**
	 * @ngdoc The controller for the modal that handles new group input.
	 * @name NewGroupModal
	 * @description
	 * # From Docs: Please note that $modalInstance represents a modal 
	 *   window (instance) dependency. It is not the same as the $modal
	 *   service used above. 
	 * # Included within this controller file because it
	 *   is tightly related to the above controller
	 */
	angular.module('app')
			.controller('NewGroupModalController', NewGroupModalController);

	NewGroupModalController.$inject = ['$scope', '$modalInstance', 'groups', 'GroupsService', 'UserService'];
	function NewGroupModalController($scope, $modalInstance, groups, GroupsService, UserService) {

		$scope.groups = groups;

		$scope.submit = function () {
			console.log("Submit works");
			GroupsService.createGroup({
				groupname: $scope.groupname,
				ownerId: UserService.user.id,
				numParticipants: $scope.numParticipants
			})
				.then(function (results) {
					$modalInstance.close(results.group);
				})
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	};
 
})();