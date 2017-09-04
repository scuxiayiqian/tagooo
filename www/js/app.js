// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
// angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

angular.module('starter', ['ionic', 'starter.controllers', 'starter.routes', 
  'starter.services', 'starter.directives', 'baiduMap', 'ngCordova', 'ngAnimate'])

.constant('baseUrl', 'http://202.120.40.177:')

.constant('port', '22201')

.config(function($ionicConfigProvider){
  //$ionicConfigProvider.views.maxCache(0);
  //$ionicConfigProvider.backButton.icon("ion-chevron-left");
  $ionicConfigProvider.tabs.style('standard'); // Tab风格
  $ionicConfigProvider.tabs.position('bottom'); // Tab位置
  $ionicConfigProvider.navBar.alignTitle('center'); // 标题位置
  $ionicConfigProvider.navBar.positionPrimaryButtons('left'); // 主要操作按钮位置
  $ionicConfigProvider.navBar.positionSecondaryButtons('right'); //次要操作按钮位置

})

.run(function($ionicPlatform, $ionicHistory, $rootScope, ToastService) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $ionicPlatform.registerBackButtonAction(function(e) {
    // e.preventDefault();
    // //console.log("registerBackButtonAction");
    // //console.log($ionicHistory.backView());
    // if($ionicHistory.backView()) {
    //   $ionicHistory.goBack();
    // }
    // return false;
    if ($rootScope.backButtonPressedOnceToExit) {
      ionic.Platform.exitApp();
    }

    else if ($ionicHistory.backView()) {
      $ionicHistory.goBack();
    }
    else {
      $rootScope.backButtonPressedOnceToExit = true;
      setTimeout(function(){
        $rootScope.backButtonPressedOnceToExit = false;
      },2000);
    }
    e.preventDefault();
    return false;

  }, 101);
})




