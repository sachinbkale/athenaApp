/**
 * New node file
 */
weatherApp.controller('navController', ['$rootScope', '$routeParams', '$scope', 'userService', 
                                        function($rootScope, $routeParams, $scope, userService) 
{	
	 $scope.username = userService.getUser();		 
		 
 
	 	$scope.servicemenu = 
		{
			top : {
					name : 'Login',
					url : '#/login'
			},
			sub : []
		 }		 			 
	 
	 $rootScope.$on("loadMenu", function(user, loggedIn){
         $scope.loadLoginMenu(user, loggedIn);
      });

      $scope.loadLoginMenu = function(event, data) {
          // task
	 	$scope.servicemenu = 
		{
			top : {
					name : 'Services',
					url : '#/services'+  data.username
			},		 
			sub : [
			       { name : 'Provider', url : '#/provider/' +  data.username },
			       { name : 'Authorize', url : '#/authorize/'  +  data.username},
			       { name : 'Access Token', url : '#/accesstoken/'  +  data.username},
			       { name : 'Token Verify', url : '#/tokenverify/'  +  data.username}
			]
		 }    	  
      }
	 
}]);

 weatherApp.controller('cityController', ['$scope', '$log', '$location', 'forecastService',
 
  function($scope, $log, $location, forecastService) {
	 	 
	 forecastService.city = $scope.city ;
	 
	 $scope.$watch('city' , function(newValue, oldValue) {
		 
		 forecastService.city = newValue ;
	 
	 });
	 
	 $scope.submit = function() {
		 $location.path('/forecast');
	 }
	 
  }]);
 
 weatherApp.controller('forecastController', ['$scope', '$log', '$routeParams', 'forecastService', 'weatherService',
                                        
  function($scope, $log, $routeParams, forecastService, weatherService) {
 	 
 	 $scope.city = forecastService.getCity();
 	 
 	 $scope.days = $routeParams.days || '2';
 	 
 	 $scope.weatherResult = weatherService.getWeather($scope.city, $scope.days);	 
 	 
 	 $scope.toFarenheit = function (degKelvin) {
 		 
 		 return Math.round((1.8*(degKelvin-273)) + 32);
 	 }
 	 
 	$scope.toDate = function (dt) {
		 
		 return new Date(dt*1000);
	 }
  }]);
 
 
 weatherApp.controller('userController', ['$rootScope','$scope', '$http', '$log', '$location', '$routeParams', 'userService',

 function($rootScope, $scope, $http, $log, $location, $routeParams, userService) {
	 
	 $scope.$error = null;
	 
	 $scope.submit = function (user, resultVarName)
	 {
		 if (resultVarName.$name === 'loginForm') {

			 $http.post("/login", user)
		     .success(function (data, status, headers, user) {
		    	 
		    	 $scope.$watch('username' , function (newValue, oldValue) {		 	   			    		 
		    		 userService.setUser(data.user.username, true);
		    	 });	    	 
		    	 
		         $rootScope.$emit("loadMenu", {username : data.user.username, loggedIn:true});
		    	 
		         $scope.services = data.user.services;
		         
		    	 $location.path('/services/' +data.user.username);
		    	 
		     }).error(function (data, status, headers, user) {
		    	 
		    	 if (status===404)
		    	 {
		    		$scope.$error = { 
			 				empty : true
					};
		    		 //$scope.$error.empty = true;
		    	 }
		    	 else if (status===410) {
		    		/*
		    		$scope.$error = { 
			 				user : {unauth : true}
					};*/
		    		 $scope.$error = {
		    				 unauth : true
		    		 }
		    	 }
		    });				 
		 }
		 else if (resultVarName.$name === 'registerForm') 
		 {			 
			 if(user.username == '') {
				 user.username.$error.required = true;
                return;
	          }
			
			 $http.post("/users", user)
		     .success(function (data, status, headers, user) {
		    	 		    		    	 
		    	 $location.path('/services/' + data.username);		    	 
		     }).error(function (data, status, headers, user) {
		    	 
		    	 if ((status===501) || (status===500))
		    		 $scope.$error = { 
    			 				duplicate : true
    	 				};
		    });
		 }		 
	 };
	 
  }]);

 
 weatherApp.controller('serviceController', ['$scope', '$http', '$log', '$location', '$routeParams', 'oAuthService',

                                          function($scope, $http, $log, $location, $routeParams, oAuthService) {

	 $scope.username = $routeParams.username;
	 
	 var URL_REGEXP = /^((?:http)s?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;	 
	 
	 $scope.submit = function (user, resultVarName)
	 {
		 
		 if ($scope.username !== null) 
		 {
			 if ((resultVarName.$name === 'authorizeForm'))
			 {				 
				 $log.debug( 'redirectUri :' + user['redirectUri'] + ', secret : '+ user['secret'] + ', appId : ' + user['appId']);

				 $http.post("/authorize", user)
			     	.success(function (data, status, headers, user) {
				    	 $log.debug('status :' + status + ', json :' + JSON.stringify(data));	
				     if (status === 200) {
				    	// $location.path('/services/' + user.username); 
						 $scope.authorize = {
								 appId : user.data.appId,
								 secret : user.data.secret,
								 redirectUri : user.data.redirectUri,
								 msg : data.authorize.msg,
					    		 code : data.authorize.code,
					    		 status : data.authorize.status,
					    		 auth_code :data.authorize.auth_code,
					    		 expires_in_sec : data.authorize.expires_in_sec
				    	 };
						 $log.debug('authorize : ' + JSON.stringify($scope.authorize));
				     }
				     else {
				    	 $scope.authorizeError = data.authorize.error;
				     }
			     }).error(function (data, status, headers, user) {				    	 
				    	 $log.debug('status :' + status + ', data :' + data);
				    	 $scope.data = data;
			    });
		    	$log.debug(JSON.stringify($scope.provider));				 
			 }
			 else if ((resultVarName.$name === 'accessTokenForm'))
			 {				 
				 $http.post("/accesstoken", user)
			     	.success(function (data, status, headers, user) {
				    	 $log.debug('status :' + status + ', json :' + JSON.stringify(data));	
				     if (status === 200) {
				    	// $location.path('/services/' + user.username); 
						 $scope.accessToken = {
								 appId : user.data.appId,
								 secret : user.data.secret,
								 auth_code : user.data.auth_code,
								 msg : data.accessToken.msg,
					    		 code : data.accessToken.code,
					    		 status : data.accessToken.status,
					    		 access_token :data.accessToken.access_token,
					    		 expires_in_sec : data.accessToken.expires_in_sec
				    	 };
				     }
				     else {
				    	 $scope.accessTokenError = data.accessToken.error;
				     }
			     }).error(function (data, status, headers, user) {				    	 
				    	 $log.debug('status :' + status + ', data :' + data);
				    	 $scope.data = data;
			    });
		    	$log.debug(JSON.stringify($scope.provider));				 
			 }
			 else if ((resultVarName.$name === 'tokenVerifyForm'))
			 {				 
				 $http.post("/tokenverify", user)
			     	.success(function (data, status, headers, user) {
				    	 $log.debug('status :' + status + ', json :' + JSON.stringify(data));	
				     if (status === 200) {
				    	// $location.path('/services/' + user.username); 
						 $scope.tokenVerify = {
								 access_token :data.tokenverify.access_token,
					    		 client_redirect :data.tokenverify.client_redirect,
					    		 code : data.tokenverify.code,
					    		 status : data.tokenverify.status,
					    		 msg : data.tokenverify.msg
				    	 };
				     }
				     else {
				    	 $scope.tokenverifyError = data.tokenverify.error;
				     }
			     }).error(function (data, status, headers, user) {				    	 
				    	 $log.debug('status :' + status + ', data :' + data);
				    	 $scope.data = data;
			    });
		    	$log.debug(JSON.stringify($scope.provider));				 
			 }			 
			 else if ((resultVarName.$name === 'providerForm') && URL_REGEXP.test(user.url)){
				 $log.debug('Proceed');
				 
				 if ((user.secret !== undefined ) && (user.secret !== 'null' ))
				 {
					 var url = user.url;
						var path = [];
						if (user.url === null) {
							//var url = "http://www.example.com/path/to/somwhere";
							var url = provider.service[0].path + user.redirectUrl;
							var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(user.url);
							var hostname = urlParts[1]; // www.example.com
							path = urlParts[2]; // /path/to/somwhere
							user.url = path[0];
							user.redirectUri = path[1];
						}			
						
					 $http.post("/providers", user)
				     	.success(function (data, status, headers, user) {
				     		
					     $scope.data = data;
					     if (status === 200) {
					    	 $location.path('/services/' + user.username);
					     }
					     else {
					    	 $scope.providerError = data.error;
					     }
				     }).error(function (data, status, headers, user) {				    	 
					    	 $scope.data = data;
				    });

					$scope.$watch('provider.secret' , function(newValue, oldValue) {
			    		 $scope.$error = { 
			    				 provider : {duplicate : false}
							};			 
					 });
				 }
				 else {

					 $http.post("/providerkey", user)
				     	.success(function (data, status, headers, user) {
	
					    	 $scope.provider = {
				    				 username : $scope.username,
						    		 name : data.service[0].name,
						    		 url : data.service[0].url,
						    		 redirectUri : data.service[0].redirectUri,
						    		 description :data.service[0].description,
						    		 secret : data.service[0].secret,
						    		 appId : data.service[0].appId
					    	 }
					    	 $log.debug(JSON.stringify($scope.provider));
				     }).error(function (data, status, headers, user) {				    	 
					    	 $log.debug('status :' + status + ', data :' + data);
					    	 if (status===501)
					    		 $scope.$error = { 
					    			 provider : {duplicate : true}
			 	 				};
				    });
					 $scope.$watch('provider.secret' , function(newValue, oldValue) {
			    		 $scope.$error = { 
			    				 provider : {duplicate : false}
							};			 
					 });					
				 }
			 }
		 }
		 else {
			 $http.get('/logout')
	            .success(function (data, status, headers, config) {
	            	$location.path('/login');
	            })			 
		 }
	 }
 }]);
 