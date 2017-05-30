angular.module('starter.services', [])

.factory('ToastService', function($cordovaToast){
    var ToastService = {};

    ToastService.showTopToast = function(toastInfo) {
        return $cordovaToast.showShortTop(toastInfo);
    };

    ToastService.showCenterToast = function(toastInfo) {
        return $cordovaToast.showShortCenter(toastInfo);
    };

    ToastService.showBottomToast = function(toastInfo) {
        return $cordovaToast.showShortBottom(toastInfo);
    };

    return ToastService;
})

.factory('UserService', function($http, baseUrl, port){
    var UserService = {};
    UserService.currentUser = {};
    UserService.followedCoach = [];
    UserService.isLogin = false;
	UserService.profileUpdated = false;
    // UserService.usersProfile = "img/noprofile.png";

    UserService.setCurrentUser = function(currentUser){
        UserService.currentUser = currentUser;
    }

    UserService.getCurrentUser = function(){
        return angular.copy(UserService.currentUser);
    }

    UserService.setFollowedCoach = function(followedCoach){
        UserService.followedCoach = followedCoach;
    }

    UserService.getFollowedCoach = function(){
        return angular.copy(UserService.followedCoach);
    }

    UserService.register = function(registerInfo){
        return $http({
            method: 'POST',
            url: baseUrl + port + '/user/register',
            data: JSON.stringify(registerInfo),
            crossDomain: true,
            headers: {'Content-Type': 'application/json;charset=UTF-8'}
        });
    }

    UserService.login = function(loginInfo){
        console.log(JSON.stringify(loginInfo));
        return $http({
            method: 'POST',
            url: baseUrl + port + '/user/login',
            data: JSON.stringify(loginInfo),
            crossDomain: true,
            headers: {'Content-Type': 'application/json;charset=UTF-8'}
        });
    }

    UserService.searchAllFollows = function() {
        return $http({
            method: 'GET',
            url: baseUrl + port + '/interact/findByStudentId?studentId=' + UserService.currentUser.id,
            crossDomain: true
        })
    }

    UserService.follow = function(followPair) {
        return $http({
            method: 'POST',
            url: baseUrl + port + '/interact/follow',
            data: JSON.stringify(followPair),
            crossDomain: true,
            headers: {'Content-Type': 'application/json;charset=UTF-8'}
        })
    }

    UserService.unFollow = function(unFollowPair) {
        return $http({
            method: 'POST',
            url: baseUrl + port + '/interact/follow/remove',
            data: JSON.stringify(unFollowPair),
            crossDomain: true,
            headers: {'Content-Type': 'application/json;charset=UTF-8'}
        })
    }

	UserService.uploadPhoto = function(picture, phone){
		return $http({
			method: 'POST',
			url: baseUrl + port + '/user/uploadphoto',
			data: {
				'phone': phone + "",
				'photoImageValue': picture
			},
			crossDomain: true,
			headers: {'Content-Type': 'application/json;charset=UTF-8'}
		})
	}

    return UserService;
})

.factory('ImageService', function($http, baseUrl, port){
    var ImageService = {};

    ImageService.uploadProfile = function(imageInfo) {
        return $http({
            method: 'POST',
            url: baseUrl + port + '/student/uploadphoto',
            data: JSON.stringify(imageInfo),
            crossDomain: true,
            headers: {'Content-Type': 'application/json;charset=UTF-8'}
        });
    }

    ImageService.getProfile = function(phone) {
        return $http({
            method: 'GET',
            url: baseUrl + port + '/student/getphoto?phone=' + phone,
            crossDomain:true
            // headers: {'Content-Type': 'image/jpeg;charset=UTF-8'}
        });
    }

    return ImageService;
})

.factory('SearchService', function($http, baseUrl, port){

    var SearchService = {};

    SearchService.searchResult = [];

    SearchService.setCurrentSearchResult = function(result) {
        SearchService.searchResult = result;
    }

    SearchService.getCurrentSearchResult = function() {
        return angular.copy(SearchService.searchResult);
    };

	SearchService.getBasicLabels = function(){
		return $http({
			method: 'GET',
			url: baseUrl + port + '/service/getBasiclabel',
			crossDomain: true
		});
	};

	SearchService.getServiceLabels = function(){
		return $http({
			method: 'GET',
			url: baseUrl + port + '/service/getservicelabel',
			crossDomain: true
		});
	};

	SearchService.mergeLabels = function(basicLabels, serviceLabels){
		var temp = {};
		var result = [];
		for(item in basicLabels){
			basicLabels[item].services = [];
			temp[basicLabels[item].id] = basicLabels[item];
		}
		for(item in serviceLabels){
			temp[serviceLabels[item].basicTypeId].services.push(serviceLabels[item]);
		}
		for(item in temp){
			result.push(temp[item]);
		}
		return result;
	}

	SearchService.searchByLabel = function(serviceLabelId){
		return $http({
			method: 'GET',
			url: baseUrl + port + '/service/findbylabel?labelid=' + serviceLabelId,
			crossDomain: true
		})
	}

	SearchService.searchByWord = function(word){
		return $http({
			method: 'GET',
			url: baseUrl + port + '/service/findbyword?word=' + word,
			crossDomain: true
		})
	}

	SearchService.searchByPosition = function(longitude, latitude){
		return $http({
			method: 'GET',
			url: baseUrl + port + '/service/findbylocation?longitude=' + longitude + '&latitude=' + latitude,
			crossDomain: true
		})
	}

    SearchService.searchByType = function(searchInfo) {
        return $http({
            method: 'POST',
            url: baseUrl + port + '/coach/findcommon',
            data: JSON.stringify(searchInfo),
            crossDomain: true,
            headers: {'Content-Type': 'application/json;charset=UTF-8'}
        });
    }

    SearchService.on = function() {
        console.log("service on ");
    }

    return SearchService;
})

.factory('MyFollowsService', function($http, baseUrl, port) {
    var MyFollowsService = {};

    return MyFollowsService;
})

.factory('ServiceService', function($http, baseUrl, port){
	var ServiceService = {};

	ServiceService.publishService = function(serviceInfo){
		return $http({
			method: 'POST',
			url: baseUrl + port + '/service/publish',
			data: JSON.stringify(serviceInfo),
			crossDomain: true,
			headers: {'Content-Type': 'application/json;charset=UTF-8'}
		});
	}

	ServiceService.followService = function(serviceId, userId){
		return $http({
			method: 'POST',
			url: baseUrl + port + '/interact/follow',
			data: {
				'serviceId': serviceId,
				'userId': userId
			},
			crossDomain: true,
			headers: {'Content-Type': 'application/json;charset=UTF-8'}
		});
	}

	ServiceService.unfollowService = function(serviceId, userId){
		return $http({
			method: 'POST',
			url: baseUrl + port + '/interact/follow/remove',
			data: {
				'serviceId': serviceId,
				'userId': userId
			},
			crossDomain: true,
			headers: {'Content-Type': 'application/json;charset=UTF-8'}
		});
	}

	ServiceService.getFollowServices = function(userId){
		return $http({
			method: 'GET',
			url: baseUrl + port + '/interact/findByUserId?userId=' + userId,
			crossDomain: true
		})
	}

	return ServiceService;
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{"id":8,"name":"李明","pic":"img/adam.jpg","lastMessage":{"originalTime":"2015-11-27 06:34:55","time":"2015","timeFrome1970":1451169295000,"content":"你在干什么?","isFromeMe":false},"noReadMessages":0,"showHints":false,"isTop":0,"message":[{"isFromeMe":false,"content":"你好!","time":"2015-11-22 08:50:22"},{"isFromeMe":true,"content":"你好, 你是谁?","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"你在干什么?","time":"2015-11-27 06:34:55"},{"isFromeMe":true,"content":"知道怎么搞的吗?","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"这是一道可以测出一个人有没有商业头脑的数学题","time":"2015-11-27 06:34:55"},{"isFromeMe":false,"content":"喝咖啡对身体好吗?","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"在澳洲申请新西兰签证","time":"2015-11-27 06:34:55"},{"isFromeMe":true,"content":"说走就走的旅行","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"ok","time":"2015-11-27 06:34:55"},{"isFromeMe":true,"content":"拉玛西亚","time":"2015-11-22 08:51:02"},{"isFromeMe":true,"content":"拉玛西亚影视学院招生简章","time":"2015-11-27 06:34:55"},{"isFromeMe":true,"content":"去黑头产品排行榜","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"美国大使馆 北京","time":"2015-11-27 06:34:55"},{"isFromeMe":false,"content":"被开水烫伤怎么办?","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"谁说菜鸟不会数据分析?","time":"2015-11-27 06:34:55"},{"isFromeMe":true,"content":"谁念西风独自凉","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"被酒莫惊春睡重，赌书消得泼茶香，当时只道是寻常","time":"2015-11-27 06:34:55"}]},{"id":1,"name":"王峰","pic":"img/ben.png","lastMessage":{"originalTime":"2015-11-26 5:22:55","time":"2015","timeFrome1970":1451078575000,"content":"明天什么时候去吃饭?","isFromeMe":false},"noReadMessages":0,"showHints":false,"isTop":0,"message":[{"isFromeMe":false,"content":"你好!","time":"2015-11-22 08:50:22"},{"isFromeMe":true,"content":"你好, 你是谁?","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"明天什么时候去吃饭?","time":"2015-11-26 5:22:55"}]},{"id":7,"name":"潘敏","pic":"img/max.png","lastMessage":{"originalTime":"2015-11-22 15:34:55","time":"2015","timeFrome1970":1450769695000,"content":"我就在软件园?","isFromeMe":false},"noReadMessages":0,"showHints":false,"isTop":0,"message":[{"isFromeMe":false,"content":"你好!","time":"2015-11-22 08:50:22"},{"isFromeMe":true,"content":"你好, 你是谁?","time":"2015-11-22 08:51:02"},{"isFromeMe":false,"content":"我就在软件园?","time":"2015-11-22 15:34:55"}]},{"id":2,"name":"王振启","pic":"img/mike.png","lastMessage":{"originalTime":"2015-11-21 15:34:55","time":"2015","timeFrome1970":1450683295000,"content":"周末有什么安排?","isFromeMe":false},"noReadMessages":0,"showHints":false,"isTop":0},{"id":6,"name":"许仁杰","pic":"img/perry.png","lastMessage":{"originalTime":"2014-10-12 15:34:55","time":"2014","timeFrome1970":1415777695000,"content":"好","isFromeMe":false},"noReadMessages":0,"showHints":false,"isTop":0}];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('localStorageService', [function() {
  return {
    get: function localStorageServiceGet(key, defaultValue) {
      var stored = localStorage.getItem(key);
      try {
          stored = angular.fromJson(stored);
      } catch (error) {
          stored = null;
      }
      if (defaultValue && stored === null) {
          stored = defaultValue;
      }
      return stored;
    },
    update: function localStorageServiceUpdate(key, value) {
      if (value) {
          localStorage.setItem(key, angular.toJson(value));
      }
    },
    clear: function localStorageServiceClear(key) {
      localStorage.removeItem(key);
    }
  };
}])

.factory('messageService', ['localStorageService', 'dateService',
    function(localStorageService, dateService) {
        return {
            init: function(messages) {
                var i = 0;
                var length = 0;
                var messageID = new Array();
                var date = null;
                var messageDate = null;
                if (messages) {
                    length = messages.length;
                    for (; i < length; i++) {
                        messageDate = dateService.getMessageDate(messages[i]);
                        if(!messageDate){
                            return null;
                        }
                        date = new Date(messageDate.year, messageDate.month,
                            messageDate.day, messageDate.hour, messageDate.minute,
                            messageDate.second);
                        messages[i].lastMessage.timeFrome1970 = date.getTime();
                        messageID[i] = {
                            id: messages[i].id
                        };

                    }
                    localStorageService.update("messageID", messageID);
                    for (i = 0; i < length; i++) {
                        localStorageService.update("message_" + messages[i].id, messages[i]);
                    }
                }
            },
            getAllMessages: function() {
                var messages = new Array();
                var i = 0;
                var messageID = localStorageService.get("messageID");
                var length = 0;
                var message = null;
                if (messageID) {
                    length = messageID.length;

                    for (; i < length; i++) {
                        message = localStorageService.get("message_" + messageID[i].id);
                        if(message){
                            messages.push(message);
                        }
                    }
                    dateService.handleMessageDate(messages);
                    return messages;
                }
                return null;

            },
            getMessageById: function(id){
                return localStorageService.get("message_" + id);
            },
            getAmountMessageById: function(num, id){
                var messages = [];
                var message = localStorageService.get("message_" + id).message;
                var length = 0;
                if(num < 0 || !message) return;
                length = message.length;
                if(num < length){
                    messages = message.splice(length - num, length); 
                    return messages;  
                }else{
                    return message;
                }
            },
            updateMessage: function(message) {
                var id = 0;
                if (message) {
                    id = message.id;
                    localStorageService.update("message_" + id, message);
                }
            },
            deleteMessageId: function(id){
                var messageId = localStorageService.get("messageID");
                var length = 0;
                var i = 0;
                if(!messageId){
                    return null;
                }
                length = messageId.length;
                for(; i < length; i++){
                    if(messageId[i].id === id){
                        messageId.splice(i, 1);
                        break;
                    }
                }
                localStorageService.update("messageID", messageId);
            },
            clearMessage: function(message) {
                var id = 0;
                if (message) {
                    id = message.id;
                    localStorageService.clear("message_" + id);
                }
            }
        };
    }
])  

.factory('dateService', [function() {
    return {
        handleMessageDate: function(messages) {
            var i = 0,
                length = 0,
                messageDate = {},
                nowDate = {},
                weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                diffWeekValue = 0;
            if (messages) {
                nowDate = this.getNowDate();
                length = messages.length;
                for (i = 0; i < length; i++) {
                    messageDate = this.getMessageDate(messages[i]);
                    if(!messageDate){
                        return null;
                    }
                    if (nowDate.year - messageDate.year > 0) {
                        messages[i].lastMessage.time = messageDate.year + "";
                        continue;
                    }
                    if (nowDate.month - messageDate.month >= 0 ||
                        nowDate.day - messageDate.day > nowDate.week) {
                        messages[i].lastMessage.time = messageDate.month +
                            "月" + messageDate.day + "日";
                        continue;
                    }
                    if (nowDate.day - messageDate.day <= nowDate.week &&
                        nowDate.day - messageDate.day > 1) {
                        diffWeekValue = nowDate.week - (nowDate.day - messageDate.day);
                        messages[i].lastMessage.time = weekArray[diffWeekValue];
                        continue;
                    }
                    if (nowDate.day - messageDate.day === 1) {
                        messages[i].lastMessage.time = "昨天";
                        continue;
                    }
                    if (nowDate.day - messageDate.day === 0) {
                        messages[i].lastMessage.time = messageDate.hour + ":" + messageDate.minute;
                        continue;
                    }
                }
                // console.log(messages);
                // return messages;
            } else {
                console.log("messages is null");
                return null;
            }

        },
        getNowDate: function() {
            var nowDate = {};
            var date = new Date();
            nowDate.year = date.getFullYear();
            nowDate.month = date.getMonth();
            nowDate.day = date.getDate();
            nowDate.week = date.getDay();
            nowDate.hour = date.getHours();
            nowDate.minute = date.getMinutes();
            nowDate.second = date.getSeconds();
            return nowDate;
        },
        getMessageDate: function(message) {
            var messageDate = {};
            var messageTime = "";
            //2015-10-12 15:34:55
            var reg = /(^\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
            var result = new Array();
            if (message) {
                messageTime = message.lastMessage.originalTime;
                result = reg.exec(messageTime);
                if (!result) {
                    console.log("result is null");
                    return null;
                }
                messageDate.year = parseInt(result[1]);
                messageDate.month = parseInt(result[2]);
                messageDate.day = parseInt(result[3]);
                messageDate.hour = parseInt(result[4]);
                messageDate.minute = parseInt(result[5]);
                messageDate.second = parseInt(result[6]);
                // console.log(messageDate);
                return messageDate;
            } else {
                console.log("message is null");
                return null;
            }
        }
    };
}])
