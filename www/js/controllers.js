angular.module('starter.controllers', [])

.controller('DashCtrl', ['$scope', '$timeout', '$state', '$rootScope', 
    function($scope, $timeout, $state, $rootScope) {

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
  // $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
  //   viewData.enableBack = true;
  // }); 
  
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $state) {
  $scope.settings = {
    enableFriends: true
  };
})

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
