var movieApp = angular.module('movieApp', ["ngAlertify"]);

movieApp.controller('MovieController', ['$scope', '$http', '$location', 'alertify', 'omdbService', 'dropboxService', 'authService', 'searchService', 
	function($scope, $http, $location, alertify, omdbService, dropboxService, authService, searchService) {

	var ctrl = this;
	this.$scope = $scope;
	this.trailerPlaying = false;
	this.searchResults = [];
	this.searchQuery = "";
	this.moveAction = null;

	this.authenticationToken = "";
	this.loadingIndicators = 0;
	this.currentlySelectedList = 0;
	this.allLists = [];

	this.captureKeyPress = function(keyId) {
		if (keyId === 27) {
			ctrl.clearSearch();
			ctrl.moveAction = null;
		}
	};

	this.info = function() {
		alertify.alert("To search type the name of a movie, or use the pattern imdb:[imdb id] to find exact matches");
	};

	this.addMovie = function(movie) {
		console.log("adding movie");
		console.log(movie);
		ctrl.showLoading();
		
		ctrl.clearSearch();

		omdbService.getFullMovieDetails(movie.imdbID, 
			function(fullMovie) {
				ctrl.addMovieInternal(fullMovie, ctrl.currentlySelectedList);
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

	this.addMovieInternal = function(movie, listIndex) {
		ctrl.allLists[listIndex].movies.push(movie);
	}

	this.removeMovie = function(movie) {
		var i = ctrl.allLists[ctrl.currentlySelectedList].movies.indexOf(movie);

		alertify.confirm('Are you sure you wish to delete "' + movie.Title + '"?', function () {
		    ctrl.removeMovieInternal(movie, ctrl.currentlySelectedList,
				function() {
					alertify.success("'" + movie.Title + "' have been removed");
					ctrl.upload();
				},
				function(error) {
					alertify.error("Failed to remove '" + movie.Title + "'");
				}
			);
		}, function() {
		    // user clicked "cancel"
		});		
	};

	this.removeMovieInternal = function(movie, listIndex, onSuccess, onError) {
		var i = ctrl.allLists[listIndex].movies.indexOf(movie);
		if(i == -1) {
			onError("Failed to find movie in list");
			return;
		}

		ctrl.allLists[listIndex].movies.splice(i, 1);
		onSuccess();
	};

	this.selectList = function(listIndex) {
		/*
		if (ctrl.moveAction) {
			var moveActionCopy = ctrl.moveAction;
			alertify.okBtn("Move").confirm("Are you sure you wish to move '" + ctrl.moveAction.movie.Title + "' to '" + ctrl.allLists[listIndex].name + "'?", function () {
				ctrl.addMovieInternal(moveActionCopy.movie, listIndex);
				console.log("successfully added movie to new list");
				ctrl.removeMovieInternal(moveActionCopy.movie, ctrl.currentlySelectedList,
					function() {
						alertify.success("'" + moveActionCopy.movie.Title + "' was moved to '" + ctrl.allLists[listIndex].name + "'");
						console.log("successfully removed movie from old list");
						ctrl.upload();
					},
					function(error) {
						console.log("failed to remove movie from old list");
					}
				);
			}, function() {
			    // user clicked "cancel"
			});

		} else {
			ctrl.currentlySelectedList = listIndex;
		}

		ctrl.moveAction = null;
		*/
		ctrl.currentlySelectedList = listIndex;
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

		alertify.confirm('Are you sure you wish to delete the list "' + list.name + '"?', function () {
		    console.log("removing list with index " + ctrl.currentlySelectedList);
			ctrl.allLists.splice(ctrl.currentlySelectedList, 1);

			if (ctrl.allLists.length == 0) {
				ctrl.allLists = dropboxService.getEmptyFile();
			}

			ctrl.upload();
			ctrl.currentlySelectedList = 0;
		}, function() {
		    // user clicked "cancel"
		});
	};

	this.reloadMovie = function(movie) {
		var i = ctrl.allLists[ctrl.currentlySelectedList].movies.indexOf(movie);
		
		ctrl.showLoading();
		omdbService.getFullMovieDetails(movie.imdbID, 
			function(fullMovie) {
				ctrl.allLists[ctrl.currentlySelectedList].movies[i] = fullMovie;
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

	this.move = function(movie, listIndex) {
		alertify.log("Now click on a list to move '" + movie.Title + "' there");
		ctrl.moveAction = {movie: movie, fromList: listIndex};
	};

	this.moveToList = function(listIndex) {
		if (ctrl.moveAction) {
			var moveActionCopy = ctrl.moveAction;
			alertify.okBtn("Move").confirm("Are you sure you wish to move '" + ctrl.moveAction.movie.Title + "' to '" + ctrl.allLists[listIndex].name + "'?", function () {
				ctrl.addMovieInternal(moveActionCopy.movie, listIndex);
				console.log("successfully added movie to new list");
				ctrl.removeMovieInternal(moveActionCopy.movie, ctrl.currentlySelectedList,
					function() {
						alertify.success("'" + moveActionCopy.movie.Title + "' was moved to '" + ctrl.allLists[listIndex].name + "'");
						console.log("successfully removed movie from old list");
						ctrl.upload();
					},
					function(error) {
						console.log("failed to remove movie from old list");
					}
				);
			}, function() {
			    // user clicked "cancel"
			});
		}
		ctrl.moveAction = null;
	}

	this.login = function() {
		authService.authenticate();
	};

	this.logout = function() {
		authService.logout();
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