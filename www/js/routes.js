angular.module('starter.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // .state('login', {
    //   url: '/login',
    //   templateUrl: 'templates/login.html',
    //   controller: 'LoginCtrl'
    // })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html',
      controller: 'AppCtrl'
    })

    // Each tab has its own nav history stack:

    .state('tab.search', {
      url: '/search',
	    cache: false,
      views: {
        'tab-search': {
          templateUrl: 'templates/tab-search.html',
          controller: 'SearchCtrl'
        }
      }
    })

    .state('tab.searchresult', {
            // url: '/messageDetail/:messageId',
        url: '/searchresult',
	    cache: false,
        views: {
          'tab-search-result': {
            templateUrl: "templates/tab-search-result.html",
            controller: "SearchResultCtrl"
          }
        } 
    })

    .state('tab.follow', {
        url: '/follow',
	    cache: false,
        views: {
          'tab-follow': {
            templateUrl: 'templates/tab-follow.html',
            controller: 'FollowCtrl'
          }
        }
      })

    .state('tab.chat-detail', {
      url: '/chatDetail',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

    .state('tab.publish', {
      url: '/publish',
	    cache: false,
      views: {
        'tab-publish': {
          templateUrl: 'templates/tab-publish.html',
          controller: 'PublishCtrl'
        }
      }
    })

    .state('tab.messageDetail', {
      url: '/messageDetail/:messageId',
      views: {
        'tab-publish': {
          templateUrl: "templates/message-detail.html",
          controller: "messageDetailCtrl"
        }
      }
    })



  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/search');

});