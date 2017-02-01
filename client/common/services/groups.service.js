(function () {
	'use strict';

	angular.module('groups', [])
		.service('GroupsService', GroupsService);

	GroupsService.$inject = ['$http', '$q'];

	function GroupsService($http, $q) {
		var GroupsService = this;

		this.groups = [];

		// Should return array of group dictionaries from database
		this.getGroups = function (options) {
			var deferred = $q.defer();
			if (this.groups.length === 0) {

				$http.get('/groups/' + options.id)
					.success(function (data) {
						console.log(data.groups);
						this.groups = data.groups;
						deferred.resolve(this.groups);
					}.bind(this))

					.error(function (data, status) {
						deferred.reject(data);
					});
			} else {
				deferred.resolve(this.groups);
			}

			return deferred.promise;
		};

		this.createGroup = function (options) {
			var deferred = $q.defer();

			$http.post('/groups/create', {
					group: {
						name: options.groupname,
						owner: options.ownerId,
						numParticipants: options.numParticipants
					}
				})
				.success(function (data) {
					deferred.resolve(data);
				})

				.error(function (data, status) {
					deferred.reject(data);
				});

			return deferred.promise;
		};


	}

})();