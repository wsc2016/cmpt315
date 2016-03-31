/**
 * Created by Neil on 2016-03-30.
 */
    var app = angular.module('myApp', []);
    app.controller('chatCtrl', function ($scope, $http) {
        $http.get("/users/1/conversations")
            .then(function (response) {
                var object_array=response.data.data;
                console.log(JSON.stringify(object_array[0]));
                console.log(typeof(response.data.data));
                console.log(object_array[0].firstName);
                $scope.names = object_array;
            });
    });