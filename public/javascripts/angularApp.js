/**
 * Created by edwardwalther on 2/4/16.
 */

var app = angular.module('authentication_app', ['ui.router','vcRecaptcha']);

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

            $http.get("/teams",{
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).success(function(data){
            $scope.members = data;

        })

    }]);

app.controller('AdminCtrl',['$scope', 'auth','$http', function($scope,auth,$http){

        $scope.active_tab = 1;
        $scope.add_group_member_show = false;
        $scope.change_password_show = true;
        $scope.error = false;
        $scope.show_success = false;

        $scope.toggleVisibility = function(model) {
            $scope.selected = ($scope.selected === undefined)?model:undefined;
        };
        $scope.isVisible = function(model) {
            return $scope.selected === model;
        };

        $http.get("/members",{
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            console.log(data)
            $scope.members = data;
        })

        $scope.deleteMember = function(id){
            alert(id)

            $http.get("/delete_member/"+id,{
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).success(function(data){
                console.log(data)



            })
            }

        $scope.addGroupMember = function(){
            var new_member = {};
            new_member.groupname = auth.currentUser();
            new_member.new_member_name = $scope.new_member_name;
            new_member.new_member_email= $scope.new_member_email;



            $http.post("/add_new_member/", new_member,{
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).then(function(response) {

                if(response.data.member_added === true){
                    $scope.new_member_name = "";
                    $scope.new_member_email = "";
                    $scope.success = "New member added!";
                    $scope.show_success = true;
                }
                else{
                    $scope.error = true;
                    $scope.warning = "there was a problem, please try again."
                }
            });

        }

        $scope.changePassword  = function(){
            var passwords = {};
            passwords.username = auth.currentUser();
            passwords.new_password_1 = $scope.new_password_1;
            passwords.new_password_2 = $scope.new_password_2;

            if(passwords.new_password_1 !== passwords.new_password_2){
                //alert(passwords.new_password_1+" "+passwords.new_password_2)
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

app.controller('AuthCtrl', ['$scope', '$state', 'auth', 'info', 'hermes', '$http',function($scope, $state, auth, info,hermes,$http){

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


    //console.log("this is your app's controller");
    $scope.response = null;
    $scope.widgetId = null;
    $scope.model = {
        key: '6LdCVRkTAAAAAI2pzm1AMpyLtH9Zav7shUK6cukD'
    };
    $scope.setResponse = function (response) {
        //console.info('Response available');
        $scope.response = response;
    };
    $scope.setWidgetId = function (widgetId) {
        //console.info('Created widget ID: %s', widgetId);
        $scope.widgetId = widgetId;
    };
    $scope.cbExpiration = function() {
        //console.info('Captcha expired. Resetting response object');
        vcRecaptchaService.reload($scope.widgetId);
        $scope.response = null;
    };
    //$.getScript("https://www.google.com/recaptcha/api.js");
    $scope.submit = function () {
        var valid;

        /**
         * SERVER SIDE VALIDATION
         *
         * You need to implement your server side validation here.
         * Send the reCaptcha response to the server and use some of the server side APIs to validate it
         * See https://developers.google.com/recaptcha/docs/verify
         */
        //console.log('sending the captcha response to the server', $scope.response);
       // console.log($scope.myFields.myRecaptchaResponse);
       // console.log($scope.response);
        $scope.user.response = $scope.response
        $http.post('/register_test', $scope.user).success(function(data){

            var string = "";
            for(var key in data){
                if(data[key].toString() !== "[object Object]")
                    string += key+") "+data[key]+"   \n";
                else{
                    for(var key2 in data[key]){
                        string += key2+") "+data[key][key2]+"   \n";
                    }
                }

            }

            $scope.response = data;

        });

       /* if ($http.post('/register_test', $scope.response)) {
            console.log('Success');
        } else {
            console.log('Failed validation');

            // In case of a failed validation you need to reload the captcha
            // because each response can be checked just once
            vcRecaptchaService.reload($scope.widgetId);
        }*/
    };




            $scope.register = function(){

                $scope.user.response = $scope.response
               //console.log($scope.response);
                //console.log("recaptcha_response_field = "+$scope.recaptcha_response_field);


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

