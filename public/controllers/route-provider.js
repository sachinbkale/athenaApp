/**
 * New node file
 */
 weatherApp.config(function($routeProvider){
	 $routeProvider.
	 when('/', {
		 	templateUrl :'partials/city.htm',
		 	controller : 'cityController'
	 	}	 
	 ).when('/forecast', {
		 	templateUrl : 'partials/forecast.htm', 
		 	controller : 'forecastController'
	 	}
	 ).when('/forecast/:days', {
	 		templateUrl : 'partials/forecast.htm', 
	 		controller : 'forecastController'
		}
	 ).when('/oauth', {
		 	templateUrl : 'partials/oauth.htm', 
		 	controller : 'forecastController'
	 	}
	 ).when('/login', {
	 		templateUrl : 'partials/login.htm', 
	 		controller : 'userController'
		}
	 ).when('/login/:newuser', {
	 		templateUrl : 'partials/register.htm', 
	 		controller : 'userController'
		}
	 ).when('/services/:username', {
	 		templateUrl : 'partials/services.htm', 
	 		controller : 'serviceController'
		}
	 ).when('/provider/:username', {
	 		templateUrl : 'partials/provider.htm', 
	 		controller : 'serviceController'
		}
	 ).when('/authorize', {
             templateUrl : 'partials/authorize.htm', 
             controller : 'serviceController'
         }
     ).when('/authorize/:username', {
	 		templateUrl : 'partials/authorize.htm', 
	 		controller : 'serviceController'
		}
	 ).when('/accesstoken', {
	 		templateUrl : 'partials/accesstoken.htm', 
	 		controller : 'serviceController'
		}
	 ).when('/accesstoken/:username', {
	 		templateUrl : 'partials/accesstoken.htm', 
	 		controller : 'serviceController'
		}
	 ).when('/tokenverify', {
	 		templateUrl : 'partials/tokenverify.htm', 
	 		controller : 'serviceController'
		}
	 ).when('/tokenverify/:username', {
	 		templateUrl : 'partials/tokenverify.htm', 
	 		controller : 'serviceController'
		}
	 );
	 
 });