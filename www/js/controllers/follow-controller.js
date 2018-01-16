/**
 * Created by kubenetes on 2018/1/16.
 */
angular.module('starter.controllers')
	.controller('FollowCtrl', function($scope, $rootScope, UserService, $state, $ionicListDelegate, $ionicScrollDelegate, ServiceService, $cordovaToast, $ionicModal, $timeout) {
		// With the new view caching in Ionic, Controllers are only called
		// when they are recreated or on app start, instead of every page change.
		// To listen for when this page is active (for example, to refresh data),
		// listen for the $ionicView.enter event:
		//
		//$scope.$on('$ionicView.enter', function(e) {
		//});
		$scope.showMenu = {
			'flag': false
		};
		var getFollowServices = function(){
			if(UserService.getCurrentUser().id == undefined){
				return;
			}
			ServiceService.getFollowServices(UserService.getCurrentUser().id)
				.success(function(data){
					$scope.myFollowServices = ServiceService.parseFollowService(data);
				})
		};
		getFollowServices();
		$scope.unfollowService = function(service, $event){
			$event.stopPropagation();
			ServiceService.unfollowService(service.id, UserService.getCurrentUser().id)
				.success(function(data){
					if(data.status == 0){
						getFollowServices();
						$cordovaToast.showShortBottom('取消关注成功');
					}
					else{
						$cordovaToast.showShortBottom("取消关注失败");
					}
				})
		};

		$scope.showUserServiceInfoModal = function(service){
			$rootScope.currentChat.conversation = null;
			$rootScope.currentChat.messages = null;
			$scope.userServiceInfo = service;
			$scope.messageService = service;
			//$rootScope.$apply();
			//获得聊天记录、创建对话
			if(UserService.currentUser.id != undefined && UserService.currentUser.id != service.publishUserId) { //未登录时不能创建会话, 不能和自己创建会话
				$scope.IMClient.createConversation({
					members: [service.publishUserId, service.id],
					serviceId: service.id,
					unique: true,
				}).then(function (conversation) {
					$rootScope.currentChat.conversation = conversation;
					$rootScope.$apply();
					//console.log('user service conversation', conversation);
					conversation.queryMessages({
						limit: 1000, // limit 取值范围 1~1000，默认 20
					}).then(function (messages) {
						$rootScope.currentChat.messages = messages;
						//console.log('user service messages', messages);
						$rootScope.$apply();

					}).catch(console.error.bind(console))
				});
			};

			$ionicModal.fromTemplateUrl('templates/UserServiceInfo.html', {
				scope: $scope
			}).then(function(modal) {
				$scope.userServiceInfoModal = modal;
				$scope.userServiceInfoModal.show();

				$timeout(function(){
					$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
				},50);
				$('#userServiceInfoImage')[0].onload = function(){
					$('#userServiceChat').css('margin-top', $('#userServiceInfo').height() + 18);
				};

			});
		};

		$scope.showModifyServiceModal = function(service){
			$ionicModal.fromTemplateUrl('templates/service.html', {
				scope: $scope
			}).then(function(modal) {
				$scope.modifyService = service;
				$scope.serviceModal = modal;
				$scope.mode = 'read';
				$scope.serviceModal.show();
			});
		};
	})