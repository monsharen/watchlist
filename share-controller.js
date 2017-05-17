var movieApp = angular.module('movieApp', ["ngAlertify"]);

movieApp.controller('MovieController', ['$scope', '$http', '$location', 'alertify', 'omdbService', 'dropboxService', 'authService', 'searchService', 
	function($scope, $http, $location, alertify, omdbService, dropboxService, authService, searchService) {

	var ctrl = this;
	this.$scope = $scope;
	this.trailerPlaying = false;

	this.authenticationToken = "";
	this.loadingIndicators = 0;
	this.movies = [];

	this.captureKeyPress = function(keyId) {
		if (keyId === 27) {
			ctrl.clearSearch();
		}
	};

	this.playTrailer = function(movie) {
		console.log("play trailer called");
		ctrl.closeTrailer();
		var content = '<iframe width="640" height="360" src="https://www.youtube.com/embed?listType=search&autoplay=1&list=' + movie.Title + '" frameborder="0" allowfullscreen=""></iframe>';

		ctrl.trailerPlaying = true;		
		$("#videoElement").append(content);
	}

	this.closeTrailer = function() {
		console.log("close trailer called");
		$("#videoElement").empty();
		ctrl.trailerPlaying = false;
	}

	this.showLoading = function() {
		ctrl.loadingIndicators++;
		console.log("showLoading. at " + ctrl.loadingIndicators);
	};

	this.hideLoading = function() {
		ctrl.loadingIndicators--;
		console.log("hideLoading. at " + ctrl.loadingIndicators);
	}

	this.getHashParams = function() {

	    var hashParams = {};
	    var e,
	        a = /\+/g,  // Regex for replacing addition symbol with a space
	        r = /([^&;=]+)=?([^&;]*)/g,
	        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
	        q = window.location.hash.substring(1);

	    while (e = r.exec(q))
	       hashParams[d(e[1])] = d(e[2]);

	    return hashParams;
	};

	this.refresh = function() {

		ctrl.showLoading();
		var params = ctrl.getHashParams();
		var data = params["/data"];
		var decoded = atob(data);
		ctrl.movies = JSON.parse(decoded);
		console.log(ctrl.movies[0]);		
		ctrl.hideLoading();
	};

	ctrl.refresh();
	
}]);