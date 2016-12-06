/**
 * Created by Pentalgin on 02.07.2016.
 */
$(document).ready(function () {
    //console.log('context menu is loaded');

//контекстное меню
/*
  $(document).on('click', '.context-menu ul li', function (event) {
        event.preventDefault();
    });
*/
    //создает макет контекстного меню HTML разметка
    function generateContextMenu(items, event) {
        //items - массив элементов контекстного меню вида:
        // [label, url, icon, action (class - identifier) ]

        contextmenu = '<div class="context-menu"><ul>';

        for (var i = 0; i < items.length; i++) {

            label = items[i][0];
            url = items[i][1];
            icon = items[i][2];
            id = items[i][3];


            contextmenu += '<li>';

            contextmenu += '<div>' +
            '<a href="' + url + '" class="' + id + '">' + label + '</a>' +
            '<span class="' + icon + '"></span>' +
            '</div>';

            contextmenu += '</li>';
        }

        //из массива переменной параметра items создадин пункты контекстного меню


        contextmenu += '</ul></div>'; //close context-menu


        //return contextmenu;
        $('body').append(contextmenu);
        //console.log(event.pageX);
        $('.context-menu').css('top', event.pageY);
        $('.context-menu').css('left', event.pageX);


        $('.context-menu').toggleClass('context-menu_active');

    }
});

//создает макет контекстного меню HTML разметка
function generateContextMenu(items, event){
    //items - массив элементов контекстного меню вида:
    // [label, url, icon, action (class - identifier) ]

    contextmenu = '<div class="context-menu"><ul>';

    for (var i=0; i<items.length; i++){

        label = items[i][0];
        url = items[i][1];
        icon = items[i][2];
        id = items[i][3];


        contextmenu += '<li>';

        contextmenu +=
            '<div class="'+id+'">' +
                '<a href="'+url+'" >'+label+'</a>' +
                '<span class="'+icon+'"></span>' +
            '</div>';

        contextmenu += '</li>';
    }

    //из массива переменной параметра items создадин пункты контекстного меню

    contextmenu += '</ul></div>'; //close context-menu

    //return contextmenu;
    $('body').append(contextmenu);

    $('.context-menu').css('top',event.pageY);
    $('.context-menu').css('left',event.pageX);

    $('.context-menu').toggleClass('context-menu_active');
}

function closeContextMenu(){
    $('.context-menu').remove();

}


//контекстное меню