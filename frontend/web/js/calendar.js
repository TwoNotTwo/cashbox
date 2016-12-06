$(document).ready(function () {
    getCalendar(new Date().getFullYear(), new Date().getMonth());

    document.querySelector('.calendar-box').onchange = function Kalendar3() {
        getCalendar(
            $('.calendar-box__year-select').val(),
            $('.calendar-box__month-select :selected').val()
        );
    };

    //показать/скрыть календаоь
    $(document).on('click', '.calendar-toggle', function (event) {
        $('.calendar-box').toggleClass('calendar-box_visible');
        /** плохая идея так устанавливать позицию */
        $('.calendar-box').css({left: '28%'});
    });

});


//формирование разметки календаря
function getCalendar(year, month) {
    month = parseFloat(month);

    // номер последнего дня месяца в выбранном году
    Dlast = new Date(year, month+1, 0).getDate();

    //Sun Jul 31 2016 00:00:00 GMT+0300
    D = new Date(year, month, Dlast);

    //номер дня на котором заканчивается месяц (Пн-1, Сб-6, Вс-0)
    DNlast = D.getDay();

    //номер дня с которого начинается месяц (Пн-1, Сб-6, Вс-0)
    DNfirst = new Date(D.getFullYear(), D.getMonth(), 1).getDay();

    //список месяцев
    m = $('.calendar-box__month-select option[value="' + D.getMonth() + '"]');

    //счетчик годов
    g = $('.calendar-box__year-select');

    calendar = '<tr>';

    //для правильной позиции начала нумерации
    //т.е если нужно, будут созданы пустые ячейки
    if (DNfirst != 0) {
        for(var i = 1; i < DNfirst; i++)
            calendar += '<td>';
    } else {
        for(var i = 0; i < 6; i++)
            calendar += '<td>';
    }



    for (var i = 1; i <= Dlast; i++) {
        if (i == new Date().getDate() && D.getFullYear() == new Date().getFullYear() && D.getMonth() == new Date().getMonth()) {
            calendar += '<td class="calendar-box__table__tbody__item_today calendar-box__table__tbody__item">' + i;
        } else {
            /* if (  // список официальных праздников
             (i == 1 && D.getMonth() == 0 && ((D.getFullYear() > 1897 && D.getFullYear() < 1930) || D.getFullYear() > 1947)) || // Новый год
             (i == 2 && D.getMonth() == 0 && D.getFullYear() > 1992) || // Новый год
             ((i == 3 || i == 4 || i == 5 || i == 6 || i == 8) && D.getMonth() == 0 && D.getFullYear() > 2004) || // Новый год
             (i == 7 && D.getMonth() == 0 && D.getFullYear() > 1990) || // Рождество Христово
             (i == 23 && D.getMonth() == 1 && D.getFullYear() > 2001) || // День защитника Отечества
             (i == 8 && D.getMonth() == 2 && D.getFullYear() > 1965) || // Международный женский день
             (i == 1 && D.getMonth() == 4 && D.getFullYear() > 1917) || // Праздник Весны и Труда
             (i == 9 && D.getMonth() == 4 && D.getFullYear() > 1964) || // День Победы
             (i == 12 && D.getMonth() == 5 && D.getFullYear() > 1990) || // День России (декларации о государственном суверенитете Российской Федерации ознаменовала окончательный Распад СССР)
             (i == 7 && D.getMonth() == 10 && (D.getFullYear() > 1926 && D.getFullYear() < 2005)) || // Октябрьская революция 1917 года
             (i == 8 && D.getMonth() == 10 && (D.getFullYear() > 1926 && D.getFullYear() < 1992)) || // Октябрьская революция 1917 года
             (i == 4 && D.getMonth() == 10 && D.getFullYear() > 2004) // День народного единства, который заменил Октябрьскую революцию 1917 года
             ) {
             calendar += '<td class="calendar-box__table__tbody__item_holiday">' + i;
             }else{*/
            calendar += '<td class="calendar-box__table__tbody__item">' + i;
        }

        calendar += '</td>';

        
        if (new Date(D.getFullYear(), D.getMonth(), i).getDay() == 0 && i < Dlast) {
            calendar += '<tr>';
        }
    }

    /*
     for(var  i = DNlast; i < 7; i++)
     calendar += '<td>&nbsp;';
     */
    $('.calendar-box__table__tbody').html(calendar);

    g.val(D.getFullYear());
    m.attr('selected', 'selected');

    if ($('.calendar-box__table__tbody tr').length < 6) {
        $('.calendar-box__table__tbody').html += '<tr><td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;';
    }

    $('.calendar-box__month-select option[value="' + new Date().getMonth() + '"]').css('color', 'rgb(220, 0, 0)'); // в выпадающем списке выделен текущий месяц

    /*
     if (document.querySelectorAll('.'+id+' tbody tr').length < 6) {
     document.querySelector('.'+id+' tbody').innerHTML += '<tr><td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;';
     }
     document.querySelector('.calendar-box__month-select option[value="' + new Date().getMonth() + '"]').style.color = 'rgb(220, 0, 0)'; // в выпадающем списке выделен текущий месяц
     */
}



//скрыть календарь
function closeCalendar(){
    $('.calendar-box').removeClass('calendar-box_visible');
}



//нажатие на день в календаре
$(document).on('click', '.calendar-box__table__tbody__item', function(event){
    $('.calendar-box__table__tbody__item_selected').removeClass('calendar-box__table__tbody__item_selected');
    $(this).addClass('calendar-box__table__tbody__item_selected');
});



//вернет дату в указанной маске
function getCalendarDate(){
    day = parseFloat($('.calendar-box__table__tbody__item_selected').html());
    day = (day >= 10) ? day: '0'+day;
    month = parseFloat($('.calendar-box__month-select').val())+1;
    month = (month >= 10) ? month: '0'+month;
    year = parseFloat($('.calendar-box__year-select').val())%100;

    return (day+'.'+month+'.'+year);


}