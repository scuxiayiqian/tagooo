angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaCamera, $cordovaActionSheet, $ionicHistory) {

  // 解决tab切换时nav返回按钮消失的问题
  $scope.onTabSelected = function(){
    console.log('onTabSelected');
    $ionicHistory.clearHistory();
  };

  $scope.onTabDeselected = function(){
    console.log('onTabDeselected');
    $ionicHistory.clearHistory();
  };  

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  // $scope.loginData = {};
  // $scope.loginData = $localStorage.getObject('userinfo', '{}');

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

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    // $localStorage.storeObject('userinfo', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.reservation = {};

  // Create the reserve modal that we will use later
  $ionicModal.fromTemplateUrl('templates/reserve.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.reserveform = modal;
  });

  // Triggered in the reserve modal to close it
  $scope.closeReserve = function() {
    $scope.reserveform.hide();
  };

  $scope.profileSrc = "img/noprofile.png";
  // Open the reserve modal
  $scope.reserve = function() {
    $scope.reserveform.show();
  };

  // Perform the reserve action when the user submits the reserve form
  $scope.doReserve = function() {
    console.log('Doing reservation', $scope.reservation);

    // Simulate a reservation delay. Remove this and replace with your reservation
    // code if using a server system
    $timeout(function() {
      $scope.closeReserve();
    }, 1000);
  };

  // 上传头像
  $scope.openPicChooser = function() {
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
        quality: 80,                                            //相片质量0-100
        destinationType: Camera.DestinationType.DATA_URL,        //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
        sourceType: imageSource,             //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
        allowEdit: true,                                        //在选择之前允许修改截图
        encodingType:Camera.EncodingType.JPEG,                   //保存的图片格式： JPEG = 0, PNG = 1
        targetWidth: 200,                                        //照片宽度
        targetHeight: 200,                                       //照片高度
        mediaType:0,                                             //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
        cameraDirection:0                                      //枪后摄像头类型：Back= 0,Front-facing = 1
      };

      $cordovaCamera.getPicture(cameraOptions).then(function(imageData) {
        
        $scope.profileSrc = 'data:image/jpeg;base64,' + imageData;

      }, function(err) {
        // error
        console.log("get pic err");
      });
    });
  };
})

.controller('DashCtrl', ['$scope', '$timeout', '$state', '$rootScope', 
    function($scope, $timeout, $state, $rootScope) {

    $scope.typeSearch = {};
    $scope.typeSearch.cartype = '小车';
    // 分类搜索待选项
    $scope.cartype = ['小车', '卡车', '摩托车'];
    $scope.level = ['认证教练', '非认证教练', '陪练'];
    $scope.language = ['国语', '英语', '粤语', '印度语', '菲语', '韩语', '日语'];
    $scope.gender = ['男', '女'];

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
    }
  }
])

.controller('ChatsCtrl', function($scope, Chats, $state) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $state) {
  
  // 强制显示nav back btn
  // $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
  //   viewData.enableBack = true;
  // }); 

  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('PublishCtrl', function($scope, $state, $ionicPopup, localStorageService, messageService) {
  
  // copied from ionic wechat
  $scope.messages = messageService.getAllMessages();
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
})

.controller('messageDetailCtrl', ['$scope', '$stateParams',
  'messageService', '$ionicScrollDelegate', '$timeout',
  function($scope, $stateParams, messageService, $ionicScrollDelegate, $timeout) {
    var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
    // console.log("enter");
    $scope.doRefresh = function() {
        // console.log("ok");
      $scope.messageNum += 5;
      $timeout(function() {
          $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
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
      $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
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

.controller('SearchResultCtrl', function($scope, $state, Chats, $cordovaToast) {
  // $ionicTabsDelegate.showBar(false);

  $scope.chats = Chats.all();
  console.log('search result');

  $scope.follow = function() {
    console.log("incongruous");
    
    $cordovaToast.showShortBottom('关注成功').then(function(success) {
      // success
    }, function (error) {
      // error
    });
  };
});
