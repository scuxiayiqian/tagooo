/**
 * Created by kubenetes on 2018/1/16.
 */
angular.module('starter.controllers')
	.controller('SearchCtrl', function($scope, $timeout, $state, $rootScope, UserService, $cordovaInAppBrowser, SearchService, $cordovaToast, $ionicScrollDelegate) {

		$scope.$on("$ionicView.afterEnter", function(event, data){
			// handle event
		});

		$scope.labels = savedLabels;

		$scope.showMenu = {
			'flag': false
		};

		$scope.showSearchLabel = {
			'flag': true
		}

		$rootScope.position = new AMap.LngLat(116.397428, 39.90923);

		SearchService.getAllLabels()
			.success(function(data){
				$scope.labels = data;
			});

		//Deprecated
		$scope.searchByLabel = function(serviceId){
			SearchService.searchByLabel(serviceId)
				.success(function(data){
					$rootScope.isSearchAddress = false;
					var geolocation = new AMap.Geolocation({
						enableHighAccuracy: true,//是否使用高精度定位，默认:true
						timeout: 10000                //超过10秒后停止定位，默认：无穷大
					});
					geolocation.getCurrentPosition();
					AMap.event.addListener(geolocation, 'complete', function (data) {
						$rootScope.position = data.position
					})
					var temp = {};
					for(i in data){
						if(!temp.hasOwnProperty(data[i].serviceLabelId)){
							temp[data[i].serviceLabelId] = [];
						}
						data[i].distance = $rootScope.position.distance([data[i].longitude, data[i].latitude]);
						temp[data[i].serviceLabelId].push(data[i]);
					}
					$rootScope.searchResults = [];
					for(i in temp){
						$rootScope.searchResults.push({
							'label': temp[i][0].serviceLabelName,
							'results': temp[i]
						})
					}
					$state.go('tab.searchresult');
				})
				.error(function(error){
					$cordovaToast.showShortBottom("网络错误,搜索失败");
				})
		}

		$scope.searchWord = "";
		$scope.searchByWord = function(){
			return SearchService.searchByWord($scope.searchWord)
				.success(function(data){
					$rootScope.isSearchAddress = false;
					if($rootScope.position == undefined) {
						var geolocation = new AMap.Geolocation({
							enableHighAccuracy: true,//是否使用高精度定位，默认:true
							timeout: 10000                //超过10秒后停止定位，默认：无穷大
						});
						geolocation.getCurrentPosition();
						AMap.event.addListener(geolocation, 'complete', function (data) {
							$rootScope.position = data.position
							console.log('$rootScope.position', $rootScope.position)
						})
					}
					console.log('word-search', data);
					var temp = {};
					for(i in data){
						if(!temp.hasOwnProperty(data[i].serviceLabelId)){
							temp[data[i].serviceLabelId] = [];
						}
						data[i].distance = $rootScope.position.distance([data[i].longitude, data[i].latitude]);
						temp[data[i].serviceLabelId].push(data[i]);
					}
					$rootScope.searchResults = [];
					for(i in temp){
						$rootScope.searchResults.push({
							'label': temp[i][0].serviceLabelName,
							'results': temp[i]
						})
					}
					$state.go('tab.searchresult');
				})
				.error(function(error){
					$cordovaToast.showShortBottom("网络错误,搜索失败");
				})
		}


		//Deprecated
		$scope.searchByPosition = function(){
			var geocoder = new AMap.Geocoder({
				radius: 500 //范围，默认：500
			});
			$rootScope.searchAddress = $scope.searchAddress;
			$rootScope.isSearchAddress = true;
			//地理编码,返回地理编码结果
			geocoder.getLocation($scope.searchAddress, function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
					var geocode = result.geocodes;
					$scope.searchPosition = {
						'longitude': geocode[0].location.getLng(),
						'latitude': geocode[0].location.getLat()
					};
					console.log('searchPosition', $scope.searchPosition);
					SearchService.searchByPosition($scope.searchPosition.longitude, $scope.searchPosition.latitude)
						.success(function(data){

							var geolocation = new AMap.Geolocation({
								enableHighAccuracy: true,//是否使用高精度定位，默认:true
								timeout: 10000                //超过10秒后停止定位，默认：无穷大
							});
							geolocation.getCurrentPosition();
							AMap.event.addListener(geolocation, 'complete', function (data) {
								$rootScope.position = data.position
							});
							var temp = {};
							for(i in data){
								if(!temp.hasOwnProperty(data[i].serviceLabelId)){
									temp[data[i].serviceLabelId] = [];
								}
								data[i].distance = $rootScope.position.distance([data[i].longitude, data[i].latitude]);
								temp[data[i].serviceLabelId].push(data[i]);
							}
							$rootScope.searchResults = [];
							for(i in temp){
								$rootScope.searchResults.push({
									'label': temp[i][0].serviceLabelName,
									'results': temp[i]
								})
							}
							$state.go('tab.searchresult');
						})
				}
			});
		};

		$scope.searchPosition = {
			'address': ""
		};
		$scope.searchByLabelAndPosition = function(thirdLabel){
			if($scope.searchPosition.address == "" || $scope.searchPosition.address == undefined){
				$cordovaToast.showShortBottom("搜索地址不能为空");
				return;
			}
			var geocoder = new AMap.Geocoder({
				radius: 500 //范围，默认：500
			});
			//地理编码,返回地理编码结果
			console.log($scope.searchPosition.address);
			geocoder.getLocation($scope.searchPosition.address, function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
					var geocode = result.geocodes;
					var longitude = geocode[0].location.getLng();
					var latitude = geocode[0].location.getLat();
					SearchService.searchByLabelAndPosition(thirdLabel.id,longitude,latitude)
						.success(function(data){
							$rootScope.searchResultPosition.address = angular.copy($scope.searchPosition.address);
							$rootScope.searchResultPosition.coordinate = angular.copy(geocode[0].location);
							var temp = {};
							for(i in data){
								if(!temp.hasOwnProperty(data[i].serviceLabelId)){
									temp[data[i].serviceLabelId] = [];
								}
								data[i].distance = $rootScope.searchResultPosition.coordinate.distance([data[i].longitude, data[i].latitude]);
								temp[data[i].serviceLabelId].push(data[i]);
							}
							$rootScope.searchResults = [];
							for(i in temp){
								$rootScope.searchResults.push({
									'label': temp[i][0].serviceLabelName,
									'results': temp[i]
								})
							}
							$state.go('tab.searchresult');
						})
				}
			})
		};

		var geolocation = new AMap.Geolocation({
			enableHighAccuracy: false,//是否使用高精度定位，默认:true
			timeout: 10000,          //超过10秒后停止定位，默认：无穷大
		});
		geolocation.getCurrentPosition();
		AMap.event.addListener(geolocation, 'complete', function (data) {
			$rootScope.position = data.position;
			$rootScope.currentPosition.coordinate = data.position;
			$rootScope.currentPosition.address = data.formattedAddress;
			$scope.searchPosition.address = data.formattedAddress;
			$scope.$digest();
		});

		AMap.event.addListener(geolocation, 'error', function(err){
			console.log(err);
		});


		//三级服务弹出框
		$scope.showPopupLabels = false;
		$scope.getElementPosition = function($event, serviceLabel){
			var window = $("#float-window");
			var form = $("#typeSearchForm");
			if(serviceLabel.id == $scope.selectSvcId){
				$scope.selectSvcId = undefined;
				$scope.showPopupLabels = false;
				window.hide();
				form.css('height', 'auto');
				return;
			}
			$scope.thirdLabel = serviceLabel.thirdLabel;
			window.show();
			$scope.selectSvcId = serviceLabel.id;
			var rect = $event.target.getBoundingClientRect();

			window.ready(function(){
				form.css('height', 'auto');
				var formRect = form[0].getBoundingClientRect();
				var positionY = rect.top + rect.height + 15 - formRect.top;
				window.css('top', positionY);
				var windowRect = window[0].getBoundingClientRect();

				if(windowRect.bottom > formRect.bottom){
					console.log(formRect.height + windowRect.bottom - formRect.bottom + 3);
					form.css('height', formRect.height + windowRect.bottom - formRect.bottom);
				}
				else{
					form.css('height', 'auto');
				}

				var marginLeft = rect.left - windowRect.left + rect.width / 2 - 15;
				$("div.triangle").css('margin-left', marginLeft);

			})

		};

		//$scope.onScroll = function(){
		//	var scrollPosition = $ionicScrollDelegate.$getByHandle('search-scroll').getScrollPosition().top;
		//	var content = $("ion-content");
		//	var scrollHeight = content[0].scrollHeight;
		//	var height = content[0].clientHeight;
		//	if(height >= scrollHeight || scrollHeight-height <= scrollPosition){
		//		$("img.more").hide();
		//	}
		//	else{
		//		$("img.more").show();
		//	}
		//};

	})