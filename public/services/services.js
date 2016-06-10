/**
 * New node file
 */
 weatherApp.service('forecastService', function(){

	 var self = this;
	 
	 this.city = 'London';
	 
	 this.getCity = function() {
		 return self.city;
	 }

 });

 weatherApp.service('userService', function(){
	 
	 var self = this;
	 this.user = null;
	 
	 this.setUser = function(name, isloggedIn) {
		 self.user = {
			username : name,
			isLoggedIn : isloggedIn
		 };
	 }
	 
	 this.getUser = function() {
		 if ((typeof self.user !== 'undefined') && (self.user!==null))
			 return self.user.username;
	 }	 
 });
 
 weatherApp.service('weatherService', ['$resource', function($resource){
	 
	 this.getWeather = function(city, days) {
	 	 var weatherAPI = $resource('http://api.openweathermap.org/data/2.5/forecast/daily?APPID=8e831e695bccfc9b49084945f85219b9', 
	 			 { callback: "JSON_CALLBACK"},
	 			 { get : { method : 'JSONP'}}
	 	 );		 	 	 
	 	 return weatherAPI.get({q : city, cnt : days});	 
	 }
}]);
 
 
 weatherApp.service('oAuthService', ['$resource', function($resource){
	 
	 this.registerOAuthClient = function(
			 appid, name, description,
			 url, redirectUrl, registrationType,
			 secret, icon, type
			 ) 
		{
		 	var registerCLientAPI = $resource('http://localhost:8090/api/register', 
	 			 { callback: "JSON_CALLBACK"},
	 			 { post : { method : 'JSONP'}}
	 	 );		 	 	 
	 	 return registerCLientAPI.post({
	 		appid : appid, 
	 		name : name,
	 		description : description,
	 		url : url,
	 		redirectUrl : '',
	 		registrationType : 'push',
	 		secret : secret,
	 		icon : icon,
	 		type : 'push'
	 	});	 
	 }
}]); 