/**
 * Created by kubenetes on 2018/1/16.
 */
angular.module('starter.controllers', ['ngCordova', 'starter.services'])
	.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $cordovaCamera, $cordovaActionSheet, $ionicHistory, $cordovaToast, ToastService, UserService, ChatService, $http, baseUrl, port, $state, $filter, $ionicScrollDelegate, $cordovaSocialSharing) {

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

		if($rootScope.isFirst == undefined){
			$rootScope.isFirst = true;
			$state.go('tab.searchresult');
		}

		$rootScope.currentChat = {
			'user': null,
			'conversation': null, //当前活动的对话
			'messages': null,   //当前活动对话对应的消息记录
			'conversationList': null //用户的所有对话列表
		};

		$rootScope.currentPosition = {};

		$rootScope.searchResultPosition = {};

		$scope.isLogin = false;
		//$scope.$apply();

		$scope.messageService = {};

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
				$cordovaToast.showShortBottom("未获取当前会话");
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
						for(var i in $rootScope.currentChat.conversationList){
							if($rootScope.currentChat.conversationList[i].id == $rootScope.currentChat.conversation.id){
								$rootScope.currentChat.conversationList[i] = $rootScope.currentChat.conversation;
								break;
							}
						}
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
					for(var i in $rootScope.currentChat.conversationList){
						if($rootScope.currentChat.conversationList[i].id == $rootScope.currentChat.conversation.id){
							$rootScope.currentChat.conversationList[i] = $rootScope.currentChat.conversation;
							break;
						}
					}
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

		$scope.loginData = {
			'gender': true
		};
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

		$scope.getValidateCode = function(phone, code){
			if(phone == undefined ||phone == ""){
				$cordovaToast.showShortBottom("请填写手机号");
				return;
			}
			UserService.sendValidateCode(phone, code)
				.success(function(data){
					$cordovaToast.showShortBottom("验证码已发送");
				})
				.error(function(err){
					$cordovaToast.showShortBottom("验证码发送失败");
				})
		};

		$scope.login = function() {
			$scope.modal.show();
		};

		//$scope.isLogin = function() {
		//	return !UserService.isLogin;
		//};



		// Perform the login action when the user submits the login form
		$scope.doLogin = function() {
			if($scope.loginData.phone == '' || $scope.loginData.phone == undefined
				|| $scope.loginData.validateCode == '' || $scope.loginData.validateCode == undefined){
				$scope.loginError.flag = true;
				$scope.loginError.info = "手机号或验证码未填写";

				ToastService.showCenterToast($scope.loginError.info)
					.then(function(success) {
						clearLoginError();
					}, function (error) {
						console.log("show toast error");
					});

				return;
			}

			UserService.smsLogin($scope.loginData.phone, $scope.loginData.validateCode)
				.success(function(data){
					console.log('login', data);
					if(data.status == 404){
						$scope.loginError.flag = true;
						$scope.loginError.info = "手机号验证码不匹配";
						// $timeout(clearLoginError,1200);
						$cordovaToast.showShortBottom('手机号验证码不匹配');
					}
					else if(data.status == 200){
						console.log('login', data);
						realtime.createIMClient(data.id).then(function(me) {
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
							me.getQuery().limit(1000).containsMembers([data.id]).withLastMessagesRefreshed(true).find()
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
						$scope.loginData = {};
						$scope.currentChat.user = data;
						UserService.setCurrentUser(data);
						$scope.isLogin = true;
						localStorage.setItem('currentUser', JSON.stringify(data));
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

		$scope.autoLogin = function(){
			var currentUser = localStorage.getItem('currentUser');
			if(currentUser == null || currentUser == undefined){
				return;
			}
			currentUser = JSON.parse(currentUser);
			realtime.createIMClient(currentUser.id).then(function(me) {
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
				me.getQuery().limit(1000).containsMembers([currentUser.id]).withLastMessagesRefreshed(true).find()
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
			$scope.loginData = {};
			$scope.currentChat.user = currentUser;
			UserService.setCurrentUser(currentUser);
			$scope.isLogin = true;

		};

		$scope.autoLogin();

		$scope.logout = function(){
			UserService.setCurrentUser({});
			$scope.isLogin = false;
			//$scope.profile = {};
			//$scope.profileModal.remove();
			$rootScope.currentChat = {
				'conversation': null, //当前活动的对话
				'messages': null,   //当前活动对话对应的消息记录
				'conversationList': null //用户的所有对话列表
			};
			if($scope.IMClient) {
				$scope.IMClient.close().then(function () {
					console.log('退出聊天登录');
				}).catch(console.error.bind(console));
			}
			localStorage.removeItem('currentUser');
			$state.go('tab.search')
		}

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
			if($scope.reservation.phone == '' || $scope.reservation.phone == undefined){
				$cordovaToast.showShortBottom("请填写手机号");
				return;
			}
			if($scope.reservation.validateCode == '' || $scope.reservation.validateCode == undefined){
				$cordovaToast.showShortBottom("请填写验证码");
				return;
			}
			console.log('Doing reservation', $scope.reservation);
			$scope.reservation.regDate = $filter('date')(new Date(), 'yyyyMMdd');

			UserService.smsRegister($scope.reservation.phone, $scope.reservation.validateCode, $scope.reservation.regDate)
				.success(function(data){
					if(data.status == 2){
						$cordovaToast.showShortBottom("该手机号已被注册");
					}
					else if(data.status == 0){
						console.log("注册成功");
						$scope.reservation = {};
						$cordovaToast.showShortBottom("注册成功");
						UserService.setCurrentUser(data);
						UserService.isLogin = true;
						clearLoginError();
						$scope.closeReserve();
					}
					else if(data.status == 5){
						$cordovaToast.showShortBottom("验证码错误");
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


		$scope.myShare = function(){
			$cordovaSocialSharing
				.share("生活助手", null, null, " http://106.14.16.218:8100/") // Share via native share sheet
				.then(function(result) {
					//$cordovaToast.showShortBottom("分享成功");
				}, function(err) {
					//$cordovaToast.showShortBottom("分享失败");
				});
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
