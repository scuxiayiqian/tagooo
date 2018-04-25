/**
 * Created by kubenetes on 2018/1/16.
 */
angular.module('starter.controllers')
	.controller('SearchResultCtrl', function($scope, $state, $cordovaToast, $rootScope, SearchService, UserService, ServiceService, $stateParams, $ionicModal, $ionicScrollDelegate, $timeout) {
		// $ionicTabsDelegate.showBar(false);
		if($rootScope.isFirst){
			//TODO: 定位
			//$cordovaToast.showShortBottom('定位中...');
			$rootScope.isFirst = false;
			var geolocation = new AMap.Geolocation({
				enableHighAccuracy: false,//是否使用高精度定位，默认:true
				timeout: 10000,          //超过10秒后停止定位，默认：无穷大
			});
			geolocation.getCurrentPosition();
			AMap.event.addListener(geolocation, 'complete', function (data) {
				$rootScope.currentPosition.coordinate = data.position;
				$rootScope.currentPosition.address = data.formattedAddress;
				$rootScope.searchResultPosition.address = data.formattedAddress;
				$rootScope.searchResultPosition.coordinate = data.position;
				SearchService.searchByPosition($rootScope.currentPosition.coordinate.getLng(), $rootScope.currentPosition.coordinate.getLat())
					.success(function(data){
						console.log("首次进入搜索", data);
						var temp = {};
						for(i in data){
							if(!temp.hasOwnProperty(data[i].serviceLabelId)){
								temp[data[i].serviceLabelId] = [];
							}
							data[i].distance = $rootScope.searchResultPosition.coordinate.distance([data[i].longitude, data[i].latitude]);
							temp[data[i].serviceLabelId].push(data[i]);
						}
						$rootScope.searchResults = [];
						for(i in temp){
							$rootScope.searchResults.push({
								'label': temp[i][0].serviceLabelName,
								'results': temp[i]
							})
						}
					})

			});
			AMap.event.addListener(geolocation, 'error', function(err){
				//$cordovaToast.showShortBottom('定位失败');
			});

		}

		$scope.showMenu = {
			'flag': false,
			'flag1': false,
			'modalFlag': false,
		};

		$scope.followList = [];

		$scope.$on('$ionicView.beforeEnter', function(){
			if(UserService.getCurrentUser().id == undefined){
				return;
			}
			ServiceService.getFollowServices(UserService.getCurrentUser().id)
				.success(function(data){
					console.log("关注的服务", ServiceService.parseFollowService(data));
					for(i in data.serviceinfoDTOList){
						$scope.followList.push(data.serviceinfoDTOList[i].id);
					}
				})
		});

		$scope.followService = function(service, $event, isModal){
			$event.stopPropagation();
			if(UserService.getCurrentUser().id == undefined){
				console.log(isModal);
				var login_popup;
				if(isModal){
					login_popup = $(".modal-login .login-popup");
				}
				else {
					login_popup = $("ion-content div.login-popup").last();
				}
				login_popup.show();
				var lrect = login_popup[0].getBoundingClientRect();
				var crect = $($event.target)[0].getBoundingClientRect(); //点击元素相对窗口的位置
				var prect = $("ion-content").last()[0].getBoundingClientRect(); //ion-content相对窗口位置
				login_popup.css('top', crect.top-prect.top+crect.height/2+15); //15是考虑到斜三角形的影响
				login_popup.css('left',crect.left-prect.left+crect.width/2-lrect.width-20);

				return;
			}
			if(UserService.getCurrentUser().id == service.publishUserId){
				$cordovaToast.showShortBottom("不能关注自己发布的服务哦!");
				return;
			}
			var distance = $rootScope.searchResultPosition.coordinate.distance([service.longitude, service.latitude]);
			ServiceService.followService(service.id, UserService.getCurrentUser().id, distance, $rootScope.searchResultPosition.address)
				.success(function(data){
					if(data.status == 0){
						$scope.followList.push(service.id);
						$cordovaToast.showShortBottom('关注成功');
						console.log("关注成功", data);
					}
					else{
						$cordovaToast.showShortBottom("不能重复关注哦");
					}
				})
		};

		$scope.unfollowService = function(service, $event){
			$event.stopPropagation();
			ServiceService.unfollowService(service.id, UserService.getCurrentUser().id)
				.success(function(data){
					if(data.status == 0){
						var index = $scope.followList.indexOf(service.id);
						$scope.followList.splice(index, 1);
						$cordovaToast.showShortBottom('取消关注成功');
					}
					else{
						$cordovaToast.showShortBottom("取消关注失败");
					}
				})
		};

		var test_service ={"id":"4028815e5dd036b7015dd05c100c0001","name":"高策","userName":"高策哥哥","phone":"18817818982","slogan":"高策哥哥上门服务，专业抢修，数据恢复","picture":"/root/data/tango/images/0ea4cedd-4b8b-4ac4-bc62-36f6d5d55c2e.jpg","video":null,"longitude":121.44,"latitude":31.02,"datetime":"20170811","status":"active","address":null,"thirdLabelName":"电脑","thirdLabelId":"8a8080a85f6b2c8d015f6c56cdd20006","publishUserId":"4028815e5dd036b7015dd037e3930000","basicLabelId":"4028815e5dd03716015dd05afa150000","basicLabelName":"维修服务","serviceLabelId":"4028815e5dd03716015dd05ba9ec0001","serviceLabelName":"家电维修","distance":456635.4504047358,"$$hashKey":"object:431"};

		$scope.showUserServiceInfoModal = function(service){
			$rootScope.currentChat.conversation = null;
			$rootScope.currentChat.messages = null;
			$scope.userServiceInfo = service;
			console.log('userService',JSON.stringify(service));
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

					UserService.getPhotoById(service.publishUserId)
						.success(function(data){
						conversation.conversationName = data[0];
						conversation.conversationPhoto = data[1];
					})
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
				//$('#userServiceInfoBlock').ready(function(){
				//	$('#userServiceChat').css('margin-top', $('#userServiceInfoBlock').height() + 10);
				//});

				$('#messageList')[0].onload = function(){
					console.log($('#messageList')[0]);
					$timeout(function(){
						$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
					},500);
				}

			});
		};

		//$scope.showUserServiceInfoModal(test_service);

		$scope.needLogin = function(){
			if(UserService.getCurrentUser().id == undefined){
				$scope.modal.show();
				$cordovaToast.showShortBottom("请先登录");
				if($scope.userServiceInfoModal != null){
					$scope.userServiceInfoModal.remove();
				}
			}
		};


	});