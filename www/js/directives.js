angular.module('starter.directives', [])
  .directive('hideTabs', function($rootScope, $ionicTabsDelegate) {
    return {
      restrict: 'A',
      link: function($scope, $el) {
        $scope.$on("$ionicView.beforeEnter", function () {
          $ionicTabsDelegate.showBar(false);
        });
        $scope.$on("$ionicView.beforeLeave", function () {
          $ionicTabsDelegate.showBar(true);
        });
      }
    };
  })

  .directive('iconSwitcher', function() {
    return {
      restrict : 'A',
      
      link : function(scope, elem, attrs) {
        
        var currentState = true;
        
        elem.on('click', function() {
          console.log('You clicked me!');
          
          if(currentState === true) {
            console.log('It is on!');
            angular.element(elem).removeClass(attrs.onIcon);
            angular.element(elem).addClass(attrs.offIcon);
          } else {
            console.log('It is off!');
            angular.element(elem).removeClass(attrs.offIcon);
            angular.element(elem).addClass(attrs.onIcon);
          }
          
          currentState = !currentState
        });        
      }
    };
  })

  // copied from ionic-wechat-master
  .directive('rjHoldActive', ['$ionicGesture', '$timeout', '$ionicBackdrop',
      function($ionicGesture, $timeout, $ionicBackdrop) {
          return {
              scope: false,
              restrict: 'A',
              replace: false,
              link: function(scope, iElm, iAttrs, controller) {
                  $ionicGesture.on("hold", function() {
                      iElm.addClass('active');
                      $timeout(function() {
                          iElm.removeClass('active');
                      }, 300);
                  }, iElm);
              }
          };
      }
  ])
  .directive('rjCloseBackDrop', [function() {
      return {
          scope: false,
          restrict: 'A',
          replace: false,
          link: function(scope, iElm, iAttrs, controller) {
              var htmlEl = angular.element(document.querySelector('html'));
              htmlEl.on("click", function(event) {
                  if (event.target.nodeName === "HTML" &&
                      scope.popup.optionsPopup &&
                      scope.popup.isPopup) {
                      scope.popup.optionsPopup.close();
                      scope.popup.isPopup = false;
                  }
              });
          }
      };
  }])
  .directive('resizeFootBar', ['$ionicScrollDelegate', function($ionicScrollDelegate){
      // Runs during compile
      return {
          replace: false,
          link: function(scope, iElm, iAttrs, controller) {
              scope.$on("taResize", function(e, ta) {
                  if (!ta) return;
                  var scroll = document.body.querySelector("#message-detail-content");
                  var scrollBar = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
                  // console.log(scroll);
                  var taHeight = ta[0].offsetHeight;
                  var newFooterHeight = taHeight + 10;
                  newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

                  iElm[0].style.height = newFooterHeight + 'px';
                  scroll.style.bottom = newFooterHeight + 'px';
                  scrollBar.scrollBottom();
              });
          }
      };
  }])
  .directive('rjPositionMiddle', ['$window', function($window){
      return{
          replace: false,
          link: function(scope, iElm, iAttrs, controller){
              var height = $window.innerHeight - 44 - 49 - iElm[0].offsetHeight;
              if (height >= 0) {
                  iElm[0].style.top = (height / 2 + 44) + 'px';
              }else{
                  iElm[0].style.top = 44 + 'px';
              }
          }
      }
  }]);


