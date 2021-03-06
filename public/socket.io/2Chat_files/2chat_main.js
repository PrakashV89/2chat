(function(angular){
	'use strict';
	var $inputMessage = $('.inputMessage');
	var typing = false;	
	var socket = io(); 
	
	angular.module('2Chat', ['ngRoute'])
		.run(function($http, $rootScope, $location) {
			$rootScope.authenticated = false;
			$rootScope.current_user = 'Guest';
			$rootScope.current_chat_user = '';

			$rootScope.signout = function(){
				$http.get('auth/signout');
				$rootScope.authenticated = false;
				$rootScope.current_user = 'Guest';
				$location.path('/');
			};

			$rootScope.newChat = function(recieverName){
				$rootScope.current_chat_user = recieverName;
				$location.path('/newChat');
			}
		})
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider
				.when('/', {
					templateUrl: 'welcomePage.html',
					controller: '2chatMainCtrl',
					controllerAs: 'mainCtrl'
				})
				.when('/login', {
					templateUrl: 'login.html',
					controller: 'authController',
					controllerAs: 'authCtrl'
				})
				.when('/register', {
					templateUrl: 'register.html',
					controller: 'authController',
					controllerAs: 'authCtrl'
				})
				.when('/contacts', {
					templateUrl: 'contacts.html',
					controller: 'contactsController',
					controllerAs: 'contactsCtrl'
				})
				.when('/chats', {
					templateUrl: 'chats.html',
					controller: 'chatsController',
					controllerAs: 'chatsCtrl'
				})
				.when('/newChat', {
					templateUrl: 'newChat.html',
					controller: 'newChatController',
					controllerAs: 'newChatCtrl'
				});

			//$locationProvider.html5Mode(true);
		}])
		.controller('2chatMainCtrl', ['$route', '$routeParams', '$location', function($route, $routeParams, $location) {
			this.$route = $route;
			this.$routeParams = $routeParams;
			this.$location = $location;
		}])
		.controller('authController', function($scope, $http, $rootScope, $location){
			$scope.user = {username: '', password: ''};
			$scope.error_message = '';

			$scope.login = function(){
				$http.post('/auth/login', $scope.user).success(function(data){
					if(data.state == 'success'){
						$rootScope.authenticated = true;
						$rootScope.current_user = data.user.name;
						$location.path('/contacts');
					}
					else{
						$scope.error_message = data.message;
					}
				});
			};

			$scope.register = function(){
				$http.post('/auth/signup', $scope.user).success(function(data){
					if(data.state == 'success'){
						$rootScope.authenticated = true;
						$rootScope.current_user = data.user.name;
						$location.path('/');
					}
					else{
						$scope.error_message = data.message;
					}
				});
			};
		})
		.controller('contactsController', function($scope, $http, $location, $rootScope) {
			$scope.contacts = [];
			$scope.error_message = "";

			if($rootScope.authenticated){
				$http.get('/api/contacts?username=' + $rootScope.current_user)
					.success(function(data) {
						$scope.contacts = data;
					})
					.error(function(data) {
						$scope.error_message = data.statusText;
					});
			}
			else{
				$location.path('/');
			}

		})
		.controller('chatsController', function($scope, $http, $location) {
			$scope.chatters = [];
			$scope.error_message = "";

			if($rootScope.authenticated){
				$http.get('/api/contacts/chatters')
					.success(function(data) {
						$scope.contacts = data;
					})
					.error(function(data) {
						$scope.error_message = data.statusText;
					});
			}
			else{
				$location.path('/');
			}
		})
		.controller('newChatController', function($scope, $rootScope, $http, $location) {
			$scope.messages = [];

			$scope.postChat = function(){
				alert('post');
			}

			if($rootScope.authenticated){
				
			}
			else{
				$location.path('/');
			}
		});
	$inputMessage.keypress(function(event) {
		if (event.which !== 13) {
			if (typing === false && $inputMessage.is(":focus")) {
				typing = true;
				socket.emit("typing", {
					isTyping: true,
					roomID: id,
					person: "Client"
				});
			} else {
				clearTimeout(timeout);
				timeout = setTimeout(timeoutFunction, 2000);
			}
		} else {
			sendMessage();
			clearTimeout(timeout);
			timeoutFunction();
		}
	})
	socket.on('typing', function(data) {
	$inputMessage = $('#' + data.roomID);
	var $parent = $inputMessage.parent();
	var $typing = $parent.children(".typing");
	if (data.isTyping)
		$typing.append("<small>" + data.person + " is typing...<small>");
	else
		$typing.text('');
})
})(window.angular);