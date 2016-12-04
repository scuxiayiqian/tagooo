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

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.searchresult', {
            // url: '/messageDetail/:messageId',
        url: '/searchresult',
        views: {
          'tab-dash': {
            templateUrl: "templates/search-result.html",
            controller: "SearchResultCtrl"
          }
        } 
    })

    .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
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

    // 跳转到该页面用 state.go(searchresult);
    // .state('searchresult', {
    //         // url: '/messageDetail/:messageId',
    //     url: '/searchresults',
    //     templateUrl: "templates/search-result.html",
    //     controller: "SearchResultCtrl"
    // })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});