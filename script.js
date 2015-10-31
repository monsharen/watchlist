var movieApp = angular.module('movieApp', ["ngAlertify"]);

movieApp.controller('MovieController', ['$scope', '$http', '$location', 'alertify', 'omdbService', 'dropboxService', 'authService', 'searchService', 
	function($scope, $http, $location, alertify, omdbService, dropboxService, authService, searchService) {

	var ctrl = this;
	this.$scope = $scope;
	this.trailerPlaying = false;
	this.searchResults = [];
	this.searchQuery = "";

	this.authenticationToken = "";
	this.loadingIndicators = 0;
	this.currentlySelectedList = 0;
	this.allLists = [];

	this.captureKeyPress = function(keyId) {
		if (keyId === 27) {
			ctrl.clearSearch();
		}
	};

	this.addMovie = function(movie) {
		console.log("adding movie");
		console.log(movie);
		ctrl.showLoading();
		
		ctrl.clearSearch();

		omdbService.getFullMovieDetails(movie.imdbID, 
			function(fullMovie) {
				ctrl.allLists[ctrl.currentlySelectedList].movies.push(fullMovie);
				ctrl.upload();
			},
			function(error) {
				alertify.error("Failed to retrieve full movie details from OMDB.");
			},
			function() {
				ctrl.hideLoading();
			}
		);
	};

	this.removeMovie = function(movie) {
		var i = ctrl.allLists[ctrl.currentlySelectedList].movies.indexOf(movie);

		if (!confirm('Are you sure you wish to delete "' + movie.Title + '"?')) {
			return;
		}

		console.log("found movie at pos " + i);
		if(i == -1) {
			console.log("failed to find movie in database. aborting");
			return;
		}

		ctrl.allLists[ctrl.currentlySelectedList].movies.splice(i, 1);
		ctrl.upload();

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

	this.clearSearch = function() {
		this.searchQuery = "";
		this.searchResults = [];
	};

	this.createNewList = function() {
		var name = prompt("Please enter a name for this list", "Movie List");
		if (name != null) {
			var newList = dropboxService.getNewList(name);
		    ctrl.allLists.push(newList);
		    ctrl.upload();
		}
	};

	this.renameList = function(index) {
		var list = ctrl.allLists[index];

		if (!list) {
			console.log("could not find list with index " + index);
			return;
		}

		var name = prompt("Enter a new name for your list", list.name);
		if (name != null) {
			list.name = name;
		    ctrl.upload();
		}
	};

	this.deleteList = function() {
		var list = ctrl.allLists[ctrl.currentlySelectedList];

		if (!list) {
			console.log("could not find list with index " + ctrl.currentlySelectedList);
			return;
		}

		if (!confirm('Are you sure you wish to delete the list "' + list.name + '"?')) {
			return;
		}

		console.log("removing list with index " + ctrl.currentlySelectedList);
		ctrl.allLists.splice(ctrl.currentlySelectedList, 1);

		if (ctrl.allLists.length == 0) {
			ctrl.allLists = dropboxService.getEmptyFile();
		}

		ctrl.upload();
		ctrl.currentlySelectedList = 0;
	};

	this.search = function() {
		ctrl.showLoading();
		searchService.search(ctrl.searchQuery, 
			function(results) {
				console.log("search query '" + ctrl.searchQuery + "' yielded " + results.length + " results");
				console.log(results);
				ctrl.searchResults = results;
			},
			function(error) {
				console.log("search failed");
				console.log(error);
				alertify.log("Search failed: " + error);
			},
			function() {
				ctrl.hideLoading();
			}
		);
	}

	this.showLoading = function() {
		ctrl.loadingIndicators++;
		console.log("showLoading. at " + ctrl.loadingIndicators);
	};

	this.hideLoading = function() {
		ctrl.loadingIndicators--;
		console.log("hideLoading. at " + ctrl.loadingIndicators);
	}

	this.refresh = function() {

		ctrl.showLoading();
		
		dropboxService.getData(ctrl.authenticationToken,
			function(data) {
				ctrl.allLists = data;
				ctrl.currentlySelectedList = 0;
			},
			function(error) {
				console.log("request failed: ");
				console.log(error);

				if ((error.status && error.status == 404) && (error.statusText && error.statusText == 'Not Found')) {
					console.log("data file do no yet exist. creating empty list");
					ctrl.allLists = dropboxService.getEmptyFile();
					console.log(ctrl.allLists);
					alertify.success("Hello there! A new file have been created on your dropbox account containing all of your data. It will automatically get updated when you make changes to your lists.");
				} else {
					alertify.error("Failed to load file from Dropbox account: " + error);
				}
			},
			function() {
				ctrl.hideLoading();
			}
		);
	};

	this.upload = function() {
		ctrl.showLoading();
		
		dropboxService.upload(ctrl.authenticationToken, ctrl.allLists,  
			function(response) {
				console.log("upload successful");
				console.log(response);
				alertify.success("Changes saved.");
			},
			function(error) {
				console.log("request failed: ");
				console.log(error);
				alertify.error("Failed to save changes to Dropbox: " + error);
			},
			function() {
				ctrl.hideLoading();
			}
		);
	};

	this.login = function() {
		authService.authenticate();
	};

	authService.isUserAuthenticated(
		function (token) {
			console.log("user is authenticated");
			ctrl.authenticationToken = token;
			ctrl.refresh();
		},
		function () {
			console.log("user is not authenticated");
		}
	);
	
}]);