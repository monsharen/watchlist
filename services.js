movieApp.service('authService', ['$http', function($http) {

	var authService = this;

	this.clientId = "5p2k4moufxk2iib";
	this.redirectUri = "https://monsharen.github.io/watchlist/index.html";
	//this.redirectUri = "https://www.movie.pizza/";
	this.responseType = "token";

	this.authenticate = function() {
		var url = authService.getAuthenticationUrl();
		window.location.href = url;
	};
	

	this.getAuthenticationUrl = function() {
		return 'https://www.dropbox.com/1/oauth2/authorize?' + 
			'response_type=' + authService.responseType + 
			'&client_id=' + authService.clientId + 
			"&redirect_uri=" + authService.redirectUri;
	};

	this.isUserAuthenticated = function(onSuccess, onError) {
		var params = authService.getHashParams();
		var authToken = params["/access_token"];

		if (authToken != null) {
			onSuccess(authToken);
		} else {
			onError();
		}
	};

	this.getUrlParams = function() {
		var urlParams = document.location.search.split('+').join(' ');

		var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;

		while (tokens = re.exec(urlParams)) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}
		return params;
	};

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

}]);

movieApp.service('dropboxService', ['$http', function($http) {

	/*
	File structure
	[
		{ "name": "nameOfList1", "movies":[], "series": [] },
		{ "name": "nameOfList2", "movies":[], "series": [] }
	]
	*/

    var dropbox = this;
    this.fileName = "data.json";
    this.baseUrl = 'https://content.dropboxapi.com/1';

    this.getData = function(authToken, onSuccess, onError, onComplete) {
		var req = {
			method: 'GET',
			url: dropbox.baseUrl + "/files/auto/" + dropbox.fileName,
			headers: {
				"Authorization": "Bearer " + authToken
			}
		};

		$http(req).then(function(response) {
			onSuccess(response.data);
		}, 
		function(error) {
			onError(error);
		}).finally( function() {
			onComplete();
		});
	};

	this.getEmptyFile = function() {
		return [ { name: "Watch list", movies:[], series: [] } ];
	};

	this.getNewList = function(name) {
		return { name: name, movies:[], series: [] };
	};

	this.upload = function(authToken, data, onSuccess, onError, onComplete) {

		var req = {
			method: 'POST',
			url: dropbox.baseUrl + "/files_put/auto/" + dropbox.fileName,
			headers: {
				"Authorization": "Bearer " + authToken
			},
			data: data
		};

		$http(req).then(function(response) {
			onSuccess(response);
		}, 
		function(response) {	
			onError(response);
		}).finally( function() {
			onComplete();
		});
	}
}]);

movieApp.service('omdbService', ['$http', function($http) {

	var omdbService = this;
	this.baseUrl = "https://www.omdbapi.com/";
    
    this.find = function(movieTitle, onSuccess, onError, onComplete) {

		if (!movieTitle) {
			onError("empty search queries not allowed");
			onComplete();
			return;
		}

		var req = {
			method: 'GET',
			url: omdbService.baseUrl + "?s=" + movieTitle
		};

		$http(req).then(function(response) {
			console.log("search result");
			console.log(response.data.Search);

			if (response.data.Error) {
				console.log("search failed: " + response.data.Error);
				onError("search failed: " + response.data.Error);
				return;
			}

			onSuccess(response.data.Search);
		}, 
		function(response) {
			console.log("request failed: ");
			console.log(response);
			onError(response);
		}).finally( function() {
			onComplete();
		});
	}

	this.getFullMovieDetails = function(imdbId, onSuccess, onError, onComplete) {
		var req = {
			method: 'GET',
			url: omdbService.baseUrl + "/?i=" + imdbId
		};

		$http(req).then(function(response) {
			console.log("got movie result");
			console.log(response.data);

			if (response.data.Error) {
				onError(response.data.Error);
				return;
			}

			var movie = response.data;
			console.log("got full details: ");
			console.log(movie);
			onSuccess(movie);
		}, 
		function(response) {
			console.log("request failed: ");
			console.log(response);
			onError(response);
		}).finally( function() {
			onComplete();
		});
	};
}]);

movieApp.service('searchService', [ 'omdbService', function(omdbService) {

	this.search = function(query, onSuccess, onError, onComplete) {

		if (query.indexOf('imdb:') === 0) {
			var imdbId = query.substring(5);

			omdbService.getFullMovieDetails(imdbId, 
				function onFullMovieDetailsSuccess(movie) {
					var movieResults = [];
					movieResults.push(movie);
					onSuccess(movieResults);
				}, 
				function onFullMovieDetailsError(error) {
					onError(error);
				},
				function onFullMovieDetailsComplete() {
					onComplete();
				}
			);
		} else {
			omdbService.find(query, 				
				function onFindSuccess(partialMovieDetails) {
					onSuccess(partialMovieDetails);
				}, 
				function onFindError(error) {
					onError(error);
				},
				function onFindComplete() {
					onComplete();
				}
			);
		}
	};
}]);	
