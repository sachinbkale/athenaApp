/**
 * New node file
 */
weatherApp.directive('weatherReport', function() {
	 return {
		 restrict : 'AECM',
		 templateUrl : 'directives/html/weather-report.htm',
		 scope : {
			 weatherObject : '='
			, fnDate : '&'
			, fnFarenheit : '&'
			, dateFormat : '@'
		 },
		 replace : true
	 }
 });
 
 weatherApp.directive('dropDownMenu', function (){
	 return {		
		 restrict : 'AECM',		 
		 templateUrl : 'directives/html/drop-down-menu.htm',		 
		 scope : {			 
			 menuObject : '='			 
		 },		 
		 replace : true,
		 transclude : true,
		 link: function(scope, elem, attrs) {
		    $('ul.nav li.dropdown').hover(
				function() {
				  $(this).find('.dropdown-menu').stop(true, true).delay(5).fadeIn(50);
				}, 
				function() {
				  $(this).find('.dropdown-menu').stop(true, true).delay(5).fadeOut(50);
				}
			);
		 }
	 }
 });
 
 weatherApp.directive('validateUrl', function () {
    var URL_REGEXP = /^((?:http)s?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attrs, ctrl) {
            element.on("keyup", function () {
                var isValidUrl = URL_REGEXP.test(element.val());
                if (isValidUrl && element.hasClass('alert-danger') || element.val() == '') {
                    element.removeClass('alert-danger');
                    scope.$apply(function(){
                    	element.$pristine = true;
                    	element.$invalid = false;
                    });
                } else if (isValidUrl == false && !element.hasClass('alert-danger')) {
                    element.addClass('alert-danger');
                    scope.$apply(function(){
                    	element.$pristine = false;
                    	element.$invalid = true;
                    });
                }
            });
        }
    }
});