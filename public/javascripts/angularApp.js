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
app.controller('ProtectedCtrl',[
    '$scope',
        'test',
    function($scope,test){

        $scope.test = test.test;

    }]);

app.controller('EnableCtrl'['$scope', 'info',  function($scope,info){
        alert("enable")
        $scope.info = "hi";//info.info;

    }]);
app.controller('PendingCtrl'[
    '$scope',
        function($scope){



        }]);
app.controller('UsersCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }]);

app.controller('AuthCtrl', [
        '$scope',
        '$state',
        'auth',
        function($scope, $state, auth){
            alert("auth controller");
            $scope.user = {};

            $scope.register = function(){
                auth.register($scope.user).error(function(error){
                    $scope.error = error;
                }).then(function(){
                    $state.go('pending');
                });
            };

            $scope.logIn = function(){
                auth.logIn($scope.user).error(function(error){
                    $scope.error = error;
                }).then(function(){
                    $state.go('home');
                });
            };
        }])

app.controller('MainCtrl', ['$scope','auth',function($scope, auth){


    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    alert("main")

   // $scope.user.email = "test@tugtug.com";

}]);

app.factory('info', ['$http', '$location', function($http,$location){
    var o = {
        info:[]
    };
    o.enable = function(){
         return $http.post("/enable_account/"+$location.search().key).success(function(data){
            alert(data.info.username);
            angular.copy(data.info, o.info)

        })
    }
    return o;
}])

app.factory('test', ['$http', 'auth', function($http,auth){
    var o = {
        test:[]
    };
    o.clear = function() {
        o.test = [];
    };
    o.get_protected = function() {
        return $http.get('/protected', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            angular.copy(data, o.test);
        });
    };
    return o;
}])
app.factory('auth', ['$http', '$window',  '$state', function($http, $window, $state){
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
            //don't save token becaue must wait for approval
            //auth.saveToken(data.token);

            $state.go("pending");
            //alert("register success");
        });
    };
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    auth.logOut = function(){

        $state.go('login');
        $window.localStorage.removeItem('generic-auth-token');

    };
    return auth;
}]);


app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl'
            });
        $stateProvider.state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){

                    $state.go('protected');
                }
                else{

                }
            }]
        })
        $stateProvider.state('pending', {
            url: '/pending',
            templateUrl: '/pending.html',
            controller: 'PendingCtrl',
            onEnter: ['$state', "$http","$location", function($state,$http,$location){
             //   alert("entered pending");
            }]
        })

        $stateProvider.state('enable', {
            url: '/enable_account',
            templateUrl: '/enable_account.html',
            controller: 'EnableCtrl',
            onEnter: ['$state',"info", function($state, info){

                info.enable().success(function(data){

                   alert("enable success "+data.info.username);
               });
            }]
        })

        $stateProvider.state('protected', {
            url: '/protected',
            templateUrl: '/protected.html',
            controller: 'ProtectedCtrl',
            onEnter: ['$state',  'auth', 'test',function($state,auth,test){



                if(auth.isLoggedIn()){
                    test.get_protected().success(function(data){
                        //console.log('YES'+data.success)
                    })

                }
                else{
                    $state.go('login');
                }
            }]
        })

        $stateProvider.state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){

                        $state.go('home');
                    }
                    else{
                        //$state.go('enable');
                    }
                }]
            });

        $urlRouterProvider.otherwise('login');
    }]);
