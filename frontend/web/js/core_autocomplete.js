/**
 * библиотека для автозаполнения поля input
 *
 * 23.07.16 Ганенко Кирилл @LudwigFonMeier
 * Ver 0.1.230715
 * 
 *
 * 08.05.15 Ганенко Кирилл @LudwigFonMeier
 * Ver 0.1.120515
 */



var OBJ_AUTOFILL_LIST = '#ludwig_autocomplete_list';
var OBJ_ACTIVE_INPUT_ELEMENT = '#ludwigAL_active';
var OBJ_ACTIVE_LIST_ELEMENT = '#AL_active';

var ATTR_AUTOFILL_LIST = 'ludwig_autocomplete_list';
var ATTR_ACTIVE_LIST_ELEMENT = 'AL_active';
var ATTR_ACTIVE_INPUT_ELEMENT = 'ludwigAL_active';

var ATTR_RECID = 'recid';

/**
 * @param delayAL_timeout - индекс задержки вывода выпадающего списка
 * @param delayAL_AF_timeout - индекс задержки автозаполнения поля input
 */

var delayAL_timeout_id = null;
var delayAL_AF_timeout_id = null;

$(document).ready(function(){

    /** делает активным элемент списка, на котором находится курсор */
    $(document).on('mouseover', OBJ_AUTOFILL_LIST+' li', function(){
        unbindActiveDropDownListElement();
        $(this).attr('id', ATTR_ACTIVE_LIST_ELEMENT);
    });




    /** при клике мыши на элементе списка его данные переносим в input*/
    $(document).on('click', OBJ_AUTOFILL_LIST+' li', function(event){
        $(document).trigger('clickOnListItem');
    });



    /** отмена действий по умолчанию, при нажатии ESC*/
    $(document).on('input', OBJ_ACTIVE_INPUT_ELEMENT, function(event){
        event.keyCode == KEY_ESC ? event.preventDefault():false;
    });
    /** отмена действий по умолчанию, при нажатии ESC*/



    /** событие изменения значения активного input */
    $(document).on('input', OBJ_ACTIVE_INPUT_ELEMENT, function(){
        $(document).trigger('activeInputChange', $(OBJ_ACTIVE_INPUT_ELEMENT));
    });
    /** событие изменения значения активного input */


    /** событие потери фокуса активным input */
    $(document).on('focusout', OBJ_ACTIVE_INPUT_ELEMENT, function(event){
        if (!$(OBJ_ACTIVE_INPUT_ELEMENT).hasAttr(ATTR_RECID) && !(usingList())) {
            $(document).trigger('activeInputFocusOut', $(OBJ_ACTIVE_INPUT_ELEMENT));
        }
    });
    /** событие потери фокуса активным input */

});



/**
 * ludwig_autocomplete - назначает элементу input
 * возможность автозаполнения значения
 *
 * @param delayList - задержка перед выводом списка
 * @param delayAutoFill - задержка перед заполнением поля input
 * @param minChar - минимальное количество символов для срабатывания
 * @param autoFill - заполняется ли поле input
 * @param list - общий список значений вида {id:value,id:value,id:value,...}
 * @param maxItems - число элементов в выпадающем списке
 * @param capitalLetter - переводит первую букву в верхний регистр
 */

jQuery.fn.ludwig_autocomplete = function(options, event){
    var input = $(this);
    //если какую-то из этих кнопок нажали, то работаем со списком
    if (   (event.keyCode == KEY_UP) || (event.keyCode == KEY_DOWN)
        || (event.keyCode == KEY_ENTER) || (event.keyCode == KEY_ESC)
        || (event.keyCode == KEY_TAB)) {

        //если список отображается (существует на странице)
        if (usingList()){
            event.preventDefault();

            var AL_countOfElements = $(OBJ_AUTOFILL_LIST+' li').length;
            var AL_indexOfActiveElement = $(OBJ_ACTIVE_LIST_ELEMENT).index();

            switch (event.keyCode) {
                case KEY_UP:
                    //если выбран первый элемент и список из >1 элемента
                    if (AL_indexOfActiveElement == 0 && AL_countOfElements > 1) {
                        unbindActiveDropDownListElement();
                        //выбираем последний элемент
                        $(OBJ_AUTOFILL_LIST + ' li:last').attr('id', ATTR_ACTIVE_LIST_ELEMENT);
                    } else //иначе переходим на предыдущий элемент
                    if (AL_indexOfActiveElement != 0) {
                        unbindActiveDropDownListElement();
                        $(OBJ_AUTOFILL_LIST + ' li:eq(' + (AL_indexOfActiveElement - 1) + ')').attr('id', ATTR_ACTIVE_LIST_ELEMENT);
                    }
                break;

                case KEY_DOWN:
                    //если выбран последний элемент, а список состоит из >1 элемента
                    if (AL_indexOfActiveElement == (AL_countOfElements - 1) && AL_countOfElements > 1) { //
                        unbindActiveDropDownListElement();
                        //выбираем первый элемент списка
                        $(OBJ_AUTOFILL_LIST + ' li:first').attr('id', ATTR_ACTIVE_LIST_ELEMENT);
                    } else // иначе переходим на следующий элемент (тот, что снизу)
                    if (AL_countOfElements != 1) {
                        unbindActiveDropDownListElement();
                        $(OBJ_AUTOFILL_LIST + ' li:eq(' + (AL_indexOfActiveElement + 1) + ')').attr('id', ATTR_ACTIVE_LIST_ELEMENT);
                    }
                break;

                case KEY_ENTER:
                   // console.log('устанавливаем элементу input атрибуты выбранного элемента списка');
                    setAttrFromDropDownListItem();
                break;

                case KEY_ESC:
                    removeIdActiveInput(ATTR_ACTIVE_INPUT_ELEMENT);
                    removeDropDownList();
                break;

                case KEY_TAB:
                    //console.log('tab key in autocomplete');
                    removeIdActiveInput(ATTR_ACTIVE_INPUT_ELEMENT);
                    $(document).trigger('activeInputFocusOut', $(OBJ_ACTIVE_INPUT_ELEMENT));
                break;

            }
        }
    } else autocomplete();

    function autocomplete(){
        //переназначение поля ввода

        if (!$(input).isActiveInput()){
            setActiveInput(input);
        }


        clearTimeout(delayAL_timeout_id);
        clearTimeout(delayAL_AF_timeout_id);

        options = options || {};

        options.delayList       = options.delayList     || 400;
        options.displayList     = options.displayList   || false;
        options.delayAutoFill   = options.delayAutoFill || 400;
        options.minChar         = options.minChar       || 2;
        options.autoFill        = options.autoFill      || false;
        options.list            = options.list          || ['Value 1', 'Value 2', 'Value 3'];
        options.maxItems        = options.maxItems      || 20;
        options.capitalLetter   = options.capitalLetter || false; //первая буква будет заглавной
        options.selectText      = options.selectText    || false;


        /** перевод первой букву в верхний регистр (опционально) */
        options.capitalLetter ? input.val(input.val().charAt(0).toUpperCase() + input.val().substr(1)): false;



        if (input.val().length >= options.minChar) {
            // запускаем поиск в локальном массиве
            id_items = findItems(input.val(), options.list);

            if (id_items.length > 0) {
                // Нашли подходящие записи. Создаем выпадающий список и выводим его через заданный интервал времени
                dropDownAL = generateDropDownList(options.list, id_items, options.maxItems);
                    delayAL_timeout_id = (setTimeout(function () {
                        displayDropDownList(dropDownAL, input, options.displayList);
                    }, options.delayList));

                //автодополнение строки (опционально)
                if (options.autoFill) {

                    delayAL_AF_timeout_id = (setTimeout(function () {
                        autoFill(input, options.selectText);
                    }, options.delayAutoFill));
                }
            } else {
                /** ничего не нашли */
                removeDropDownList();

            //TODO вот тут можно написать алгоритм при котором список будет пропадать,
            //TODO только тогда когда +1 символ не дает рез-ов поиска
            //TODO как в той статье на habrahabr
            }
        } else {
            removeDropDownList();
            removeAttrRecIdActiveInput();
            removeIdActiveInput();
        }
    }
};

/**
 * autoFill - заполняет Input значением из первого элемента списка, а также готовит данные
 * для подсвечивания текста, коотрый программно дописывается в Input
 * @param input
 *
 * подставить значение элемента списка, который наиболее подходит
 * (проверка на позицию вхождения)
 */

function autoFill(input, selectText){
    sourceText = input.val();
    sourceLen = sourceText.length;
    text = $(OBJ_AUTOFILL_LIST+' li:first').text();


    if (text.length >0) {
        input.val(text);
        input.attr(ATTR_RECID, $(OBJ_AUTOFILL_LIST+' li:first').attr(ATTR_RECID));

        if (selectText) {
            (sourceLen != text.length) ?
                input.selectRange(sourceLen, text.length)
                :
                input.selectRange(0, text.length);
        }
    }
    $(document).trigger('autocompleteDone', input);
}

/** функция переносит заданные атрибуты и значения элемента списка текущему полю ввода (input) */
function setAttrFromDropDownListItem(){
    var obj_active_input_element = $(OBJ_ACTIVE_INPUT_ELEMENT);
    var obj_active_list_element = $(OBJ_ACTIVE_LIST_ELEMENT);

    //выбранное значение (текст) переносим в активное поле ввода
    obj_active_input_element.val(obj_active_list_element.text());

    /** по умолчанию ID полученной записи хранится в атрибуте "al" элемента списка*/
    obj_active_list_element.hasAttr(ATTR_RECID) ?
        obj_active_input_element.attr(ATTR_RECID, obj_active_list_element.attr(ATTR_RECID))
        :
        false;
    $(document).trigger('autocompleteDone', [obj_active_input_element]);
}


/**
 * findItems - находт индексы подходящий записей
 * в исходном массиве значений
 *
 * @param userText - текст, который пользователь ввел в поле input
 * @param list - options.list - исходный массив значений
 * @returns idItems - массив, хранящий индексы элементов с подхлжящими
 * значениями из исходного массива значений options.list
 *
 * поиск без учета регистра
 * charPos = str[1].toLowerCase().indexOf(userText.toLowerCase());
 *
 * поиск с учетом регистра
 * charPos = str[1].indexOf(userText));
 */

function findItems(userText, list){
    var idItems = [];

    for (var i = 0; i < list.length; i++){
        var str = (list[i].length == 1) ? list[i][0] : list[i][1];


        var charPos = str.toLowerCase().indexOf(userText.toLowerCase());

        (charPos > -1) ? idItems.push([i,charPos]) : false;

    }

    (idItems.length > 0) ? idItems.sort(sort_charPos): false;

    return idItems;
}

/**
 * sort_charPos - сортировка по позиции вхождения введенных пользователем символов
 */
function sort_charPos(i, ii){
    if (i[1] > ii[1]) return 1;
    else if (i[1] < ii[1]) return -1;
    else return 0;
}




/**
 * displayDropDownList - отображает на странице список подходящих значений
 *
 * dropdownAL - HTML - список значений
 * input - поле, под которым выводится список
 * displayList - переключатель. true - список видим, false - список невидим
 */
function displayDropDownList(dropDownAL, input, displayList){
    removeDropDownList();
    $('body').append(dropDownAL);
    if (displayList) {
        x = input.offset();
        w = input.width();
        $(OBJ_AUTOFILL_LIST).css({
            'position': 'absolute',
            'top': x.top + 25 + 'px',
            'left': x.left + 2.5 + 'px',
            'width': w + 4 + 'px',
            'display': 'block'
        });
    } else {
        $(OBJ_AUTOFILL_LIST).css({
            'display': 'none'
        });
    }
 }


function removeDropDownList(){
    $(OBJ_AUTOFILL_LIST).remove();
}

function removeAttrRecIdActiveInput(){
    //console.log('удаляю recid');
    $(OBJ_ACTIVE_INPUT_ELEMENT).removeAttr(ATTR_RECID);
}

function removeIdActiveInput(){

    $(OBJ_ACTIVE_INPUT_ELEMENT).removeAttr('id', ATTR_ACTIVE_INPUT_ELEMENT);

}

function setActiveInput(input){
   // console.log('добавляю id активного input '+$(input).attr('class'));
    $(OBJ_ACTIVE_INPUT_ELEMENT).removeAttr('id', ATTR_ACTIVE_INPUT_ELEMENT);
    $(input).attr('id', ATTR_ACTIVE_INPUT_ELEMENT);
}

/** снимает выделение с кативного элемента списка*/
function unbindActiveDropDownListElement(){
    $(OBJ_ACTIVE_LIST_ELEMENT).removeAttr('id');
}


/**
 * selectRange - выделяет текст, который был дописан программно в Input
 * @param start
 * @param end
 */
$.fn.selectRange = function(start, end) {
    var e = document.getElementById($(this).attr('id'));

    if (!e){
        return;
    }
    else if (e.setSelectionRange) { e.focus(); e.setSelectionRange(start, end); } /* WebKit */
    else if (e.createTextRange) { var range = e.createTextRange(); range.collapse(true); range.moveEnd('character', end); range.moveStart('character', start); range.select(); } /* IE */
    else if (e.selectionStart) { e.selectionStart = start; e.selectionEnd = end; }
};




/**
 * generateDropDownList - создание из массива данных списка подходящий значений
 *
 * @param list - массив со всеми возможными значениями
 *
 * @param idItems - массив содержит индексы елементов массива list, это те элементы, которые найдены поиском по
 * введенному пользователю значению
 *
 * @param maxItems - максимальное количество пунктов списка
 *
 * @var dropDownList - строка с HTML разметкой списка
 * @var recid - строка, содержит все значения очередного элемента списка list
 *
 */
function generateDropDownList(list, idItems, maxItems){
    var dropDownList = '<ul id="'+ATTR_AUTOFILL_LIST+'">';
    //console.log(list);

    //ограничение списка (количества элементов)
    maxItems = (maxItems > idItems.length) ? idItems.length : maxItems;

    //формируем список
    for (var i = 0; i < maxItems; i++) {
        //строка, в ней содержатся все значения записи
        var recid ='';

        //количество значений записи
        var paramCount = list[idItems[i][0]].length;
        for (var j = 0; j < paramCount; j++ ){

            recid += list[idItems[i][0]][j];

            //добавляем разделитель значений
            recid += (j < paramCount-1 ) ?  '::': '';
        }
        //формируем пункты списка, если пункт в списке первый. то делаем его активным (выбранным)
        x = (paramCount == 1) ? 0 : 1;

        recid = recid.replace(/"/g, "'");
        (i == 0) ?
            dropDownList += '<li recid="' +recid + '" id="'+ATTR_ACTIVE_LIST_ELEMENT+'">' + list[idItems[i][0]][x] + '</li>'
            :
            dropDownList += '<li recid="' + recid + '" >' + list[idItems[i][0]][x] + '</li>';
    }

    dropDownList += '</ul>';

    return dropDownList;
}

/** используется ли сейчас автозаполнение */
function usingList(){
    return ($(OBJ_AUTOFILL_LIST).length > 0);
}


$.fn.isActiveInput = function() {
    return $(this).attr('id') == ATTR_ACTIVE_INPUT_ELEMENT;
};