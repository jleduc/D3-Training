$(document).ready(function(){

    // Hide submit button if field is empty
    $('form input').keyup(function(){
        if($('#input1').val() == ""){
            $('#input2').hide();
        }
        else {
            $('#input2').show();
        }
    });
/*    // Don't submit form if field is empty
    $('form').submit(function(){
    if($('#1').val() == ""){
        return false;
    }
    });
*/

});