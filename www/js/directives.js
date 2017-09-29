angular.module('starter.directives', [])

	.filter('distance', function(){
		return function(input, currentPosition){
			var distance = currentPosition.distance([input.longitude, input.latitude]);
			if(distance > 1000){
				return (distance / 1000.0).toFixed(2) + '千米'
			}
			else{
				return distance.toFixed(2) + '米'
			}
		}
	})

	.filter('sortByDistance', function($filter){
		return function(input, currentPosition){
			for(var i = 0; i < input.length; i++){
				input[i].distance = currentPosition.distance([input[i].longitude, input[i].latitude]);
			}
			return $filter('orderBy')(input, 'distance', false);
		}
	})

	.filter('getServiceConversations', function(){
		return function(input, serviceId){
			var result = [];
			for(var i = 0; i < input.length; i++){
				if(input[i]._attributes.serviceId == serviceId){
					result.push(input[i]);
				}
			}
			return result;
		}
	})

	.filter('getConversationName', function(){
		return function(conversation, userName){
			for(var i = 0; i < conversation.members.length; i++){
				if(conversation.members[i] != userName && conversation.members[i] != conversation._attributes.serviceId){
					return conversation.members[i];
				}
			}
		}
	})

	.filter('getMessageTime', function($filter){
		return function(input){
			var date = new Date(input);
			return $filter('date')(date, "yyyy-MM-dd");
		}
	})

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

  .directive('iconSwitcher', function(SearchService) {
    return {
      restrict : 'A',
      
      link : function(scope, elem, attrs) {
        
        var currentState = true;
        
        elem.on('click', function() {
          console.log('You clicked me!');
          
          if(currentState === true) {
            console.log('It is on!');
            SearchService.on();
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
  }])
	.directive('getSvcPic', function($http, baseUrl, port){
		return {
			replace: false,
			scope:{
				'picId': '@'
			},
			link: function(scope, ele, attr, controller){
				$http({
					url: baseUrl + port + '/service/getpicture?id=' + scope.picId,
					method: 'GET',
					crossDomain: true
				}).success(function(data){
					attr.$set('src', data);
				})
			}
		}
	})

	.directive('getPosition', function(){
		return {
			replace: false,
			scope:{
				'longitude': '@',
				'latitude': '@'
			},
			restrict : 'A',
			link: function(scope, ele, attr){
				ele[0].innerHTML = "定位中";
				var geocoder = new AMap.Geocoder({
					radius: 1000
				});
				geocoder.getAddress([scope.longitude, scope.latitude], function(status, result) {
					if (status === 'complete' && result.info === 'OK') {
						ele[0].innerHTML = result.regeocode.formattedAddress;
					}
					else{
						ele[0].innerHTML = '获取地址失败,经度' + scope.longitude + ' 纬度' + scope.latitude;
					}
				});
			}
		}
	});


