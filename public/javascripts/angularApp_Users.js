/**
 * Created by edwardwalther on 2/4/16.
 */

var app = angular.module('authentication_app', ['ui.router']);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }]);


app.controller('MainCtrl', ['$scope','auth', function($scope, auth){


    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;

}]);
app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};
    auth.saveToken = function (token){
        $window.localStorage['generic-auth-token'] = token;
    };

    auth.getToken = function (){
        return $window.localStorage['generic-auth-token'];
    }
    auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };
    auth.register = function(user){
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    auth.logOut = function(){
        $window.localStorage.removeItem('generic-auth-token');
    };
    return auth;
}]);


app.factory('test', ['$http', 'auth', function($http,auth){
    var o = {
        test:[]
    };

    o.get_protected = function() {
        return $http.post('/users/users_protected', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            angular.copy(data, o.test);
        });
    };
    return o;
}])

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {



        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl',
            onEnter: ['$state',  'auth', 'test',function($state,auth,test){

                test.get_protected().success(function(data){
                    //console.log('YES'+data.success)
                })

                if(auth.isLoggedIn()){


                }
                else{
                    //$state.go('login');
                }
            }]
        })


        $urlRouterProvider.otherwise('home');
    }]);
