angular.module('starter.controllers', ['ngCordova', 'starter.services'])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $cordovaCamera, $cordovaActionSheet, $ionicHistory, $cordovaToast, ToastService, UserService, ChatService, $http, baseUrl, port, $state, $filter, $ionicScrollDelegate) {

	AV.init({
		appId: 'M78GfGrK80feOyYFqxJB5sHQ-gzGzoHsz',
		appKey:'tw1q4AEWHIvpPBnQhKmfH8rO',
	});

	var Realtime = AV.Realtime;
	var realtime = new Realtime({
		appId: 'M78GfGrK80feOyYFqxJB5sHQ-gzGzoHsz',
		region: 'cn', //美国节点为 "us"
		pushOfflineMessages: true,
		plugins: [AV.TypedMessagesPlugin]
	});

	$rootScope.currentChat = {
		'user': null,
		'conversation': null, //当前活动的对话
		'messages': null,   //当前活动对话对应的消息记录
		'conversationList': null //用户的所有对话列表
	};

	$rootScope.send_content = {
		'message': null
	};

	$rootScope.$watch('currentChat.messages', function(newValue,oldValue){
		$timeout(function(){
			$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
		},500);
	});

	$rootScope.sendMessage = function(content){
		if($rootScope.currentChat.conversation == null){
			$cordovaToast.showShortBottom("请先登录");
			return;
		}
		else{
			$rootScope.currentChat.conversation.send(new AV.TextMessage(content))
				.then(function(message) {
					console.log("消息发送成功", message);

					$rootScope.currentChat.messages.push(message);
					$rootScope.$apply();
					console.log("消息记录为", $rootScope.currentChat.messages);
					$rootScope.currentChat.conversation.lastMessage = message;
					$rootScope.send_content.message = null;
					$rootScope.$apply();
					$timeout(function(){
						$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
					},50);
				})
				.catch(console.error);

		}
	};

	$rootScope.sendImageMessage = function(){
		var cameraOptions = {
			//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
			quality: 80,                                                                                        //相片质量0-100
			destinationType: Camera.DestinationType.DATA_URL,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
			allowEdit: true,                                                                                //在选择之前允许修改截图
			encodingType:Camera.EncodingType.JPEG,                                     //保存的图片格式： JPEG = 0, PNG = 1
			targetWidth: 200,                                                                                //照片宽度
			targetHeight: 200,                                                                             //照片高度
			mediaType:0,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
			cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
		};

		$cordovaCamera.getPicture(cameraOptions).then(function(imageData) {

			var file = new AV.File(new Date().getTime() + '.jpeg', {
				base64: imageData
			});
			file.save().then(function() {
				var message = new AV.ImageMessage(file);
				return $rootScope.currentChat.conversation.send(message);
			}).then(function(imageMessage) {
				$rootScope.currentChat.messages.push(imageMessage);
				$rootScope.$apply();
				console.log('发送成功');
				$rootScope.currentChat.conversation.lastMessage = message;
				$timeout(function(){
					$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
				},50);
			}).catch(console.error.bind(console));

		}, function(err) {
			// error
			console.log("get pic err");
		});

	};

	$rootScope.showImageOfMessage = function(imageUrl){
		$scope.displayImageOfMessage = imageUrl;
		$ionicModal.fromTemplateUrl('templates/imageModal.html', {
			scope: $scope,
		}).then(function(modal) {
			$scope.imageOfMessageModal = modal;
			$scope.imageOfMessageModal.show();
		});
	};


	// 解决tab切换时nav返回按钮消失的问题
	$scope.onTabSelected = function(){
		$ionicHistory.clearHistory();
	};

	$scope.onTabDeselected = function(){
		$ionicHistory.clearHistory();
	};

	var clearLoginError = function(){
		$scope.loginError.flag = false;
		$scope.loginError.info = "";
	};

	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.loginData = {};
	$scope.loginError = {};
	$scope.loginError.flag = false;

	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	// Triggered in the login modal to close it
	$scope.closeLogin = function() {
		$scope.modal.hide();
	};

	$scope.login = function() {
		$scope.modal.show();
	};

	$scope.isLogin = function() {
		return !UserService.isLogin;
	};



	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {

		console.log('Doing login', $scope.loginData);
		if($scope.loginData.phone == '' || $scope.loginData.phone == undefined
			|| $scope.loginData.password == '' || $scope.loginData.password == undefined){
			$scope.loginError.flag = true;
			$scope.loginError.info = "用户名或密码未填写";

			ToastService.showCenterToast($scope.loginError.info)
				.then(function(success) {
					clearLoginError();
				}, function (error) {
					console.log("show toast error");
				});

			return;
		}

		UserService.login($scope.loginData)
			.success(function(data){
				console.log('login', data);
				if(data.status == 404){
					$scope.loginError.flag = true;
					$scope.loginError.info = "用户名密码不匹配";
					// $timeout(clearLoginError,1200);
					$cordovaToast.showShortBottom('用户名密码错误');
				}
				else if(data.status == 200){
					realtime.createIMClient(data.userName).then(function(me) {
						$scope.IMClient = me;
						me.on('message', function(message, conversation) {
							$timeout(function(){
								$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
							},50);
							//switch (message.type) {
							//	case AV.TextMessage.TYPE:
							console.log('receive message', message);
							console.log('receive message conversation', conversation);
							if ($rootScope.currentChat.conversation.id == conversation.id) {
								$rootScope.currentChat.messages.push(message);
								$rootScope.currentChat.conversation = conversation;
								$rootScope.currentChat.conversation.read();
							}
							else if ($rootScope.currentChat.conversationList != null) {
								for (var i = 0; i < $rootScope.currentChat.conversationList.length; i++) {
									if ($rootScope.currentChat.conversationList[i].id == conversation.id) {
										$rootScope.currentChat.conversationList[i] = conversation;
										$rootScope.$apply();
										return;
									}
								}
								$rootScope.currentChat.conversationList.push(conversation);
							}
							$rootScope.$apply();
								//	break;
								//case AV.ImageMessage.TYPE:
								//	console.log('收到图片消息，url: ' + message.getFile().url() + ', width: ' + message.getFile().metaData('width'));
								//	break;
								//default:
								//	console.warn('收到未知类型消息');
							//}
						});
						me.getQuery().limit(1000).containsMembers([data.userName]).withLastMessagesRefreshed(true).find()
							.then(function(conversations){
								$scope.currentChat.conversationList = conversations;
								console.log('conbersationList', conversations);
							})
							.catch(console.error.bind(console));
						me.on('unreadmessagescountupdate', function(conversations) {
							console.log('unread', conversations);
							//for(var i = 0; i < conversation.length(); i++) {
							//	//console.log(conv.id, conv.name, conv.unreadMessagesCount);
							//}
						});
					});
					$scope.currentChat.user = data;
					UserService.setCurrentUser(data);
					UserService.isLogin = true;
					//ChatService.connect(UserService.getCurrentUser().userName, null);
					clearLoginError();
					$scope.closeLogin();

					if (data.photo != null) {
						UserService.usersProfile = baseUrl + port + '/student/getphoto?phone=' + data.phone;
					}
					//$state.go("tab.search");
				}
				else {
					console.log(data);
				}
			})
			.error(function(data){
				// $scope.loginError.flag = true;
				// $scope.loginError.info = "网络错误";
				// $timeout(clearLoginError, 1200);
				clearLoginError();
				console.log(data);
			})
	};

	$scope.reservation = {};
	$scope.reservation.photo = "img/noprofile.png";

	// Create the reserve modal that we will use later
	$ionicModal.fromTemplateUrl('templates/register.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.registerModal = modal;
	});

	// Triggered in the reserve modal to close it
	$scope.closeReserve = function() {
		$scope.registerModal.hide();
	};

	// Open the reserve modal
	$scope.register = function() {
		$scope.registerModal.show();
	};

	// Perform the reserve action when the user submits the reserve form
	$scope.doReserve = function() {
		console.log('Doing reservation', $scope.reservation);
		$scope.reservation.regDate = $filter('date')(new Date(), 'yyyyMMdd');

		UserService.register($scope.reservation)
			.success(function(data){
				if(data.status == 2){
					console.log("错误");
					ToastService.showCenterToast("错误")
						.then(function(success) {

						}, function (error) {
							console.log("show toast error");
						});
				}
				else if(data.status == 0){
					console.log("注册成功");
					// // for真机
					ToastService.showCenterToast("注册成功")
						.then(function(success) {
							UserService.setCurrentUser(data);
							UserService.isLogin = true;
							clearLoginError();
							$scope.closeReserve();
						}, function (error) {
							// error
						});

					// for console
					// UserService.setCurrentUser(data);
					// UserService.isLogin = true;
					// clearLoginError();
					// $scope.closeReserve();
				}
				else {
					console.log(data);
				}
			})
			.error(function(data){
				// $scope.loginError.flag = true;
				// $scope.loginError.info = "网络错误";
				// $timeout(clearLoginError, 1200);
				clearLoginError();
				console.log(data);
			})

		// $timeout(function() {
		//     $scope.closeReserve();
		// }, 1000);
	};
	//上传营业执照和身份证
	$scope.uploadMock = function(){
		var cameraOptions = {
			//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
			quality: 80,                                                                                        //相片质量0-100
			destinationType: Camera.DestinationType.DATA_URL,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
			sourceType: 0,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
			allowEdit: true,                                                                                //在选择之前允许修改截图
			encodingType:Camera.EncodingType.JPEG,                                     //保存的图片格式： JPEG = 0, PNG = 1
			mediaType:0,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
			cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
		};
		$cordovaCamera.getPicture(cameraOptions).then(function(imageData) {

			$cordovaToast.showShortBottom("读取文件成功");

		}, function(err) {
			// error
			console.log("get pic err");
		});
	}
	// 上传头像
	$scope.pickPhoto = function() {
		var actionSheetOptions = {
			title: '上传头像',
			buttonLabels: ['相机', '从图库选择'],
			addCancelButtonWithLabel: '取消',
			androidEnableCancelButton: true
		};
		$cordovaActionSheet.show(actionSheetOptions).then(function (btnIndex) {
			var imageSource;
			if(btnIndex == 1){
				imageSource = Camera.PictureSourceType.CAMERA;
			}
			else if(btnIndex == 2){
				imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
			}
			else{
				return;
			}
			var cameraOptions = {
				//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
				quality: 80,                                                                                        //相片质量0-100
				destinationType: Camera.DestinationType.DATA_URL,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
				sourceType: imageSource,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
				allowEdit: true,                                                                                //在选择之前允许修改截图
				encodingType:Camera.EncodingType.JPEG,                                     //保存的图片格式： JPEG = 0, PNG = 1
				targetWidth: 200,                                                                                //照片宽度
				targetHeight: 200,                                                                             //照片高度
				mediaType:0,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
				cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
			};

			$cordovaCamera.getPicture(cameraOptions).then(function(imageData) {

				$scope.reservation.photo = 'data:image/jpeg;base64,' + imageData;

			}, function(err) {
				// error
				console.log("get pic err");
			});
		});
	};

})

.controller('SearchCtrl', ['$scope', '$timeout', '$state', '$rootScope', 'UserService', '$cordovaInAppBrowser', 'SearchService', '$cordovaToast', '$cordovaGeolocation',
	function($scope, $timeout, $state, $rootScope, UserService, $cordovaInAppBrowser, SearchService, $cordovaToast, $cordovaGeolocation) {
		$rootScope.isSearchAddress = false;

		$scope.showMenu = {
			'flag': false
		};

		$scope.showSearchLabel = {
			'flag': true
		}

		$rootScope.position = new AMap.LngLat(116.397428, 39.90923);

		SearchService.getBasicLabels()
			.success(function(basicLabels){
				SearchService.getServiceLabels()
					.success(function(serviceLabels) {
						$scope.labels = SearchService.mergeLabels(basicLabels, serviceLabels);
					})
			});
		$scope.searchByLabel = function(serviceId){
			SearchService.searchByLabel(serviceId)
				.success(function(data){
					$rootScope.isSearchAddress = false;
					var geolocation = new AMap.Geolocation({
						enableHighAccuracy: true,//是否使用高精度定位，默认:true
						timeout: 10000                //超过10秒后停止定位，默认：无穷大
					});
					geolocation.getCurrentPosition();
					AMap.event.addListener(geolocation, 'complete', function (data) {
						$rootScope.position = data.position
					})
					var temp = {};
					for(i in data){
						if(!temp.hasOwnProperty(data[i].serviceLabelId)){
							temp[data[i].serviceLabelId] = [];
						}
						data[i].distance = $rootScope.position.distance([data[i].longitude, data[i].latitude]);
						temp[data[i].serviceLabelId].push(data[i]);
					}
					$rootScope.searchResults = [];
					for(i in temp){
						$rootScope.searchResults.push({
							'label': temp[i][0].serviceLabelName,
							'results': temp[i]
						})
					}
					$state.go('tab.searchresult');
				})
				.error(function(error){
					$cordovaToast.showShortBottom("网络错误,搜索失败");
				})
		}

		$scope.searchWord = "";
		$scope.searchByWord = function(){
			return SearchService.searchByWord($scope.searchWord)
				.success(function(data){
					$rootScope.isSearchAddress = false;
					if($rootScope.position == undefined) {
						var geolocation = new AMap.Geolocation({
							enableHighAccuracy: true,//是否使用高精度定位，默认:true
							timeout: 10000                //超过10秒后停止定位，默认：无穷大
						});
						geolocation.getCurrentPosition();
						AMap.event.addListener(geolocation, 'complete', function (data) {
							$rootScope.position = data.position
							console.log('$rootScope.position', $rootScope.position)
						})
					}
					console.log('word-search', data);
					var temp = {};
					for(i in data){
						if(!temp.hasOwnProperty(data[i].serviceLabelId)){
							temp[data[i].serviceLabelId] = [];
						}
						data[i].distance = $rootScope.position.distance([data[i].longitude, data[i].latitude]);
						temp[data[i].serviceLabelId].push(data[i]);
					}
					$rootScope.searchResults = [];
					for(i in temp){
						$rootScope.searchResults.push({
							'label': temp[i][0].serviceLabelName,
							'results': temp[i]
						})
					}
					$state.go('tab.searchresult');
				})
				.error(function(error){
					$cordovaToast.showShortBottom("网络错误,搜索失败");
				})
		}

		$scope.searchPosition = {};
		$scope.searchAddress = "";
		$scope.searchByPosition = function(){
			var geocoder = new AMap.Geocoder({
				radius: 500 //范围，默认：500
			});
			$rootScope.searchAddress = $scope.searchAddress;
			$rootScope.isSearchAddress = true;
			//地理编码,返回地理编码结果
			geocoder.getLocation($scope.searchAddress, function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
					var geocode = result.geocodes;
					$scope.searchPosition = {
						'longitude': geocode[0].location.getLng(),
						'latitude': geocode[0].location.getLat()
					}
					console.log('searchPosition', $scope.searchPosition);
					SearchService.searchByPosition($scope.searchPosition.longitude, $scope.searchPosition.latitude)
						.success(function(data){

							var geolocation = new AMap.Geolocation({
								enableHighAccuracy: true,//是否使用高精度定位，默认:true
								timeout: 10000                //超过10秒后停止定位，默认：无穷大
							});
							geolocation.getCurrentPosition();
							AMap.event.addListener(geolocation, 'complete', function (data) {
								$rootScope.position = data.position
							});
							var temp = {};
							for(i in data){
								if(!temp.hasOwnProperty(data[i].serviceLabelId)){
									temp[data[i].serviceLabelId] = [];
								}
								data[i].distance = $rootScope.position.distance([data[i].longitude, data[i].latitude]);
								temp[data[i].serviceLabelId].push(data[i]);
							}
							$rootScope.searchResults = [];
							for(i in temp){
								$rootScope.searchResults.push({
									'label': temp[i][0].serviceLabelName,
									'results': temp[i]
								})
							}
							$state.go('tab.searchresult',{'searchAddress': true});
						})
				}
			});

			//if($scope.searchPosition.longitude == undefined || $scope.searchPosition.latitude == undefined){
			//     $cordovaToast.showShortBottom('请选择位置');
			//     return;
			//}
		}


		var map = new AMap.Map('mapContainer', {
			resizeEnable: true,
			zoom:14,
			center: [116.397428, 39.90923]

		});
		map.plugin(['AMap.Geolocation', 'AMap.ToolBar'], function() {
			geolocation = new AMap.Geolocation({
				enableHighAccuracy: true,//是否使用高精度定位，默认:true
				timeout: 10000,                    //超过10秒后停止定位，默认：无穷大
				buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
				zoomToAccuracy: true,            //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
				buttonPosition: 'LB'
			});
			map.addControl(geolocation);
			map.addControl(new AMap.ToolBar());
			geolocation.getCurrentPosition();
			AMap.event.addListener(geolocation, 'complete', function (data) {
				//var str=['定位成功'];
				//str.push('经度：' + data.position.getLng());
				//str.push('纬度：' + data.position.getLat());
				//str.push('精度：' + data.accuracy + ' 米');
				//str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
				//document.getElementById('tip').innerHTML = str.join('<br>');
				$rootScope.position = data.position;
				$scope.searchAddress = data.formattedAddress;
				$scope.$digest();
			})
		})

		var auto = new AMap.Autocomplete({
			input: "search-place"
		});

		var placeSearch = new AMap.PlaceSearch({
			map: map
		});

		AMap.event.addListener(auto, "select", function select(e){
			placeSearch.setCity(e.poi.adcode);
			placeSearch.search(e.poi.name);    //关键字查询查询
		});//注册监听，当选中某条记录时会触发
		map.on('click', function(e) {
			//alert('您在[ '+e.lnglat.getLng()+','+e.lnglat.getLat()+' ]的位置点击了地图！');
			$scope.searchPosition.longitude = e.lnglat.getLng();
			$scope.searchPosition.latitude = e.lnglat.getLat();
			$scope.$digest();
		});

		$scope.processEnter = function(e){
			var keycode = window.event ? e.keyCode : e.which;//获取按键编码
			if (keycode == 13) {
				placeSearch.search(document.getElementById("search-place").value);
			}
		}



		//$scope.typeSearch = {};
		// $scope.type = ['小车', '卡车', '摩托车'];
		// $scope.quality = ['认证教练', '非认证教练', '陪练'];
		// $scope.language = ['国语', '英语', '粤语', '印度语', '菲语', '韩语', '日语'];
		// $scope.gender = ['男', '女'];
		//$scope.typeSearch.type = "C1";
		//$scope.typeSearch.quality = "jiaoche";
		//$scope.typeSearch.language = "zhongwen";
		//$scope.typeSearch.gender = "1";

		$scope.searchByType = function() {
			console.log($scope.typeSearch);

			SearchService.searchByType($scope.typeSearch)
				.success(function(data){
					// console.log(data);
					SearchService.setCurrentSearchResult(data);
					$state.go('tab.searchresult');
				})
				.error(function(data){

				})
		};

		//Baidu map
		//var map = new BMap.Map("mapContainer");
		//map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
		//map.addControl(new BMap.NavigationControl());
		//map.addControl(new BMap.GeolocationControl());

		// start - baidu map
		$scope.offlineOpts = {retryInterval: 5000};

		var longitude = 121.506191;
		var latitude = 31.245554;

		$scope.mapOptions = {
			center: {
				longitude: longitude,
				latitude: latitude
			},
			zoom: 17,
			city: 'ShangHai',
			markers: [{
				longitude: longitude,
				latitude: latitude,
				icon: 'img/mappiont.png',
				width: 49,
				height: 60,
				title: 'Where',
				content: 'Put description here'
			}]
		};

		$scope.mapLoaded = function(map) {
			console.log(map);
		};

		$timeout(function() {
			$scope.mapOptions.center.longitude = 121.500885;
			$scope.mapOptions.center.latitude = 31.190032;
			$scope.mapOptions.markers[0].longitude = 121.500885;
			$scope.mapOptions.markers[0].latitude = 31.190032;
		}, 5000);

		// end - baidu map

		$scope.searchBtnClicked = function() {

			$state.go('tab.searchresult');

		};

		$scope.isLogin = function() {
			return !UserService.isLogin;
		}
	}
])

.controller('FollowCtrl', function($scope, $rootScope, UserService, $state, $ionicListDelegate, ServiceService, $cordovaToast, $ionicModal, $timeout) {
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
				$scope.myFollowServices = data.serviceinfoDTOList;
			})
	}
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
		//$rootScope.$apply();
		//获得聊天记录、创建对话
		if(UserService.currentUser.id != undefined && UserService.currentUser.id != service.publishUserId) { //未登录时不能创建会话, 不能和自己创建会话
			$scope.IMClient.createConversation({
				members: [service.userName, service.id],
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

	$scope.showModifyServiceModal = function(service){
		$ionicModal.fromTemplateUrl('templates/service.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modifyService = service;
			$scope.serviceModal = modal;
			$scope.mode = 'read';
			$scope.serviceModal.show();
		});
	}

	//$scope.myFollowedCoasts = [];
	//$scope.qualityHash = {
	//    "jiaoche": "轿车"
	//}
	//
	//$scope.$on('$ionicView.beforeEnter', function(){
	//    UserService.searchAllFollows()
	//        .success(function(data){
	//            $scope.myFollowedCoasts = data.coachinfoDTOList;
	//        })
	//        .error(function(data){
	//            console.log("get my follow error");
	//        })
	//});
	//
	//$scope.unfollow = function(coast) {
	//    var pair = {};
	//    pair.coachId = coast.id;
	//    pair.studentId = UserService.getCurrentUser().id;
	//
	//    console.log(pair);
	//
	//    UserService.unFollow(pair)
	//        .success(function(data){
	//            if (data.status == 0) {
	//                console.log("取关成功");
	//                $scope.removeCoast(coast);
	//                $ionicListDelegate.closeOptionButtons();
	//            }
	//            else {
	//                console.log("取关失败");
	//                $ionicListDelegate.closeOptionButtons();
	//            }
	//        })
	//        .error(function(data){
	//            console.log(data);
	//            $ionicListDelegate.closeOptionButtons();
	//        });
	//
	//};
	//
	//$scope.removeCoast = function(coast) {
	//    // for (var i = 0; i < $scope.myFollowedCoasts.length; i++) {
	//    //     if ($scope.myFollowedCoasts[i].coachId == coast.coachId) {
	//    //         console.log("aha");
	//    //         $scope.myFollowedCoasts.splice(i, 1);
	//    //         return;
	//    //     }
	//    // }
	//    $scope.myFollowedCoasts.splice($scope.myFollowedCoasts.indexOf(coast), 1);
	//    console.log($scope.myFollowedCoasts.length);
	//}
})

.controller('ChatDetailCtrl', function($scope, $stateParams, messageService, $ionicScrollDelegate, $timeout, UserService) {
	$scope.myProfile = UserService.usersProfile;
})

.controller('PublishCtrl', function($scope, $state, $ionicPopup, $ionicModal, $filter, localStorageService, messageService, UserService, ImageService, SearchService, ServiceService,
                                    ToastService, $cordovaActionSheet, $cordovaCamera, $cordovaToast, Chats, baseUrl, port, $cordovaFileTransfer, $http, $rootScope, $ionicScrollDelegate, $timeout) {

	$scope.showMenu = {
		'flag': false,
		'flag1': false
	};

	var getPublishServices = function(){
		if(UserService.getCurrentUser().id == undefined){
			return;
		}
		ServiceService.getPublishServices(UserService.getCurrentUser().id)
			.success(function(data){
				$scope.myPublishServices = data.serviceinfoDTOList;

			})
	}

	getPublishServices();

	$scope.showModifyServiceModal = function(service){
		$ionicModal.fromTemplateUrl('templates/service.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modifyService = service;
			$scope.serviceModal = modal;
			$scope.mode = 'modify';
			$scope.serviceModal.show();
		});
	};

	$scope.commitModifyService = function(service){
		var temp = {};
		temp.id = service.id;
		temp.longitude = service.longitude;
		temp.latitude = service.latitude;
		temp.serviceLabelId = service.serviceLabelId;
		temp.slogan = service.slogan;
		temp.status = service.status;
		ServiceService.modifyService(temp)
			.success(function(data){
				getPublishServices();
				$cordovaToast.showShortBottom('修改服务信息成功');
				$scope.serviceModal.remove();
			})
			.error(function(err){
				$cordovaToast.showShortBottom('修改服务信息失败,请检查网络');
			})
	};

	$scope.showDeleteServiceConfirm = function(publishServiceInfo){
		if(confirm('删除后无法恢复,确认删除该服务?')){
			ServiceService.deleteService(publishServiceInfo.id)
				.success(function(data){
					$cordovaToast.showShortBottom('删除服务成功');
					$scope.serviceModal.remove();
					getPublishServices();
				})
				.error(function(err){
					$cordovaToast.showShortBottom('删除服务失败,请检查网络');
				})
		};
	};

	$scope.showPublishServiceInfoModal = function(service){
		$scope.publishServiceInfo = angular.copy(service);
		$ionicModal.fromTemplateUrl('templates/publishServiceInfo.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.publishServiceInfoModal = modal;
			$scope.publishServiceInfoModal.show();
		});
	};



	$scope.showMessageDetails = function(conversation){
		$rootScope.currentChat.conversation = conversation;
		$rootScope.currentChat.messages = null;
		conversation.queryMessages({
			limit: 1000, // limit 取值范围 1~1000，默认 20
		}).then(function (messages) {
			$rootScope.currentChat.messages = messages;
			console.log('user service messages', messages);
			conversation.read();
			$rootScope.$apply();
		}).catch(console.error.bind(console))
		$ionicModal.fromTemplateUrl('templates/messageDetails.html', {
			scope: $scope
		}).then(function(modal) {
			var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
			viewScroll.scrollBottom();
			$scope.messageDetailsModal = modal;
			$scope.messageDetailsModal.show();
			$timeout(function(){
				$ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
			},50);
		});
	};


	$scope.selectServicePicture = function(service){
		var actionSheetOptions = {
			title: '上传产品图片',
			buttonLabels: ['相机', '从图库选择'],
			addCancelButtonWithLabel: '取消',
			androidEnableCancelButton: true
		};
		$cordovaActionSheet.show(actionSheetOptions).then(function (btnIndex) {
			var imageSource;
			if(btnIndex == 1){
				imageSource = Camera.PictureSourceType.CAMERA;
			}
			else if(btnIndex == 2){
				imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
			}
			else{
				return;
			}
			var cameraOptions = {
				//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
				quality: 70,                                                                                        //相片质量0-100
				destinationType: Camera.DestinationType.DATA_URL,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
				sourceType: imageSource,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
				allowEdit: false,                                                                                //在选择之前允许修改截图
				encodingType:Camera.EncodingType.JPEG,                                     //保存的图片格式： JPEG = 0, PNG = 1
				mediaType:0,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
				cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
			};
			$cordovaCamera.getPicture(cameraOptions).then(function(imageURI) {
				ServiceService.uploadPicture(service.id, imageURI)
					.success(function(data){
						console.log(data);
					})
			}, function(err) {
				// error

			});
		});
	}

	$scope.selectServiceVideo = function(service){
		var cameraOptions = {
			//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
			quality: 70,                                                                                        //相片质量0-100
			destinationType: Camera.DestinationType.FILE_URI,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
			allowEdit: false,                                                                                //在选择之前允许修改截图
			mediaType:1,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
			cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
		};
		$cordovaCamera.getPicture(cameraOptions).then(function(videoURI) {
			console.log(videoURI);

			//ServiceService.uploadVideo(service.id, videoURI)
			//	.then(function (result) {
			//		// Success!
			//		console.log('uploadVideo',result);
			//	}, function (err) {
			//		// Error
			//	}, function (progress) {
			//		// constant progress updates
			//	});
			var server = baseUrl + port + '/service/uploadvideo';
			var filePath = videoURI;
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.params = {'id': service.id};
			options.httpMethod = "POST";
			options.mimeType="multipart/form-data";
			options.headers= {
				'Connection': 'keep-alive'
			}
			options.timeout = 100000000;

			$cordovaFileTransfer.upload(server, filePath ,options, true)
				.then(function (result) {
					// Success!
					console.log('uploadVideo',result);
					$cordovaToast.showShortBottom("上传视频成功");
				}, function (err) {
					// Error
					console.log('uploadVideoError',err);
				}, function (progress) {
					// constant progress updates
				});


		}, function(err) {
			// error

		});
	}

	$scope.showProfileModal = function(){
		if(UserService.getCurrentUser().id == undefined){
			return;
		}
		$ionicModal.fromTemplateUrl('templates/profile.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.profile = UserService.getCurrentUser();
			$scope.profileModal = modal;
			$scope.profileModal.show();
		});
	}

	$scope.selectPhoto = function(){
		var actionSheetOptions = {
			title: '上传头像',
			buttonLabels: ['相机', '从图库选择'],
			addCancelButtonWithLabel: '取消',
			androidEnableCancelButton: true
		};
		$cordovaActionSheet.show(actionSheetOptions).then(function (btnIndex) {
			var imageSource;
			if(btnIndex == 1){
				imageSource = Camera.PictureSourceType.CAMERA;
			}
			else if(btnIndex == 2){
				imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
			}
			else{
				return;
			}
			var cameraOptions = {
				//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
				quality: 70,                                                                                        //相片质量0-100
				destinationType: Camera.DestinationType.DATA_URL,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
				sourceType: imageSource,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
				allowEdit: false,                                                                                //在选择之前允许修改截图
				encodingType:Camera.EncodingType.JPEG,                                     //保存的图片格式： JPEG = 0, PNG = 1
				mediaType:0,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
				cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
			};
			$cordovaCamera.getPicture(cameraOptions).then(function(imageURI) {
				UserService.uploadPhoto(imageURI, UserService.getCurrentUser().phone)
					.success(function(data){
						var currentUser = UserService.getCurrentUser();
						currentUser.photo = 'data:image/jpeg;base64,' + imageURI;
						$scope.profile.photo = 'data:image/jpeg;base64,' + imageURI;
						UserService.setCurrentUser(currentUser);
						$cordovaToast.showShortBottom("上传头像成功");
					})
			}, function(err) {
				// error

			});
		});
	}

	$scope.logout = function(){
		UserService.setCurrentUser({});
		UserService.isLogin = false;
		$scope.profile = {};
		$scope.profileModal.remove();
		$rootScope.currentChat = {
			'conversation': null, //当前活动的对话
			'messages': null,   //当前活动对话对应的消息记录
			'conversationList': null //用户的所有对话列表
		};
		$rootScope.position = undefined;
		$scope.IMClient.close().then(function() {
			console.log('退出聊天登录');
		}).catch(console.error.bind(console));
		$state.go('tab.search')
	}

	$scope.showServiceModal = function(){
		$ionicModal.fromTemplateUrl('templates/service.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.serviceModal = modal;
			$scope.mode = 'new';
			$scope.serviceModal.show();
		});

	}
	$scope.newService = {};
	$scope.$watch('newService.basic', function(){
		$scope.newService.service = $scope.newService.basic.services[0];
	});
	SearchService.getBasicLabels()
		.success(function(basicLabels){
			SearchService.getServiceLabels()
				.success(function(serviceLabels) {
					$scope.labels = SearchService.mergeLabels(basicLabels, serviceLabels);
					$scope.newService.basic = $scope.labels[0];
				})
		});
	$scope.publishService = function(){
		if($scope.newService.longitude == undefined || $scope.newService.longitude == "" || isNaN($scope.newService.longitude)){
			$cordovaToast.showShortBottom('请正确填写经度');
			return;
		}
		if($scope.newService.latitude == undefined || $scope.newService.latitude == "" || isNaN($scope.newService.latitude)){
			$cordovaToast.showShortBottom('请正确填写纬度');
			return;
		}
		if($scope.newService.slogan == undefined || $scope.newService.slogan == ""){
			$cordovaToast.showShortBottom('请正确填写广告语');
			return;
		}
		delete $scope.newService.basic;
		$scope.newService.serviceLabelId = $scope.newService.service.id;
		delete $scope.newService.service;
		$scope.newService.publishUserId = UserService.getCurrentUser().id;
		$scope.newService.datetime = $filter('date')(new Date(), 'yyyyMMdd');
		console.log($scope.newService);
		ServiceService.publishService($scope.newService)
			.success(function(data){
				ToastService.showBottomToast("发布服务成功");
				getPublishServices();
			})
			.error(function(error){
				ToastService.showBottomToast("发布服务失败");
			})

	};
	$http.get("data/messages.json").then(function(response) {
		// localStorageService.update("messages", response.data.messages);
		$scope.messages = response.data.messages

	});






	$scope.loginUser = {};

	$scope.$on("$ionicView.beforeEnter", function(){

		if (UserService.isLogin) {
			if (!UserService.profileUpdated) {
				$scope.loginUser = UserService.getCurrentUser();
				$scope.userProfile = baseUrl + port + '/student/getphoto?phone=' + $scope.loginUser.phone;
				UserService.usersProfile = $scope.userProfile;
			}
		}
		else {
			$scope.userProfile = "img/noprofile.png";
		}
	});

	$scope.profileInfo = {};
	$scope.showRedIcon = true;

	if (UserService.getCurrentUser().id == null) {
		$scope.loginUser.description = "未登录";
	}
	else {
		if ($scope.loginUser.description == null) {
			// console.log("null description");
			$scope.loginUser.description = "暂无介绍";
		}
	}

	$scope.isShow = function() {
		return !UserService.isLogin;
	}

	$scope.editProfile = function() {

		console.log("edit profile");

		if (!UserService.isLogin) {
			return;
		}

		$scope.profileInfo.phone = UserService.getCurrentUser().phone;

		var option = {
			title: '编辑头像',
			buttonLabels: ['相机', '从图库选择'],
			addCancelButtonWithLabel: '取消',
			androidEnableCancelButton: true
		};
		$cordovaActionSheet.show(option).then(function (btnIndex) {
			var imageSource;
			if(btnIndex == 1){
				imageSource = Camera.PictureSourceType.CAMERA;
			}
			else if(btnIndex == 2){
				imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
			}
			else{
				return;
			}
			var cameraOptionss = {
				//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
				quality: 80,                                                                                        //相片质量0-100
				destinationType: Camera.DestinationType.DATA_URL,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
				sourceType: imageSource,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
				allowEdit: true,                                                                                //在选择之前允许修改截图
				encodingType:Camera.EncodingType.JPEG,                                     //保存的图片格式： JPEG = 0, PNG = 1
				targetWidth: 200,                                                                                //照片宽度
				targetHeight: 200,                                                                             //照片高度
				mediaType:0,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
				cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
			};

			$cordovaCamera.getPicture(cameraOptionss).then(function(imageData) {

				// $scope.begin = imageData.indexOf("base64") + 7;
				// $scope.myUploadPic = imageData.substr($scope.begin);

				$scope.profileInfo.photoImageValue = imageData;

				ImageService.uploadProfile($scope.profileInfo)
					.success(function(data){
						if (data.result == "OK") {
							ToastService.showTopToast("上传成功")
								.then(function(success) {
									$scope.userProfile = 'data:image/jpeg;base64,' + imageData;
									UserService.usersProfile = $scope.userProfile;
								}, function (error) {
									console.log("show toast error");
								});
							UserService.profileUpdated = true;
						}
						else {
							ToastService.showTopToast("上传失败")
								.then(function(success) {

								}, function (error) {
									console.log("show toast error");
								});
						}
					})
					.error(function(data){
						ToastService.showTopToast(data)
							.then(function(success) {

							}, function (error) {
								console.log("show toast error");
							});
					})

			}, function(err) {
				// error
				console.log("get pic err");
			});
		});
	}

	// copied from ionic wechat - start
	$scope.allchatmessages = Chats.all();
	// console.log(JSON.stringify($scope.messages));

	$scope.onSwipeLeft = function() {
		$state.go("tab.friends");
	};
	$scope.popupMessageOpthins = function(message) {
		$scope.popup.index = $scope.messages.indexOf(message);
		$scope.popup.optionsPopup = $ionicPopup.show({
			templateUrl: "templates/popup.html",
			scope: $scope,
		});
		$scope.popup.isPopup = true;
	};
	$scope.markMessage = function() {
		var index = $scope.popup.index;
		var message = $scope.messages[index];
		if (message.showHints) {
			message.showHints = false;
			message.noReadMessages = 0;
		} else {
			message.showHints = true;
			message.noReadMessages = 1;
		}
		$scope.popup.optionsPopup.close();
		$scope.popup.isPopup = false;
		messageService.updateMessage(message);
	};
	$scope.deleteMessage = function() {
		var index = $scope.popup.index;
		var message = $scope.messages[index];
		$scope.messages.splice(index, 1);
		$scope.popup.optionsPopup.close();
		$scope.popup.isPopup = false;
		messageService.deleteMessageId(message.id);
		messageService.clearMessage(message);
	};
	$scope.topMessage = function() {
		var index = $scope.popup.index;
		var message = $scope.messages[index];
		if (message.isTop) {
			message.isTop = 0;
		} else {
			message.isTop = new Date().getTime();
		}
		$scope.popup.optionsPopup.close();
		$scope.popup.isPopup = false;
		messageService.updateMessage(message);
	};
	$scope.messageDetils = function(message) {
		$scope.showRedIcon = false;
		$state.go("tab.messageDetail", {
			"messageId": message.id
		});
	};
	$scope.$on("$ionicView.beforeEnter", function(){
		// console.log($scope.messages);
		$scope.messages = messageService.getAllMessages();
		$scope.popup = {
			isPopup: false,
			index: 0
		};
	});
	// copied from ionic wechat - end
})

.controller('messageDetailCtrl', ['$scope', '$stateParams',
	'messageService', '$ionicScrollDelegate', '$timeout', 'UserService',
	function($scope, $stateParams, messageService, $ionicScrollDelegate, $timeout, UserService) {

		$scope.myProfile = UserService.usersProfile;

		var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
		// console.log("enter");
		$scope.doRefresh = function() {
			// console.log("ok");
			$scope.messageNum += 5;
			$timeout(function() {
				$scope.messageDetilss = messageService.getAmountMessageById($scope.messageNum,
					$stateParams.messageId);
				$scope.$broadcast('scroll.refreshComplete');
			}, 200);
		};

		$scope.$on("$ionicView.beforeEnter", function() {
			$scope.message = messageService.getMessageById($stateParams.messageId);
			$scope.message.noReadMessages = 0;
			$scope.message.showHints = false;
			messageService.updateMessage($scope.message);
			$scope.messageNum = 10;
			$scope.messageDetilss = messageService.getAmountMessageById($scope.messageNum,
				$stateParams.messageId);
			$timeout(function() {
				viewScroll.scrollBottom();
			}, 0);
		});

		window.addEventListener("native.keyboardshow", function(e){
			viewScroll.scrollBottom();
		});
	}
])

.controller('SearchResultCtrl', function($scope, $state, $cordovaToast, $rootScope, SearchService, UserService, ServiceService, $stateParams, $ionicModal, $ionicScrollDelegate, $timeout) {
	// $ionicTabsDelegate.showBar(false);
	console.log('searchAddress', $scope.searchAddress);
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
				for(i in data.serviceinfoDTOList){
					$scope.followList.push(data.serviceinfoDTOList[i].id);
				}
				console.log('followList', $scope.followList)
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
		ServiceService.followService(service.id, UserService.getCurrentUser().id)
			.success(function(data){
				if(data.status == 0){
					$scope.followList.push(service.id);
					$cordovaToast.showShortBottom('关注成功');
				}
				else{
					$cordovaToast.showShortBottom("不能重复关注哦");
				}
			})
	}

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
	}
	$scope.showUserServiceInfoModal = function(service){
		$rootScope.currentChat.conversation = null;
		$rootScope.currentChat.messages = null;
		$scope.userServiceInfo = service;
		//$rootScope.$apply();
		//获得聊天记录、创建对话
		if(UserService.currentUser.id != undefined && UserService.currentUser.id != service.publishUserId) { //未登录时不能创建会话, 不能和自己创建会话
			$scope.IMClient.createConversation({
				members: [service.userName, service.id],
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



	//$scope.$on("$ionicView.beforeEnter", function(){
	//
	//    $scope.coaches = SearchService.getCurrentSearchResult();
	//    //console.log($scope.coaches);
	//
	//    if(UserService.getCurrentUser().id == null) {
	//
	//        $scope.filtedCoaches = $scope.coaches;
	//        //console.log($scope.filtedCoaches);
	//    }
	//    else {
	//        UserService.searchAllFollows()
	//            .success(function(data){
	//                // UserService.setFollowedCoach(data);
	//
	//                $scope.filtedCoaches = $scope.filtMyFollow($scope.coaches, data.coachinfoDTOList);
	//            })
	//            .error(function(data){
	//                console.log("get all follows error");
	//            })
	//    }
	//});

});
