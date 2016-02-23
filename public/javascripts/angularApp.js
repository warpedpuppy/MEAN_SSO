/**
 * Created by edwardwalther on 2/4/16.
 */

var app = angular.module('authentication_app', ['ui.router']);

app.filter('capitalize', function() {
    return function(input, all) {
        var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
        return (!!input) ? input.replace(reg, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});


app.controller('MainCtrl', ['$scope','auth',function($scope, auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;

}]);

app.controller('NavCtrl', ['$scope', 'auth', '$http', function($scope, auth, $http, $filter){

        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;

        $scope.emptyDBS = function(){
            $http.post("/empty_dbs").success(function(data){
                alert("dbs emptied");
            })
        }

    }]);

app.controller('MembersCtrl',['$scope', 'auth', '$http', function($scope,auth,$http){

            $http.get("/members",{
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).success(function(data){
            $scope.members = data;

        })

    }]);

app.controller('AdminCtrl',['$scope', 'auth','$http', function($scope,auth,$http){
        $scope.change_password_show = true;
        $scope.error = false;
        $scope.show_success = false;

        $scope.changePassword  = function(){
            var passwords = {};
            passwords.username = auth.currentUser();
            passwords.new_password_1 = $scope.new_password_1;
            passwords.new_password_2 = $scope.new_password_2;

            if(passwords.new_password_1 !== passwords.new_password_2){
                alert(passwords.new_password_1+" "+passwords.new_password_2)
                $scope.error = true;
                $scope.warning = "passwords don't match";

            }
            else{
                $http.post("/admin_change_password/", passwords,{
                    headers: {Authorization: 'Bearer '+auth.getToken()}
                }).then(function(response) {

                    if(response.data.record_updated === true){
                        $scope.success = "password updated";
                        $scope.show_success = true;
                    }
                    else{
                        $scope.error = true;
                        $scope.warning = "there was a problem, please try again."
                    }
                });
            }
        }

        $scope.changeEmail  = function(){
            var email = {};
            email.username = auth.currentUser();
            email.new_email_1 = $scope.new_email_1;
            email.new_email_2 = $scope.new_email_2;

            if(email.new_email_1 !== email.new_email_2){
                alert(email.new_email_1+" "+email.new_email_2)
                $scope.error = true;
                $scope.warning = "emails don't match";

            }
            else{
                $http.post("/admin_change_email/", email,{
                    headers: {Authorization: 'Bearer '+auth.getToken()}
                }).then(function(response) {


                    if(response.data.record_updated === true){
                        $scope.success = "email updated";
                        $scope.show_success = true;
                    }
                    else{
                        $scope.error = true;
                        $scope.warning = "there was a problem, please try again."
                    }
                });
            }


        }
    }]);


app.controller('ResetPasswordCtrl',['$scope', 'info', '$location', '$http', '$state','hermes',function($scope,info,$location,$http,$state,hermes){


    $scope.username = $location.search().username;
    $scope.reset_key = $location.search().key;
    $scope.show_warning = false;
    $scope.show_success = false;
    $scope.resetPassword = function(){

        if($scope.new_password_1 !== $scope.new_password_2){
            $scope.warning = "passwords must match!";
            $scope.show_warning = true;
        }
        else{

            var user = {};
            user.username = $scope.username;
            user.reset_key = $scope.reset_key;
            user.new_password_1 = $scope.new_password_1;
            user.new_password_2 = $scope.new_password_2;

            $http.post("/reset_password/", user).then(function(response) {

                if(response.data.reset_expired === true){
                    $scope.warning = "reset token expired, please re-initiate"
                    $scope.show_warning = true;

                    hermes.add_message("expired")
                    $state.go("login");
                }
                else if(response.data.user_exists === true){
                    $scope.success = "record updated."
                    $scope.show_success = true;
                    hermes.add_message("updated")
                    $state.go("login");
                }
                else{
                    $scope.show_warning = true;
                    $scope.warning = "no such user!"
                }
            });
        }
    }
}]);

app.controller('ForgotPasswordCtrl',['$scope', 'info', 'auth', '$http',function($scope,info,auth,$http){

    $scope.show_forgot_password_form = true;
    $scope.error = false;
    $scope.sendRestPasswordLink = function(){

        $http.get("/send_reset_link/"+$scope.username_fp).then(function(response) {
            if(response.data.user_exists == true){
                    $scope.success = "Email with reset link was sent. Please check your inbox."
                $scope.show_forgot_password_form = false;
            }
            else{
                $scope.error = true;
                $scope.error_message = "no such user!"
            }
        });
    }
}]);

app.controller('EnableCtrl',['$scope', 'info', 'auth', function($scope,info,auth){
    $scope.info = info.info;
}]);


app.controller('PendingCtrl',['$scope', function($scope){}]);

app.controller('AuthCtrl', ['$scope', '$state', 'auth', 'info', 'hermes', function($scope, $state, auth, info,hermes){

            if(hermes.message == 'updated'){
                $scope.show_success = true;
                $scope.success_message = "The record was updated.";
                hermes.message = undefined;
            }

            if(hermes.message == 'expired'){
                $scope.show_error = true;
                $scope.error_message = "Reset token expired. Please click 'forgot password' again.";
                hermes.message = undefined;
            }

            if(hermes.message == 'registration expired'){
                $scope.show_error = true;
                $scope.error_message = "This registration link has expired, please re-register.";
                hermes.message = undefined;
            }

            empower_reg_form_jquery();

            $scope.user = {};
            $scope.info = info.info;

            $scope.show_password_length = true;

            $scope.forgotPassword = function(){
                $state.go("forgot_password")
            }

            $scope.register = function(){

                var proceed = true;
                for(var key in $scope.user){
                    if($scope.user[key] === undefined){
                        proceed = false;
                        $scope.show_error = true;
                        $scope.error_message = "one of the fields is undefined. . . hmmm."
                        break;
                    }
                }

                if(proceed === true){
                    auth.register($scope.user).error(function(error){
                        $scope.show_error = true;
                        $scope.error_message = error;
                    }).then(function(){
                        $state.go('pending');
                    });
                }

            };

            $scope.logIn = function(){
                auth.logIn($scope.user).error(function(error){
                    $scope.show_error = true;
                    $scope.error_message = error;
                }).then(function(){
                    $state.go('home');
                });
            };
        }])

app.directive('username',['$http','info',"$q",function($http, info, $q) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$asyncValidators.usernameExists = function(username) {
                return $http.get("/check_username/"+username).then(function(response) {
                    return response.data.username_taken == true ? $q.reject(response.data.errorMessage) : true;
                });
            }
        }
    };
}]);





app.factory('info', ['$http', '$location','auth',"$state", "hermes",function($http,$location,auth,$state,hermes){
    var o = {
        info:[]
    };

    o.enable = function(){
         return $http.post("/enable_account/"+$location.search().key).success(function(data){

             if(data.expired === true){

                 hermes.add_message("registration expired");
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


app.factory('hermes', ['$http', '$window',  '$state', function($http, $window, $state) {

    var hermes = {};
    hermes.add_message = function(str){
        hermes.message = str;
    }
    return hermes;

}]);
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
            $state.go("pending");
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
        return $http.get('/members', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            angular.copy(data, auth.message_from_server);
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
                    if(!auth.isLoggedIn()){
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
            }]
        })
        $stateProvider.state('forgot_password', {
            url: '/forgot_password',
            templateUrl: '/forgot_password.html',
            controller: 'ForgotPasswordCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
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
            }]
        })
        $stateProvider.state('admin', {
            url: '/admin',
            templateUrl: '/admin.html',
            controller: 'AdminCtrl',
            onEnter: ['$state',  'auth', function($state,auth){
                if(auth.isLoggedIn()){
                 /*   auth.server_auth_check().success(function(data){
                        //console.log('YES = '+data.success)
                    })*/

                }
                else{
                    $state.go('login');
                }
            }]
        })



        $stateProvider.state('members', {
            url: '/members',
            templateUrl: '/members.html',
            controller: 'MembersCtrl',
            onEnter: ['$state',  'auth', function($state,auth){

                 if(!auth.isLoggedIn()){
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

        $stateProvider.state('reset_password', {
            url: '/reset_password',
            templateUrl: '/reset_password.html',
            controller: 'ResetPasswordCtrl',
            onEnter: ['$state',"info",function($state, info){

            }]
        })


        $urlRouterProvider.otherwise('login');
    }]);

