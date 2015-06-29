(function () {
		'use strict';
 
		angular
				.module('app')
				.service('UserService', UserService);
 
		UserService.$inject = ['$http', '$cookies', '$q'];
		function UserService($http, $cookies, $q) {
			var userService = this;

			// To be called on success of register and login
			this.auth = function (data, deferred) {
				this.user = data.user;
				$cookies.putObject('thoughtswap-user', this.user);
				deferred.resolve(this.user);
			}
				
			this.login = function (options) {
				var deferred = $q.defer();

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
						deferred.reject("Error login facilitator: ", data);
					});
					
					return deferred.promise;
			};

			this.isLoggedIn = function() {
				var loggedIn = this.hasOwnProperty('user') && this.user != null;

				if (!loggedIn && $cookies.hasOwnProperty('thoughtswap-user')) {
					this.user = JSON.parse($cookies['thoughtswap-user']);
					loggedIn = true;
				}

				return isLoggedIn;
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
							deferred.reject("Error creating user: ", data);
						});

					return deferred.promise;
				};

		
		}
 
})();





	// this.login = function (user, pwHash, successCallback, errorCallback) {
	//   $http.post('/api/user/login', {user: user, pwHash:pwHash})
	//     .success(function(data) {
	//       console.log('logged in!', data);
	//       userService.user = {name:user, id:data.id, orgs:data.orgs, groups:data.groups};
	//       userService.currentContext = userService.user;
	//       $cookies['youScriber-user'] = JSON.stringify(userService.user);
	//       $rootScope.$emit('user-logged-in');
	//       successCallback(data);
	//     })
	//     .error(function(error) {
	//       errorCallback(error);
	//     });
	// };

	// this.logout = function (successCallback, errorCallback) {
	//   console.log('implement logout?');
	//   $http.post('/api/user/logout', {uid: this.user.id})
	//     .success(function(data) {
	//       console.log('logged out!', data);
	//       delete $cookies['youScriber-user'];
	//       delete $cookies['youScriber-context'];
	//       userService.user = null;

	//       if (successCallback) {
	//         successCallback(data);
	//       }
	//     })
	//     .error(function(error) {
	//       if (errorCallback) {
	//         errorCallback(error);
	//       }
	//     });
	// };

	// this.registerOrg = function (title, description, successCallback, errorCallback) {
	//   console.log('this.registerOrg::this.user:', this.user);
	//   $http.post('/api/org', {title: title, description:description, user:this.user})
	//     .success(function(data) {
	//       console.log(data);
	//       // userService.user.orgs.push = {name:user};
	//       successCallback(data);
	//     })
	//     .error(function(error) {
	//       errorCallback(error);
	//     });
	// };

	// this.registerGroup = function (title, description, successCallback, errorCallback) {
	//   console.log('this.registerGroup::this.user:', this.user);
	//   $http.post('/api/group', {title: title, description:description, user:this.user})
	//     .success(function(data) {
	//       console.log(data);
	//       // userService.user.orgs.push = {name:user};
	//       successCallback(data);
	//     })
	//     .error(function(error) {
	//       errorCallback(error);
	//     });
	// };
