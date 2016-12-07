/**
 * Created by Ganenko.k on 07.12.2016.
 */

$(document).ready(function(){

    $('.find-duplicate').on('click', function(event){
        $.ajax({
            url: '/cashbox/client/find-uncorr-initials',
            type: 'POST',
            async: false,
            success: function(answer){
                $('.client-body').html(answer)
            },
            error: function(answer){
                console.log('Error finding uncorrect initials. '+answer);
            }
        })
    });
});
