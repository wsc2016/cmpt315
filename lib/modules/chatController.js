/**
 * Created by Neil on 2016-03-30.
 */

var app = angular.module('myApp',['chatPopupModule']);
    app.controller('chatSidebarCtrl', function ($scope, $http, $rootScope) {
        $http.get("/users/1/conversations")
            .then(function (response) {
                var object_array=response.data.data;
                console.log(object_array[0]);
                $scope.names = object_array;
                $rootScope.showpopup=false;
                $scope.make_popup=function(id,name,$event){
                    //$event.preventDefault();
                    //register_popup(id,name);
                    $rootScope.showpopup=!$rootScope.showpopup;
                };
            });
    });
    app.controller('chatPopupCtrl',function($scope,$http){
       $scope.close_popup = function(id){
           $rootScope.showpopup=false;
       }
    });