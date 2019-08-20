(function () {
	'use strict';

	angular.module('authentication', ['ngCookies'])
		.service('UserService', UserService);

	UserService.$inject = ['$http', '$cookies', '$q', 'GroupsService', 'LoggerService'];

	function UserService($http, $cookies, $q, GroupsService, Logger) {
		var userService = this;

		// To be called on success of register and login
		this.auth = function (data, deferred) {
			this.user = data.user;
			$cookies.putObject('thoughtswap-user', this.user);
			deferred.resolve(this.user);
		};

		this.login = function (options) {
			var deferred = $q.defer();

			if (options.role === 'facilitator') {	// facilitator
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

            } else if (options.role === 'mainAdmin') { // added for main admin
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

			} else if (options.role === 'demo') { // added for demo
				$http.post('/signin', {
						user: {
							username: options.username, // randomly generated
							role: options.role,
							group: options.group
						}
					})
					.success(function (data) {
						this.auth(data, deferred);
					}.bind(this))

					.error(function (data, status) {
						deferred.reject(data);
					});

			} else if (options.role === 'participant') {	// normal participant
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
			return this.isLoggedIn() && this.user && this.user.role === 'facilitator';
		};

		this.isParticipant = function () {
			return this.isLoggedIn() && this.user && this.user.role === 'participant';
		};

		this.isDemo = function () {
			return this.isLoggedIn() && this.user && this.user.role === 'demo';
		};
		this.isMainAdmin = function () {
			return this.isLoggedIn() && this.user && this.user.role === 'mainAdmin';
		};

		this.register = function (options) {
			var deferred = $q.defer();

			$http.post('/signup', {
					user: {
						email: options.email,
						username: options.username,
						password: options.password,
						//for authorization
						authoCode: options.authoCode
					}
				})
				.success(function (data) {
					console.log('Got http success', data);
					this.auth(data, deferred);
				}.bind(this))
				.error(function (data, status) {
					console.log('Error');
					deferred.reject(data);
				});

			return deferred.promise;
		};

		this.logout = function () {
			var deferred = $q.defer();
			$cookies.remove('thoughtswap-user');
			Logger.createEvent({
				data: this.user.role + ' ' + this.user.username + ' successfully logged out',
				type: 'logOut'
			});
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

		this.getGroups = function () {
			console.log(this.user);
			return GroupsService.getGroups({
				id: this.user.id
			});
		};

	}

})();