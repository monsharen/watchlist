movieApp.directive('movie', function() {

	return {
        restrict: 'E',
       //replace: true,
        template: function(element, attrs) {

            function button(command, icon, caption, className) {
                return '<div class="movieMenuItem"><button type="button" class="btn ' + className + ' btn-xs" aria-label="Left Align" ng-click="ctrl.' + command + '(movie)"><span class="glyphicon ' + icon + '" aria-hidden="true"> ' + caption + '</span></button></div>'
            }
            var renderDelete = attrs.deletelink == 'true';
            var trailer = attrs.trailer == 'true';
            var renderAdd = attrs.addlink == 'true';
            var renderImdb = attrs.imdb == 'true';

            console.log("adding movie result: " + renderDelete + ", " + trailer + ", " + renderAdd);

            var menuHtml = '<div class="movieMenu" ng-show="show">' +
                    '<div><b>{{movie.Title}}</b></div>' +
                    '<div>{{movie.Genre}}</div>' +
                    '<div>{{movie.Year}}</div>' +
                    (renderImdb ? '<div><img class="imdbRating" src="imdb.png" />{{movie.imdbRating}}</div>' : '') +
                    (renderAdd ? button("addMovie", "glyphicon-pencil", "Add", "btn-success") : '') +
                    (trailer ? button("playTrailer", "glyphicon-play-circle", "Trailer", "btn-default") : '') +
                    (renderDelete ? button("removeMovie", "glyphicon-trash", "Remove", "btn-danger") : '') +
                '</div>';

            
            return '<div>' +
            '<div class="movie" ng-mouseenter="show=true" ng-mouseleave="show=false" style="background-image: url(\'{{movie.Poster}}\'), url(\'movie-placeholder.jpg\');">' + 
            '<center>' +
            menuHtml +
            //'<div>test</div>' +
            '</center>' +
            '</div>' + 
            '</div>';
        },
        transclude: true,
        link: function(scope, element, attrs) {
        }
    };
});