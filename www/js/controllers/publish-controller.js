/**
 * Created by kubenetes on 2018/1/16.
 */
angular.module('starter.controllers')
	.controller('PublishCtrl', function($scope, $state, $ionicPopup, $ionicModal, $filter, localStorageService, messageService, UserService, ImageService, SearchService, ServiceService,
	                                    ToastService, $cordovaActionSheet, $cordovaCamera, $cordovaToast, Chats, baseUrl, port, $cordovaFileTransfer, $http, $rootScope, $ionicScrollDelegate, $timeout) {

		$scope.showMenu = {
			'flag': false,
			'flag1': false
		};

		$scope.profileModalSource = "profile"; //新建服务时如果个人信息不完整,跳转到完善个人信息界面

		$scope.newServiceButtonState = true; //新建服务时的按钮状态,true可用,false不可用,防止用户多次点击

		//var getPublishServices = function(){
		//	if(UserService.getCurrentUser().id == undefined){
		//		return;
		//	}
		//	ServiceService.getPublishServices(UserService.getCurrentUser().id)
		//		.success(function(data){
		//			$scope.myPublishServices = data.serviceinfoDTOList;
		//
		//		})
		//}

		$scope.getPublishServices();

		$scope.showModifyServiceModal = function(service, $event){
			$event.stopPropagation();
			$ionicModal.fromTemplateUrl('templates/service.html', {
				scope: $scope
			}).then(function(modal) {
				$scope.modifyService = angular.copy(service);
				$scope.modifyService.title = $scope.modifyService.title.replace(/<br \/>/g, '\r\n');
				$scope.modifyService.slogan = $scope.modifyService.slogan.replace(/<br \/>/g, '\r\n');
				$scope.modifyService.forDelete = [];
				$scope.modifyService.forUpload = [];
				for(var i in $scope.labels){
					if($scope.labels[i].id == $scope.modifyService.basicLabelId){
						$scope.modifyService.basicLabel = $scope.labels[i];
						break;
					}
				}
				var temp = $scope.modifyService.basicLabel.serviceLabel;
				for(var i in temp){
					if(temp[i].id == $scope.modifyService.serviceLabelId){
						$scope.modifyService.serviceLabel = temp[i];
						break;
					}
				}
				temp = $scope.modifyService.serviceLabel.thirdLabel;
				for(var i in temp){
					if(temp[i].id == $scope.modifyService.thirdLabelId){
						$scope.modifyService.thirdLabel = temp[i];
						break;
					}
				}
				$scope.serviceModal = modal;
				$scope.mode = 'modify';
				$scope.serviceModal.show();
			});
		};

		$scope.commitModifyService = function(service){
			var temp = {};
			temp.id = service.id;
			temp.address = service.address;
			temp.longitude = service.longitude;
			temp.latitude = service.latitude;
			temp.thirdLabelId = service.thirdLabel.id;
			temp.slogan = service.slogan.replace(/\r?\n/g, '<br />');
			temp.title = service.title.replace(/\r?\n/g, '<br />');
			temp.status = service.status;
			temp.phonenum = service.phonenum;
			ServiceService.modifyService(temp)
				.success(function(data){
					$scope.getPublishServices();
					$cordovaToast.showShortBottom('修改服务信息成功');
					$scope.serviceModal.remove();

				})
				.error(function(err){
					$cordovaToast.showShortBottom('修改服务信息失败,请检查网络');
				})
			if(service.forUpload > 0){
				ServiceService.uploadPicture(temp.id, service.forUpload);
			}
			if(service.forDelete.length > 0){
				var delList = [];
				for(var i in service.forDelete){
					delList.push(service.forDelete[i].picId);
				}
				ServiceService.deletePicture(delList);
			}
		};

		$scope.addDelList = function(source, $index, target, $event){
			$event.stopPropagation();
			target.push(source[$index]);
			source.splice($index, 1);
		};

		$scope.showDeleteServiceConfirm = function(publishServiceInfo, $event){
			$event.stopPropagation();
			if(confirm('删除后无法恢复,确认删除该服务?')){
				ServiceService.deleteService(publishServiceInfo.id)
					.success(function(data){
						$cordovaToast.showShortBottom('删除服务成功');
						$scope.serviceModal.remove();
						$scope.getPublishServices();
					})
					.error(function(err){
						$cordovaToast.showShortBottom('删除服务失败,请检查网络');
					})
			};
		};

		$scope.showPublishServiceInfoModal = function(service){
			$scope.publishServiceInfo = angular.copy(service);
			$scope.messageService = service;
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
				$scope.profile.gender = String($scope.profile.gender);
				$scope.profileModal = modal;
				$scope.profileModal.show();
			});
		}

		$scope.modifyUserProfile = function(profile){
			if(profile.name == undefined || profile.name == ""
				|| profile.userName == undefined || profile.userName == ""){
				$cordovaToast.showShortBottom("请完整填写用户信息");
				return;
			}
			UserService.modifyUserProfile(profile)
				.success(function(data){
					if(data.status == 0) {
						$scope.profileModal.remove();
						$cordovaToast.showShortBottom("更新用户信息成功");
						UserService.setCurrentUser(profile);
						if($scope.profileModalSource == "newService"){
							$scope.showServiceModal()
						}
					}
					else{
						$cordovaToast.showShortBottom("更新用户信息失败");
					}
					$scope.profileModalSource = "profile";
				})
				.error(function(err){
					$cordovaToast.showShortBottom("网络错误,更新用户信息失败");
					$scope.profileModalSource = "profile";
				})
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
		};

		//*****************以下为新建服务
		$scope.showServiceModal = function(){
			//var user = UserService.getCurrentUser();
			//if(user.name == undefined || user.name == ""
			//	|| user.userName == undefined || user.userName == ""
			//	|| user.gender == undefined){
			//	$cordovaToast.showShortBottom("请先完善个人信息");
			//	$scope.showProfileModal();
			//	$scope.profileModalSource = "newService";
			//	return;
			//}
			$ionicModal.fromTemplateUrl('templates/service.html', {
				scope: $scope
			}).then(function(modal) {
				$scope.serviceModal = modal;
				$scope.mode = 'new';
				$scope.serviceModal.show();
			});

		};

		$scope.newService = {pictureImageValue:[]};

		SearchService.getAllLabels()
			.success(function(data){
				$scope.labels = data;
			});
		$scope.selectNewSvcPic = function(result){
			//var cameraOptions = {
			//	//这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
			//	quality: 70,                                                                                        //相片质量0-100
			//	destinationType: Camera.DestinationType.DATA_URL,                //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
			//	sourceType: 0,                         //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
			//	allowEdit: false,                                                                                //在选择之前允许修改截图
			//	encodingType:Camera.EncodingType.JPEG,                                     //保存的图片格式： JPEG = 0, PNG = 1
			//	mediaType:0,                                                                                         //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
			//	cameraDirection:0                                                                            //枪后摄像头类型：Back= 0,Front-facing = 1
			//};
			//$cordovaCamera.getPicture(cameraOptions).then(function(imageURI) {
			//	result.push(imageURI);
			//}, function(err) {
			//	// error
			//
			//});
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
					result.push(imageURI);
					console.log(imageURI);
				}, function(err) {
					// error

				});
			});
		};

		$scope.publishService = function(){
			console.log('publishService', $scope.newService);
			if($scope.newService.address == undefined || $scope.newService.address == ""){
				$cordovaToast.showShortBottom('请正确填写地址');
				return;
			}
			if($scope.newService.slogan == undefined || $scope.newService.slogan == ""){
				$cordovaToast.showShortBottom('请正确填写广告语');
				return;
			}
			$scope.newServiceButtonState = false;
			var temp = {};
			temp.datetime = $filter('date')(new Date(), 'yyyyMMdd');
			temp.publishUserId = UserService.getCurrentUser().id;
			temp.slogan = $scope.newService.slogan.replace(/\r?\n/g, '<br />');
			temp.thirdLabelId = $scope.newService.thirdLabel.id;
			temp.address = $scope.newService.address;
			temp.title = $scope.newService.title.replace(/\r?\n/g, '<br />');;
			temp.pictureImageValue = $scope.newService.pictureImageValue;
			temp.phonenum = $scope.newService.phonenum;
			var geocoder = new AMap.Geocoder({
				radius: 500 //范围，默认：500
			});
			//地理编码,返回地理编码结果
			geocoder.getLocation($scope.newService.address, function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
					var geocode = result.geocodes;
					temp.longitude = geocode[0].location.getLng();
					temp.latitude = geocode[0].location.getLat();
					ServiceService.publishService(temp)
						.success(function(data){
							$scope.newService = {pictureImageValue:[]};
							ToastService.showBottomToast("发布服务成功");
							$scope.getPublishServices();
							$scope.serviceModal.remove();
							$scope.newServiceButtonState = true;
							$scope.$apply();
						})
						.error(function(error){
							ToastService.showBottomToast("发布服务失败");
							$scope.newServiceButtonState = true;
							$scope.$apply();
						})
				}else{
					ToastService.showBottomToast("解析地址出错");
					$scope.newServiceButtonState = true;
					$scope.$apply();
				}
			});
		};

		$scope.selectBasicLabel = function(service, basicLabel, $event){
			service.basicLabel = basicLabel;
			service.serviceLabel = basicLabel.serviceLabel[0];
			service.thirdLabel = service.serviceLabel.thirdLabel[0];
			$('#publish-triangle1').css('top', $($event.target).position().top);
			$('#publish-triangle2').css('top', 2);
			var label_column2 = $('#label-column-list2');
			label_column2.css('height','auto').ready(function(){
				if($($event.target).position().top > label_column2.height()){
					label_column2.css('height', $($event.target).position().top + 25)
				}
			})
		};

		$scope.selectServiceLabel = function(service, serviceLabel, $event) {
			service.serviceLabel = serviceLabel;
			service.thirdLabel = service.serviceLabel.thirdLabel[0];
			$('#publish-triangle2').css('top', $($event.target).position().top);
			var label_column3 = $('#label-column-list3');
			label_column3.css('height','auto').ready(function(){
				if($($event.target).position().top > label_column3.height()){
					label_column3.css('height', $($event.target).position().top + 25)
				}
			})
		};


		$scope.deletImgFromList = function(list, $index, $event){
			$event.stopPropagation();
			list.splice($index, 1);
		};
		$scope.loginUser = UserService.getCurrentUser();
	})