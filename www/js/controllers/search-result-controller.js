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
			'flag1': false
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

		$scope.followService = function(service, $event){
			$event.stopPropagation();
			if(UserService.getCurrentUser().id == undefined){
				$cordovaToast.showShortBottom("登录后才能关注哦!");
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

				//$('#messageList')[0].onload = function(){
				//	console.log($('#messageList')[0]);
				//	$timeout(function(){
				//		$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
				//	},500);
				//}

			});
		};

		$scope.messageDetils = [
			{"isFromeMe":false,"content":"你好!","time":"2015-11-22 08:50:22"},
			{"isFromeMe":true,"content":"你好, 你是谁?","time":"2015-11-22 08:51:02"},
			{"isFromeMe":false,"content":"你在干什么?","time":"2015-11-27 06:34:55"},
			{"isFromeMe":true,"content":"知道怎么搞的吗?","time":"2015-11-22 08:51:02"},
			{"isFromeMe":false,"content":"这是一道可以测出一个人有没有商业头脑的数学题","time":"2015-11-27 06:34:55"},
			{"isFromeMe":false,"content":"喝咖啡对身体好吗?","time":"2015-11-22 08:51:02"},
			{"isFromeMe":false,"content":"在澳洲申请新西兰签证","time":"2015-11-27 06:34:55"},
			{"isFromeMe":true,"content":"说走就走的旅行","time":"2015-11-22 08:51:02"},
			{"isFromeMe":false,"content":"ok","time":"2015-11-27 06:34:55"},
			{"isFromeMe":true,"content":"拉玛西亚","time":"2015-11-22 08:51:02"},
			{"isFromeMe":true,"content":"拉玛西亚影视学院招生简章","time":"2015-11-27 06:34:55"},
			{"isFromeMe":true,"content":"去黑头产品排行榜","time":"2015-11-22 08:51:02"},
			{"isFromeMe":false,"content":"美国大使馆 北京","time":"2015-11-27 06:34:55"},
			{"isFromeMe":false,"content":"被开水烫伤怎么办?","time":"2015-11-22 08:51:02"},
			{"isFromeMe":false,"content":"谁说菜鸟不会数据分析?","time":"2015-11-27 06:34:55"},
			{"isFromeMe":true,"content":"谁念西风独自凉","time":"2015-11-22 08:51:02"},
			{"isFromeMe":false,"content":"被酒莫惊春睡重，赌书消得泼茶香，当时只道是寻常","time":"2015-11-27 06:34:55"}
		]

		$scope.message = {
			"id": 8,
			"name": "李明",
			"pic": "img/adam.jpg",
			"lastMessage": {
				"originalTime": "2015-11-27 06:34:55",
				"time": "",
				"timeFrome1970": 1451169295000,
				"content": "你在干什么?",
				"isFromeMe": false
			},
			"noReadMessages": 0,
			"showHints": false,
			"isTop": 0,
			"message": $scope.messageDetils
		};

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