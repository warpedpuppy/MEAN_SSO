/**
 * Created by edwardwalther on 2/19/16.
 */

$(function() {
    /*
    THE REASON WHY THIS IS BEING DONE HERE INSTEAD OF IN ANGULAR IS BECAUSE IT WON'T LOOK AT THE DIRECTIVES IF ANYTHING IS CAUSING THE FORMS TO READ FALSE, SO THESE CHECKS WON'T HAPPEN THERE. . .

    I TRIED TO DO THIS ALL IN ANGULAR, BUT THIS PART COULDN'T CO-EXIST
    */

    empower_reg_form_jquery();


});

function empower_reg_form_jquery() {

    //USERNAME:  IN BETWEEN 3 & 20, ONLY LETTERS OR NUMBERS
    var username_input =  $("#username_input");
    var username_string_length = $("#username_string_length");
    var username_char_check = $("#username_char_check");
    var LETTERS_NUMBERS_REGEXP = /^[a-zA-Z0-9]*$/;

    function on(id){
        id.removeClass("orange");
        id.addClass("green");


        if(id.text().charAt(0) !== "✔")
            id.prepend("✔ ")
    }
    function off(id){
        id.addClass("orange");
        id.removeClass("green");

        if(id.text().charAt(0) == "✔")
            id.text(id.text().substring(2))
    }



    var password_input = $("#password_input");
    var password_length_check = $("#password_length_check");
    var password_uppercase_check = $("#password_uppercase_check");
    var password_lowercase_check = $("#password_lowercase_check");
    var password_number_check = $("#password_number_check");
    var UPPERCASE_REGEXP = /(?=.*[A-Z])/;
    var LOWERCASE_REGEXP = /(?=.*[a-z])/;
    var NUMBERS_REGEXP = /\d/;


    username_input.bind("change paste keydown", function () {

        var val = $(this).val();

        if (val.length >= 3 && val.length <= 20) {
            on(username_string_length)
        }
        else {
            off(username_string_length);
        }

        if (LETTERS_NUMBERS_REGEXP.test(val)) {
            on(username_char_check);
        }
        else {
            off(username_char_check);
        }
    });

    password_input.bind("change paste keyup", function () {

        var val = $(this).val();

        if (val.length >= 6 && val.length <= 20) {
            on(password_length_check);
        }
        else {
            off(password_length_check);
        }

        if (NUMBERS_REGEXP.test(val)) {
            on(password_number_check);
        }
        else {
            off(password_number_check);
        }

        if (LOWERCASE_REGEXP.test(val)) {
            on(password_lowercase_check);
        }
        else {
            off(password_lowercase_check);
        }

        if (UPPERCASE_REGEXP.test(val)) {
            on(password_uppercase_check);
        }
        else {
            off(password_uppercase_check);
        }
    });
};