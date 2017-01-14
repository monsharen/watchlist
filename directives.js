movieApp.directive('movie', function() {

	return {
        restrict: 'E',
        template: function(element, attrs) {

            function button(command, icon, caption, className) {
                return '<div class="movieMenuItem"><button type="button" class="btn ' + className + ' btn-xs" aria-label="Left Align" ng-click="ctrl.' + command + '(movie)"><span class="glyphicon ' + icon + '" aria-hidden="true"> ' + caption + '</span></button></div>'
            }
            var renderDelete = attrs.deletelink == 'true';
            var trailer = attrs.trailer == 'true';
            var renderAdd = attrs.addlink == 'true';
            var renderImdb = attrs.imdb == 'true';
            var renderMove = attrs.move == 'true';

            console.log("adding movie result: " + renderDelete + ", " + trailer + ", " + renderAdd);

            var menuHtml = '<div class="movieMenu" ng-show="show">' +
                    '<div><b>{{movie.Title}}</b></div>' +
                    '<div>{{movie.Genre}}</div>' +
                    '<div>{{movie.Year}}</div>' +
                    (renderImdb ? '<div><img class="imdbRating" src="imdb.png" />{{movie.imdbRating}}</div>' : '') +
                    (renderAdd ? button("addMovie", "glyphicon-pencil", "Add", "btn-success") : '') +
                    (trailer ? button("playTrailer", "glyphicon-play-circle", "Trailer", "btn-default") : '') +
                    (renderMove ? button("move", "glyphicon-transfer", "Move", "btn-warning") : '') +
                    (renderDelete ? button("removeMovie", "glyphicon-trash", "Remove", "btn-danger") : '') +
                    button("reloadMovie", "glyphicon-refresh", "Reload", "btn-warning") +
                '</div>';

            
            return '<div>' +
            '<div class="movie" ng-mouseenter="show=true" ng-mouseleave="show=false" style="background-image: url(\'{{movie.Poster}}\'), url(\'movie-placeholder.jpg\');">' + 
            '<center>' +
            menuHtml +
            '</center>' +
            '</div>' + 
            '</div>';
        },
        transclude: true,
        link: function(scope, element, attrs) {
        }
    };
});

movieApp.directive('sortable', function() {
    return {
        restrict: 'A',
        template: function(element, attrs) {
            var predicate = attrs.predicate;
            var title = attrs.title;
            var icon = attrs.icon;
            return "<button type=\"button\" class=\"btn btn-xs\" ng-class=\"{'btn-info': predicate=='" + predicate + "'}\" ng-click=\"predicate='" + predicate + "';reverse=!reverse\">" + 
            title + " " +
            "<span class=\"glyphicon\" ng-class=\"{'" + icon + "': !reverse, '" + icon + "-alt': reverse}\" aria-hidden=\"true\"></span>" +
            "</button>";
        }
    };
});