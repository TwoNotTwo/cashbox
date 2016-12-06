/**
 * Created by Ganenko.k on 09.09.2015.
 */

/** клавиши */
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_ENTER = 13;
var KEY_ESC = 27;
var KEY_TAB = 9;
var KEY_BACKSPACE = 8;
var KEY_DELETE = 46;
/** клавиши */


/** обработка введенной даты
 * Длина должна быть хотябы 4 цифры
 * */
function dateMask(val, checkDate){
    checkDate = checkDate || false; //делать ли проверку даты
    var array_of_possible_dates = [];

    /** функция проверки даты, принимает значение и диапазоны */
    function check_range(data, minValue, maxValue, correctData){
        correctData = correctData || false;
        data = Number(data);
        check = (data >= minValue && data <=maxValue) ? (correctData)?data:true : (correctData)? (data < minValue)? minValue:maxValue: false;
        return check;
    }


    //удаляю все символы кроме цифр
    val = keepOnlyNumbers(val);//val.replace(/\D/g,"");

    if (val.length >= 4){
        // обрезаем введенное значение до 6-ти символов
        (val.length > 6) ? val = val.substr(0,6):false;

        if (checkDate) {
            /** Указать место/значение начальной даты */
            starting_date = $('#cashbox_datepicker').val();
            /** Указать место/значение начальной даты */
            // длина даты без года (год ВСЕГДА две цифры)
            dateLength = val.length - 2;

            /** год */
            year = val.substr(dateLength,2);

            dayMonth = val.substr(0,dateLength);

            dayMonthLength = (dayMonth+'').length;

            switch(dayMonthLength){
                case 2:
                    day = dayMonth.substr(0,1);
                    month = dayMonth.substr(1,1);

                    day = (day >0) ? day: 1;
                    month = (month >0) ? month:1;

                    array_of_possible_dates.push('0'+day+'0'+month+year);
                    break;

                case 3:
                    day = Number(dayMonth.substr(0,2));
                    month = Number(dayMonth.substr(1,2));

                    //диапазоны
                    day_range = check_range(day, 1, 31);
                    month_range = check_range(month, 1, 12);

                    //таблица истинности
                    day = !day_range && month_range ? Number(String(day).substr(0,1)): day;
                    month = day_range && !month_range ?  Number(String(month).substr(1,1)) : month;

                    day_range = check_range(day, 1, 31);
                    month_range = check_range(month, 1, 12);

                    (day_range && month_range) ?
                        (month < 10 && day < 10) ?
                            array_of_possible_dates.push('0'+String(day).substr(0,1)+'0'+String(month).substr(0,1)+''+year)
                            :
                            (month < 10) ?
                                array_of_possible_dates.push(''+day+'0'+String(month).substr(0,1)+''+year)
                                :
                                (month == 10) ?
                                    array_of_possible_dates.push('0'+String(day).substr(0,1)+''+month+''+year)
                                    :
                                    false
                        :
                        (!day_range) ?
                            array_of_possible_dates.push('0'+String(day).substr(0,1)+''+month+''+year)
                            :
                            (!month_range) ?
                                array_of_possible_dates.push(''+day+'0'+String(month).substr(0,1)+''+year)
                                :
                                false;
                    break;

                case 4:
                    day = Number(dayMonth.substr(0,2));
                    month = Number(dayMonth.substr(2,2));
                    day_range = check_range(day, 1, 31);
                    month_range = check_range(month, 1, 12);

                    if (day_range && month_range){
                        (day < 10 ) ? day='0'+day: false;
                        (month < 10) ? month = '0'+month: false;
                        array_of_possible_dates.push(''+day+''+month+''+year);
                    }
                    break;
            }
            val = check_date(array_of_possible_dates, starting_date);
        }
        //разбиваю по две цифры
        result = val.substr(0, 2) + '.' + val.substr(2, 2) + '.' + val.substr(4, 2);

    } else result = '';
    return result;
}

/**
 * array_of_possible_dates - возможные даты (без даты отсчета)
 * starting_date - дата отсчета, это может быть текущая дата или та, что используется
 */
function check_date(array_of_possible_dates, starting_date){
    array_of_possible_dates.push(starting_date);

    for (i=0; i<array_of_possible_dates.length; i++){
        array_of_possible_dates[i] = keepOnlyNumbers(array_of_possible_dates[i]);//.replace(/\D/g,"");
        array_of_possible_dates[i] = array_of_possible_dates[i].substr(0,2)+'.'+array_of_possible_dates[i].substr(2,2)+'.'+array_of_possible_dates[i].substr(4,2);
    }
    //сортируем даты по возрастанию
    for (i= 0; i <(array_of_possible_dates.length-1); i++){
        current = array_of_possible_dates[i];
        current = current.split('.');

        next = array_of_possible_dates[i+1];
        next = next.split('.');

        for ($j=0; $j<3; $j++){
            current[$j] += 0;
            next[$j] += 0;
        }

        if (current[2] < next[2]) {
            do_replace = true;
        } else {
            if (current[2] <= next[2] && current[1]< next[1]) {
                do_replace = true;
            } else {
                if (current[2] <= next[2] && current[1] <= next[1] && current[0] < next[0]) {
                    do_replace = true;
                } else {
                    do_replace = false;
                }
            }
        }

        if (do_replace == true){
            tmp = array_of_possible_dates[i];
            array_of_possible_dates[i] = array_of_possible_dates[i+1];
            array_of_possible_dates[i+1] = tmp;
            i=-1;
        }
    }


    switch (array_of_possible_dates.length){
        case 2:
            if (starting_date == array_of_possible_dates[0]){
                result = array_of_possible_dates[1];
            } else {
                if (starting_date == array_of_possible_dates[1]){
                    result = array_of_possible_dates[0]
                }
            }
            break;
        case 3:
            if (starting_date == array_of_possible_dates[0]){
                result = array_of_possible_dates[1];
            } else {
                if (starting_date == array_of_possible_dates[1]){
                    result = array_of_possible_dates[2];
                } else {
                    if (starting_date == array_of_possible_dates[2]){
                        result = starting_date;
                    }
                }

            }
            break;

        default : result = '00.00.00'; break;
    }
    result = keepOnlyNumbers(result);
    return result;
}

/**
 * moneyMask - приводит к денежному виду строку
 * @param val - введенное значение
 * @returns {string} - строку вида 1234.56
 */
function moneyMask(val){
    val +='';
    val = val.replace(/[^0-9\-\,\.]/gi, '');
    if (val.length > 0){
        val = val.replace(/\,/gi, ".");
        dotCount = val.split('.').length-1;
        while (dotCount >1){
            val = val.replace('.', "");
            dotCount = val.split('.').length-1;
        }
        pos = val.indexOf('.');
        if (pos==-1 || val.length-pos == 1){
            val+='.00';
            pos = val.indexOf('.');
        }

        if (val.length-pos == 2){
            val +='0';
        }
        var len = (val.substr(0,pos-1)).length;
        var cut_count = Math.floor(len/3);
        var result = '';
        for (var i=1; i<=cut_count; i++){
            result= val.substr(len-2*i,3)+' '+result;
            len--;
        }
        len--;
        if (cut_count >0){
            result = val.substr(0,len-2*cut_count+2)+' '+result.substr(0,result.length-1)+val.substr(pos,3);
        } else {
            result = val.substr(0,len-2*cut_count+2)+result.substr(0,result.length-1)+val.substr(pos,3);
        }
    } else {
        result = '';
    }
    return result+'';
}


$.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined;
};

//убирает из строки все кроме цифр
function keepOnlyNumbers(str){
    return str.replace(/\D/g, "");
}
