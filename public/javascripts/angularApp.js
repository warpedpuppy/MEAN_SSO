/**
 * Created by edwardwalther on 2/4/16.
 */

var app = angular.module('authentication_app', ['ui.router']);


app.controller('NavCtrl', [
    '$scope',
    'auth',
    '$http',
    '$filter',
    function($scope, auth, $http, $filter){


        $filter('uppercase')()

        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;

        $scope.emptyDBS = function(){
            $http.post("/empty_dbs").success(function(data){
                alert("dbs emptied");
            })

        }
    }]);
app.controller('ProtectedCtrl',[
    '$scope',
        'auth',
    function($scope,auth){
        $scope.message_from_server = auth.message_from_server;

    }]);


app.controller('EnableCtrl',['$scope', 'info', 'auth', function($scope,info,auth){


    $scope.info = info.info;

}]);


app.controller('PendingCtrl',[
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
        'info',
        function($scope, $state, auth, info){
           // alert("auth controller");
            $scope.user = {};
            $scope.info = info.info;

            $scope.show_password_length = true;



            if($scope.info.expired == true){
                alert("expired");
                $scope.expired_notice ="That was expired, please re-register."
            }

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
var LETTERS_NUMBERS_REGEXP = /^[a-zA-Z0-9]*$/;
app.directive('username',function($q, $timeout, $http) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            scope.hide_six = true;
            scope.username_digits_letters = true;
            scope.username_not_taken = true;
            scope.username_looks_good = false;



            ctrl.$asyncValidators.username = function(modelValue, viewValue) {
                var cont = {};
                cont.username = modelValue;
                return $http.post("/check_username/",cont).then(function(data){scope.username_not_taken = !data.data.user; console.log(data.data.user)})
            }







                ctrl.$validators.username = function(modelValue, viewValue) {



                if (!ctrl.$isEmpty(modelValue)) {
                    if (!LETTERS_NUMBERS_REGEXP.test(modelValue)) {
                        // it is valid
                        scope.username_digits_letters = true;
                    }
                    else{
                        scope.username_digits_letters = false;
                    }



                    if (viewValue.length > 6) {
                        //alert("greater than 6")
                        scope.hide_six = false;
                    }
                    else {
                        scope.hide_six = true;
                    }

                    if(scope.hide_six === false && scope.username_digits_letters === false && scope.username_not_taken === true){

                        scope.username_looks_good = true;
                            return false;
                    }
                    else{
                        scope.username_looks_good = false
                            return true;
                    }
                }
                else{
                    scope.hide_six = true;
                    scope.username_digits_letters = true;
                };

            }
        }
    };
});
var UPPERCASE_REGEXP = /(?=.*[A-Z])/;
var LOWERCASE_REGEXP = /(?=.*[a-z])/;
var NUMBERS_REGEXP = /\d/;
app.directive('password', function($q, $timeout) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            scope.pd_gt_six = true;
            scope.pd_uppercase = true;
            scope.pd_lowercase = true;
            scope.pd_number = true;

            ctrl.$validators.password = function(modelValue, viewValue) {

                if (!ctrl.$isEmpty(modelValue)) {
                    if (!UPPERCASE_REGEXP.test(modelValue)) {
                        // it is valid
                        scope.pd_uppercase = true;
                    }
                    else{
                        scope.pd_uppercase = false;
                    }
                    if (!LOWERCASE_REGEXP.test(modelValue)) {
                        // it is valid
                        scope.pd_lowercase = true;
                    }
                    else{
                        scope.pd_lowercase = false;
                    }

                    if (!NUMBERS_REGEXP.test(modelValue)) {
                        // it is valid
                        scope.pd_number = true;
                    }
                    else{
                        scope.pd_number = false;
                    }




                    if (viewValue.length > 6) {
                        //alert("greater than 6")
                        scope.pd_gt_six = false;
                    }
                    else {
                        scope.pd_gt_six = true;
                    }



                    if(scope.pd_gt_six == false &&
                    scope.pd_uppercase == false &&
                    scope.pd_lowercase == false &&
                    scope.pd_number == false){
                        return false;
                    }
                    else{
                        return true;
                    }
                }
                else{
                    scope.pd_gt_six = true;
                    scope.pd_uppercase = true;
                    scope.pd_lowercase = true;
                    scope.pd_number = true;
                };

            }
        }
    };
});
app.controller('MainCtrl', ['$scope','auth',function($scope, auth){


    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
  //  alert("main")

   // $scope.user.email = "test@tugtug.com";

}]);

app.factory('info', ['$http', '$location','auth',"$state", function($http,$location,auth,$state){
    var o = {
        info:[]
    };
    o.enable = function(){
         return $http.post("/enable_account/"+$location.search().key).success(function(data){
            //alert(data.info.username);
             if(data.expired == true){

                 angular.copy(data, o.info)
                 $state.go("register");
             }
            else if(data.allow == false){
                $state.go("home");
            }
             else{
                auth.saveToken(data.token);
                angular.copy(data.info, o.info)
            }


        })
    }
    return o;
}])

app.factory('auth', ['$http', '$window',  '$state', function($http, $window, $state){



    var auth = {};
    auth.message_from_server = {};

    auth.saveToken = function (token){
        $window.localStorage['generic-auth-token-new'] = token;
    };

    auth.getToken = function (){
        //$window.localStorage['generic-auth-token'] = undefined;
        return $window.localStorage['generic-auth-token-new'];
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
        $window.localStorage.removeItem('generic-auth-token-new');

    };
    auth.server_auth_check = function() {
        return $http.get('/protected', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            //alert(data.success)

            angular.copy(data, auth.message_from_server);
            //alert( auth.message_from_server.success)
        });
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
                controller: 'MainCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){


                    }
                    else{
                        $state.go('login');
                    }
                }]
            });
        $stateProvider.state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){

                    $state.go('home');
                }
                else{

                }
            }]
        })
        $stateProvider.state('pending', {
            url: '/pending',
            templateUrl: '/pending.html',
            controller: 'PendingCtrl',
            onEnter: ['$state', "$http","$location", "auth",function($state,$http,$location,auth){

                if(auth.isLoggedIn()){

                    $state.go('home');
                }
                else{

                }
            }]
        })
        $stateProvider.state('expired', {
            url: '/expired',
            templateUrl: '/expired.html',
            controller: 'MainCtrl'
        })



        $stateProvider.state('protected', {
            url: '/protected',
            templateUrl: '/protected.html',
            controller: 'ProtectedCtrl',
            onEnter: ['$state',  'auth', function($state,auth){

                //here we have a 2x check -- first checks locally and then goes and hits a link on the server
                //that is protected by auth. this may be overkill
                 if(auth.isLoggedIn()){
                    auth.server_auth_check().success(function(data){
                        //console.log('YES = '+data.success)
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


        $stateProvider.state('enable_account', {
            url: '/enable_account',
            templateUrl: '/enable_account.html',
            controller: 'EnableCtrl',
            onEnter: ['$state',"info",function($state, info){

                info.enable().success(function(data){

                   // alert("enable success "+data.info.username);
                });
            }]
        })


        $urlRouterProvider.otherwise('login');
    }]);

