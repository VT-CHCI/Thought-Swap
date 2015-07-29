(function () {
	'use strict';

	/**
	 * @ngdoc overview ...
	 * @name ...
	 * @description
	 * # The ... controller ...
	 * # ...
	 */
	angular.module('authentication', [
				'ngCookies'
			])
			.service('UserService', UserService);

	UserService.$inject = ['$http', '$cookies', '$q', 'GroupsService'];
	function UserService($http, $cookies, $q, GroupsService) {
		var userService = this;

		// To be called on success of register and login
		this.auth = function (data, deferred) {
			this.user = data.user;
			$cookies.putObject('thoughtswap-user', this.user);
			deferred.resolve(this.user);
		}
			
		this.login = function (options) {
			var deferred = $q.defer();

			if (options.facilitator) {
				$http.post('/signin', {
					user: {
						username: options.username,
						password: options.password
					}   
				})
					.success(function (data) {
						this.auth(data, deferred);
					}.bind(this))

					.error(function (data, status) {
						deferred.reject(data);
					});
			} else {
				$http.post('/signin', {
					user: {
						username: options.username
					}   
				})
					.success(function (data) {
						this.auth(data, deferred);
					}.bind(this))

					.error(function (data, status) {
						deferred.reject(data);
					});
			}
				
			return deferred.promise;
		};

		this.isLoggedIn = function () {
			var isLoggedIn = this.hasOwnProperty('user') && this.user !== null;

			if (!isLoggedIn && $cookies.getObject('thoughtswap-user') && $cookies.getObject('thoughtswap-user') !== null) {
				this.user = $cookies.getObject('thoughtswap-user');
				//console.log(this.user);
				isLoggedIn = true;
			}

			return isLoggedIn;
		};

		this.isFacilitator = function () {
			return  this.isLoggedIn() && this.user.role === 'facilitator';	
		};

		this.isParticipant = function () {
			return  this.isLoggedIn() && this.user.role === 'participant';	
		};

		this.register = function (options) {
			var deferred = $q.defer();

			$http.post('/signup', {
				user: {
					email: options.email,
					username: options.username,
					password: options.password
				}
			})
				.success(function (data) {
					this.auth(data, deferred);
				}.bind(this))

				.error(function (data, status) {
					deferred.reject(data);
				});

			return deferred.promise;
		};

		this.logout = function () {
		  var deferred = $q.defer();

		  $cookies.remove('thoughtswap-user');
		  console.log(this.user);
		  var userId = this.user.id;
		  this.user = null;

		  $http.post('/signout', {
		  	user: {
		  			id: userId
		  		}
		  	})
		    .success(function (data) {
		      console.log(data);

		      GroupsService.groups = [];



		      deferred.resolve();
		    })
		    .error(function (data, status) {
		      deferred.reject(data);
		    });

			return deferred.promise;
		};

		this.getGroups = function() {
			console.log(this.user);
			return GroupsService.getGroups({
				id: this.user.id
			});
		};
	
	}
 
})();
