/**
 * Created by Neil on 2016-03-30.
 */
var app = angular.module('myApp',[]);
    app.controller('chatSidebarCtrl', function ($scope, $http, $rootScope,$interval) {
        //what occurs when a page is loaded with the chat side bar
        $http.get("/users/:userID/conversations")
            .then(function (response) {
                var object_array=response.data.data;
                $scope.names = object_array;
                console.log(object_array);
                $rootScope.showpopup=false;
                //what occurs when a popup is made
                $scope.make_popup=function(id,name){
                    $rootScope.conversationID=id;
                    $http.get("/users/:userID/conversations/"+id)
                        .then(function (response) {
                            var object_array = response.data.data;
                            console.log(object_array);
                            $rootScope.messages=object_array;
                        });
                    $rootScope.popupName=name;
                    $rootScope.showpopup=true;
                    $interval($rootScope.update_popup, 3000);
                };
                $scope.go_user_profile=function(id){
                    window.location.assign("/profiles/"+id);
                };
                $rootScope.update_popup=function(){
                    var id = $rootScope.conversationID;
                    $http.get("/users/:userID/conversations/"+id)
                        .then(function (response) {
                            var object_array = response.data.data;
                            console.log(object_array);
                            $rootScope.messages=object_array;
                        });
                };
            });
    });
    app.controller('chatPopupCtrl',function($scope,$http,$rootScope){
                $scope.close_popup = function(){
                    $rootScope.showpopup=false;
                    document.getElementById("textinput").value="";
                };
                $scope.send_message = function(conversationID){
                    var content=document.getElementById("textinput").value;
                    if (content !== '') {
                        console.log("conversationID is: "+conversationID);
                        $http({
                            method: 'POST',
                            url: 'users/:userID/conversations/'+conversationID,
                            data: "message="+content,
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        });
                        document.getElementById("textinput").value="";
                        $rootScope.update_popup(conversationID);
                    }
                };
    });

//from  http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });
                event.preventDefault();
            }
        });
    };
});

//from http://stackoverflow.com/questions/26343832/scroll-to-bottom-in-chat-box-in-angularjs
app.directive('ngScrollBottom', ['$timeout', function ($timeout) {
    return {
        scope: {
            ngScrollBottom: "="
        },
        link: function ($scope, $element) {
            $scope.$watchCollection('ngScrollBottom', function (newValue) {
                if (newValue) {
                    $timeout(function(){
                        $element.scrollTop($element[0].scrollHeight);
                    }, 0);
                }
            });
        }
    }
}]);