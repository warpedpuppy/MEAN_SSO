/**
 * Created by edwardwalther on 2/19/16.
 */

$(function() {
    /*
    THE REASON WHY THIS IS BEING DONE HERE INSTEAD OF IN ANGULAR IS BECAUSE IT WON'T LOOK AT THE DIRECTIVES IF ANYTHING IS CAUSING THE FORMS TO READ FALSE, SO THESE CHECKS WON'T HAPPEN THERE. . .

    I TRIED TO DO THIS ALL IN ANGULAR, BUT THIS PART COULDN'T CO-EXIST
    */


    //USERNAME:  IN BETWEEN 3 & 20, ONLY LETTERS OR NUMBERS
    var username_input =  $("#username_input");
    var username_string_length = $("#username_string_length");
    var username_char_check = $("#username_char_check");
    var LETTERS_NUMBERS_REGEXP = /^[a-zA-Z0-9]*$/;

    username_input.bind("change paste keyup", function() {

        var val = $(this).val();

        if(val.length >= 3 && val.length <=20 ){
            username_string_length.addClass("hide");
        }
        else{
            username_string_length.removeClass("hide");
        }

        if(LETTERS_NUMBERS_REGEXP.test(val)){
            username_char_check.addClass("hide");
        }
        else{
            username_char_check.removeClass("hide");
        }
    });

    var password_input = $("#password_input");
    var password_length_check = $("#password_length_check");
    var password_uppercase_check = $("#password_uppercase_check");
    var password_lowercase_check = $("#password_lowercase_check");
    var password_number_check = $("#password_number_check");
    var UPPERCASE_REGEXP = /(?=.*[A-Z])/;
    var LOWERCASE_REGEXP = /(?=.*[a-z])/;
    var NUMBERS_REGEXP = /\d/;

    password_input.bind("change paste keyup", function() {

        var val = $(this).val();

        if(val.length >= 6 && val.length <=20 ){
            password_length_check.addClass("hide");
        }
        else{
            password_length_check.removeClass("hide");
        }

        if(NUMBERS_REGEXP.test(val)){
            password_number_check.addClass("hide");
        }
        else{
            password_number_check.removeClass("hide");
        }

        if(LOWERCASE_REGEXP.test(val)){
            password_lowercase_check.addClass("hide");
        }
        else{
            password_lowercase_check.removeClass("hide");
        }

        if(UPPERCASE_REGEXP.test(val)){
            password_uppercase_check.addClass("hide");
        }
        else{
            password_uppercase_check.removeClass("hide");
        }
    });



});