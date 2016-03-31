/**
 * Created by Neil on 2016-03-30.
 */

var app = angular.module('myApp',['chatPopupModule']);
    app.controller('chatCtrl', function ($scope, $http) {
        $http.get("/users/1/conversations")
            .then(function (response) {
                var object_array=response.data.data;
                console.log(object_array[0]);
                $scope.names = object_array;
                $scope.make_popup=function(id,name,$event){
                    $event.preventDefault();
                    register_popup(id,name);
                };
            });
    });