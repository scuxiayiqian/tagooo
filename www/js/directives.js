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
  });  