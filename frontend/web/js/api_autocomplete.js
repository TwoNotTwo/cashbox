/**
 * @ list_server - массив данных, полученный от сервера
 *
 * @ *_list_client - массив актуальных данных у пользователя
 * @ *_list_tmp - временный массив, используется для проверки актуальности данных
 */
list_server='';


manager_list_client=[];
manager_list_tmp='';

client_list_client=[];
client_list_tmp='';

var delay_updating_of_local_arrays = 60000; //60000 - 60 секунд

$(document).ready(function(){
    /** получение из БД всех записей. Записи вносятся в массивы и используются для генерации выпадающих списков*/
    new get_Sellers();
    new get_sourceList('manager');
    new get_sourceList('client');


    /** повторное получение/обновление массивов данных кажды N мс */
    setInterval(function (){
        new get_sourceList('manager');
        new get_sourceList('client');
    }, delay_updating_of_local_arrays);


    /** когда фокус уходит от input (активного), то введенное значение нужно обработать*/
    $(document).on('focusout', OBJ_ACTIVE_INPUT_ELEMENT, function(){
        var input = $(OBJ_ACTIVE_INPUT_ELEMENT);
        setTimeout(function(){
            /** де активирцем input*/
            remove_activeInputAttr_coreAL('id');
            /** убираем выпадающий список */
            remove_AL();
            /** отправляем введенное значение (объект input) на обработку*/
            workflow_api(input);
        },500);
    });

    $(document).on('keyup','.cashbox-report-table-client-input', function(event){
       api_fastAutocomplete($(this), event.keyCode);
    });

    $(document).on('keyup','.cashbox-report-table-document_date-input', function(event){
       api_fastAutocomplete($(this), event.keyCode);
    });
});

/**
 * keypress_BACKSPACE - дополнительная обработка нажатия клавиши BACKSPACE
 * принимает объект input и, в зависимости от его класса, запускает
 * указанный алгоритм
 *
 * !!! При использовании клавиши DELETE символ может быть и не удален, а обработка срабатывает !!!
 */
function keypress_BACKSPACE_or_DELETE(input){
    remove_activeInputAttr_coreAL('alid');

    switch (input.attr('class')){
        //клиент
        case 'cashbox-report-table-client-input':
            remove_activeInputAttr_coreAL('pc');
            var price_column = input.parent().next('td').children('.cashbox-report-table-price_column-input');
            price_column.removeAttr('alid');
            price_column.val('');
            break;
    }
}




/**
 * - ajax запрос отправляет данные на добавление в БД
 * @param controller - имя контроллера/модели с которой работать
 * @param data - данные на отправку
 */
function send_newRecord(controller, data, element){
    $.ajax({
        url: '/cashbox-'+controller+'/add-'+controller,
        type: 'POST',
        data: {'data':data},
        async: true,
        success: function(answer){
            answer = answer.split(':');
            switch (answer[0]){
                case '0':
                    get_sourceList(controller);
                    element.attr('alid', answer[1]);
                    element.addClass('AL_animation_newRecord_in');

                    setTimeout(function () {
                        element.addClass('AL_animation_newRecord_out');
                        setTimeout(function () {
                            element.removeClass('AL_animation_newRecord_out');
                            element.removeClass('AL_animation_newRecord_in');
                        }, 3000);
                    }, 3000);
                    break;

            }
        },
        error: function(answer){
            console.log('send_newRecord API. Ошибка при отправке запроса. Контроллер:"'+controller+'" Ответ сервера:'+answer);
        }
    });
}


function update_Record(controller, id, field, value){
    $.ajax({
        url: '/cashbox-'+controller+'/update-'+controller,
        type: 'POST',
        data: {'id': id, 'field': field, 'value': value},
        async: true,
        success: function(answer){
        },

        error: function(answer){
            console.log('API. Провал обновления записи. '+answer);
        }
    });
}
/**
 * update_Client_PriceColumn_AfterUpdateRecord - обновляет значения price column и ее атрибуты
 * на странице, у всех компаний с заданным id (alid)
 */
function update_Client_PriceColumn_AfterUpdateRecord(id, value){
    client = $('input[alid='+id+']');

    for (i=0; i< client.length; i++){
        input = $(client[i]);
        input.attr('pc', value);
        price_column = input.parents('.cashbox-report-table-row').children('td').children('.cashbox-report-table-price_column-input');
        price_column.attr('alid', value);
        price_column.val(value);
    }
}

/**
 * get_sourceList - ajax запрос к БД. Получает список всех записей указанной таблицы.
 *
 * @param controller - имя контроллера/модели с которой работать
 */
function get_sourceList(controller){
    $.ajax({
        url: '/cashbox-'+controller+'/'+controller+'-list',
        type: 'POST',
        async: true,
        success: function(answer){
            list_server = answer;
            compare_Arrays(controller);
        },

        error: function(answer){
            console.log("get_sourceList API. Ошибка при отправке запроса. "+controller+'. Ответ сервера:'+answer);
        }
    });


}

/**
 * compare_Arrays - сравнение массивов.
 * Если у пользователя не актуальный или пустой массив данных, то происходит обновление
 *
 * @param controller - имя контроллера/модели с которой работать
 */
function compare_Arrays(controller){
    switch (controller){
        case 'manager':
            if (list_server != manager_list_tmp) {
                manager_list_tmp = list_server;
                update_Arrays(controller);
            }
        break;

        case 'client':
            if (list_server != client_list_tmp) {
                client_list_tmp = list_server;
                update_Arrays(controller);
            }
            break;
        default :
            console.log('API. Ошибка сравнения массивов. Тип массива "'+controller+'" неизвестен');
            break;
    }
}

/**
 * update_Arrays - обновление данных массива пользователя на актуальные значения
 *
 * @param controller - имя контроллера/модели с которой работать
 */
function update_Arrays(controller){
    error = false;
    switch (controller){
        case 'manager':

            tmp = list_server.split(';');
            manager_list_client = [];
            for (i=0; i<tmp.length; i++){
                var id_name = tmp[i].split(':');
                var id = id_name[0];
                var name = id_name[1];
                manager_list_client[id] = name;
            }
            break;

        case 'client':
            tmp = list_server.split(';');
            client_list_client = [];
            for (i=0; i<tmp.length; i++){
                var data = tmp[i].split(':');
                var id = data[0];
                var clientName = data[1];
                var priceColumn = data[2];
                var managerID = data[3];
                client_list_client[id] =[clientName,priceColumn,managerID];
            }
            break;
        default :
            console.log('API. Ошибка обновления массива "'+controller+'". Проверьте имя');
            error = true;
            break;
    }
}

/**
 * отправка запроса к БД (список продавцов). Получает строку вида id:value;id:value
 */
function get_Sellers(){
    $.ajax({
        url: '/cashbox-seller/get-seller-list',
        type: 'POST',
        async: true,
        success: function(answer){
            generate_SellerList(answer);
        },
        error: function(answer){
            console.log('API. Ошибка получения списка продавцов. # '+answer);
        }
    })
}

/**
 * generate_SellerList - из строки вида id:value;id:value создает выпадающий список
 * и выводит его на страницу
 *
 * @param list - строка вида id:value;id:value
 */
function generate_SellerList(list){
    if (list.length >0){
        sellerList = '<select class="cashbox-seller-list">';
        sellers = list.split(';');
        for (i=0; i< sellers.length; i++){
            str = sellers[i].split(':');
            sellerList+='<option alid="'+str[0]+'">'+str[1]+'</option>';
        }
        sellerList+='</select>';

        $('.cashbox-seller-box').html(sellerList);
    }
}


/**
 * workflow_api - срабатывает, когда активный input (obj) теряет фокус.
 * В зависимости от его класса, выполняется определенный сценарий обработки
 * введенного значения (val)
 * Результат манипуляций приводит к стандартизации данных (нет лишних пробелов,
 * заглавные буквы где это нужно, добавление/обновление атрибутов)
 * функция так же ищет введенное значение в локальном массиве и отправляет их
 * в БД, если значение не найдено. При отправке в БД происходит поиск оного, и добавление
 * в случае отсутствия
 *
 */

function workflow_api(obj) {
    /** delay_addNewRecord - задержка перед отправлением запроса на проверку/добавление записи в БД */
    var delay_addNewRecord = 1000;

    /** controller -  значение прсваивается в зависимости от класса
     * необходим, при отправке данных на сервер
     * */
    var controller = '';

    /** id_items - это массив с индексами подходящих записей,
     * если он пуст, то данные (input.val()) отправляются на сервер для
     * дальнейшей обработки*/
    var id_items = [];

    /** удаляем пробелы в начале и в конце, и подряд идущие*/
    var obj_value = obj.val().replace(/^\s*/,'').replace(/\s*$/,'').replace(/\s+/g," ");
    obj_value = /\S/.test(obj_value)? obj_value: '';

  //  if (obj_value.length > 0) {
        if (obj.hasAttr('class')) {
            var obj_class = obj.attr('class');
            /** сценарий обработки, зависящий от класса obj (input)*/
            switch (obj_class) {
                //менеджер
                case 'cashbox-report-table-manager-input':

                    if (obj_value.length == 0){
                        var client_id = get_elementOfThisRow(obj, 'client').attr('alid');
                        client_list_client[client_id][2] = 0;
                        update_Record('client', client_id, 'manager_id', 0);
                        obj.removeAttr('alid');
                    } else {
                        id_items = find_Items(obj_value, manager_list_client);
                        controller = 'manager';
                        if (id_items.length == 0) {
                            var delay_waitingAlidManagerID = setInterval(function () {
                                if (obj.hasAttr('alid')) {
                                    clearInterval(delay_waitingAlidManagerID);
                                    var manager_id = obj.attr('alid');
                                    var client_id = get_elementOfThisRow(obj, 'client').attr('alid');
                                    if (manager_id > 0 && client_id > 0) {
                                        //дополняем id менеджера локальный массив клиентов
                                        if (client_list_client[client_id][2] != manager_id) {
                                            client_list_client[client_id][2] = manager_id;
                                            update_Record('client', client_id, 'manager_id', manager_id);
                                        }
                                    }
                                }
                            }, 100);
                        } else {
                            var manager_id = obj.attr('alid');
                            var client_id = get_elementOfThisRow(obj, 'client').attr('alid');
                            if (manager_id > 0 && client_id > 0) {
                                //дополняем id менеджера локальный массив клиентов
                                if (client_list_client[client_id][2] != manager_id) {
                                    client_list_client[client_id][2] = manager_id;
                                    update_Record('client', client_id, 'manager_id', manager_id);
                                }
                            }
                        }
                    }
                    break;
                //клиент
                case 'cashbox-report-table-client-input':
                    // массив возможных типов компаний
                    var array_of_client_types =
                        [
                            'ооо', 'ООО', 'Ооо',
                            'одо', 'ОДО', 'Одо',
                            'оао', 'ОАО', 'Оао',
                            'зао', 'ЗАО', 'Зао',
                            'ип ', 'ИП ', 'Ип ',
                            'тд ', 'ТД ', 'Тд '
                        ];
                    //перенос ИП, ООО и т.д. в конец строки из НАЧАЛА строки
                    for (var i = 0; i < array_of_client_types.length; i++) {
                        if (obj_value.indexOf(array_of_client_types[i]) == 0) {
                            obj_value = obj_value.substr(3, obj_value.length) + ' ' + obj_value.substr(0, array_of_client_types[i].length).toUpperCase();
                            break;
                        }
                    }
                    //удаляем лишние пробелы после перестановки типа клиента
                    obj_value = obj_value.replace(/^\s*/, '').replace(/\s*$/, '');

                    id_items = find_Items(obj_value, client_list_client);

                    controller = 'client';
                    break;


                case 'cashbox-report-table-price_column-input':
//                var delay_waitingAlidClient = 300;
                    var client_field = get_elementOfThisRow(obj,'client');
                    var priceColumn_value = obj.attr('alid');

                    //если вообще что-то введено
                    //if (client_value.length >0 ){
                    //  var delay_waitingAlidClientID = setInterval(function(){

                    if (client_field.hasAttr('alid')) {
                        //            clearInterval(delay_waitingAlidClientID);
                        var client_id = client_field.attr('alid');
                        // обновляем атрибуты client и запись в БД
                        if (priceColumn_value != client_list_client[client_id][1]) {
                            client_list_client[client_id][1] = priceColumn_value;
                            update_Record('client', client_id, 'price_column', priceColumn_value);
                        }
                    }

                    break;

            }
        }
        /** отправляем данные на сервер, если в локальном списке значений не найдено*/
        if (id_items.length == 0 && controller != '') {
            setTimeout(function () {
                new send_newRecord(controller, obj_value, obj);
            }, delay_addNewRecord);
        }
    /*} //endIF objVal.length >0
    else {
        obj.removeAttr('alid');
    }*/
    obj.val(obj_value);

}


/** сценарий заполнения полей и перехода по ним
 * срабатывает, если значение введено из выпадающего списка
 * */
function api_autocomplete_actionScript(input, element_of_the_list){

    switch (input.attr('class')){
        /** ввод клиента */
        case 'cashbox-report-table-client-input':
            // price column
            var priceColumn_field = get_elementOfThisRow(input, 'price_column');
            if (element_of_the_list.hasAttr('pc')){
                var priceColumn_value = element_of_the_list.attr('pc');
                if (priceColumn_value.length > 0){

                    priceColumn_field.attr('alid', priceColumn_value);
                    priceColumn_field.val(priceColumn_value);

                    if (priceColumn_value == 'ч/л'){
                        cashbox_addRowToTheEnd();

                    } else {
                        var documentDate_field = get_elementOfThisRow(input, 'document_date');
                        if (documentDate_field.val().length == 0) {
                            documentDate_field.focus();
                        }
                        var documentNumber_field = get_elementOfThisRow(input, 'document_number');
                        if (documentNumber_field.val().length == 0){
                            documentNumber_field.focus();
                        }
                    }

                } else {

                    priceColumn_field.focus();
                }
            } else {

                priceColumn_field.removeAttr('alid');
                priceColumn_field.val('');
                priceColumn_field.focus();
            }

            // manager
            var manager_field = get_elementOfThisRow(input, 'manager');
            if (element_of_the_list.hasAttr('m_id')){
                var manager_id = element_of_the_list.attr('m_id');
                if (manager_id > 0) {
                    var manager_name = manager_list_client[manager_id];
                    if (manager_name.length > 0 ) {

                        manager_field.attr('alid', manager_id);
                        manager_field.val(manager_name);
                    }
                } else {
                    manager_field.focus();
                }
            } else {
                manager_field.removeAttr('alid');
                manager_field.val('');
                manager_field.focus();
            }
            break;

        /** ввод менеджера */
        case 'cashbox-report-table-manager-input':
            var manager_id = input.attr('alid');
            var client_id = get_elementOfThisRow(input, 'client').attr('alid');
            if (manager_id >0 && client_id > 0 ){
                //дополняем id менеджера локальный массив клиентов
                if (client_list_client[client_id][2] != manager_id) {
                    client_list_client[client_id][2] = manager_id;
                    update_Record('client', client_id, 'manager_id', manager_id);
                }

            }
            var priceColumn_field = get_elementOfThisRow(input, 'price_column');
            if (priceColumn_field.val().length == 0 ){
                priceColumn_field.focus();
            } else {
                var documentNumber_field = get_elementOfThisRow(input, 'document_number');
                if (documentNumber_field.val().length == 0){
                    documentNumber_field.focus();
                } else {
                    var documentDate_field = get_elementOfThisRow(input, 'document_date');
                    if (documentDate_field.val().length == 0){
                        documentDate_field.focus();
                    } else {
                        cashbox_addRowToTheEnd();
                    }
                }

            }
            break;
        case 'cashbox-report-table-cost_type-input':
            var client = get_elementOfThisRow(input, 'client');
            client.focus();
            break;
    }
}


/** функция которая копирует содержимое верхней или нижней строки, при этом будут перенесены
 * атрибуты и запущен механизм автозаполнения
 *
 */
function api_fastAutocomplete(element, key){
    if (key == KEY_UP && element.attr('id') != 'ludwigAL_active') {
        var element_class = element.attr('class');
        var parent_class = element.parent().attr('class');

        switch (key) {
            //скопировать верхнюю строку
            case KEY_UP:
                var element_parent = element.parents('.cashbox-report-table-row');
                var upper_element_parent = element_parent.prev();

                var upper_element = upper_element_parent.children('.' + parent_class).children('.' + element_class);


                element.val(upper_element.val());
                if (upper_element.hasAttr('alid')) {
                    element.attr('alid', upper_element.attr('alid'));
                }

                switch (element_class) {
                    case 'cashbox-report-table-client-input':
                        //если мы копируем клиента, то необходимо перенести manager и price_column
                        //отследи значение ценовой колонки. Если там ч/л то создавай новую строку, если нет, то переводи фокус на номер документа
                        var upper_manager = upper_element_parent.children('.cashbox-report-table-manager').children('.cashbox-report-table-manager-input');
                        if (upper_manager.hasAttr('alid')) {
                            var manager = element_parent.children('.cashbox-report-table-manager').children('.cashbox-report-table-manager-input');
                            manager.val(upper_manager.val());
                            manager.attr('alid', upper_manager.attr('alid'));
                        }

                        var upper_priceColumn = upper_element_parent.children('.cashbox-report-table-price_column').children('.cashbox-report-table-price_column-input');
                        if (upper_priceColumn.hasAttr('alid')) {
                            var priceColumn = element_parent.children('.cashbox-report-table-price_column').children('.cashbox-report-table-price_column-input');
                            priceColumn.val(upper_priceColumn.val());
                            priceColumn.attr('alid', upper_priceColumn.attr('alid'));
                        }

                        if (priceColumn.val() == 'ч/л') {
                            cashbox_addRowToTheEnd();
                        } else {
                            element_parent.children('.cashbox-report-table-document_number').children('.cashbox-report-table-document_number-input').focus();
                        }
                        break;

                    case 'cashbox-report-table-document_date-input':
                        var upper_documentDate_value = upper_element_parent.children('.cashbox-report-table-document_date').children('.cashbox-report-table-document_date-input').val();
                        if (upper_documentDate_value.length > 0) {
                            element.val(upper_documentDate_value);
                            //теперь создадим новую строку
                            cashbox_addRowToTheEnd();
                        }

                        break;
                }
                break;

        }
    }
}

/** функция возвращает объект по имени. Объект находится в этойже строке*/
function get_elementOfThisRow(elementOfThisRow, nameOfNeedElement){
    return elementOfThisRow.parents('.cashbox-report-table-row').children('.cashbox-report-table-'+nameOfNeedElement).children('.cashbox-report-table-'+nameOfNeedElement+'-input');
}

/**
 * api_autocomplete_generateDropDownList - создание из массива данных выпдающего списка
 *
 * @param id_items - массив хранит индексы звписей исходного массива
 * значений
 * @param list_source - исходный массив значений
 *
 * @returns dropDownAL - HTML список значений
 */
function api_autocomplete_generateDropDownList(id_items, countItem, list_source, field){
    dropDownAL = '<ul id="'+ATTRIBUTE_AUTOFILL_LIST+'">';
    //ограничение списка (количества элементов)
    (countItem > id_items.length)? countItem = id_items.length
        : false;
    for (i = 0; i < countItem; i++) {
        /** 0 - id
         *  1 - text
         *  2 - price_column
         *  3 - manager_id
         * */


         switch (field){
            case 'cashbox-report-table-client-input':
                (i == 0) ?
                    dropDownAL += '<li al="' +id_items[i][0] + '" pc="' + list_source[id_items[i][0]][1] + '" m_id="'+list_source[id_items[i][0]][2]+'" id="'+ATTRIBUTE_ACTIVE_LIST_ELEMENT+'" >' + list_source[id_items[i][0]][0] + '</li>'
                    :
                    dropDownAL += '<li al="' + id_items[i][0] + '" pc="' + list_source[id_items[i][0]][1] + '" m_id="'+list_source[id_items[i][0]][2]+'">' + list_source[id_items[i][0]][0] + '</li>';
                break;

            case 'cashbox-report-table-manager-input':
                (i == 0) ?
                    dropDownAL += '<li al="' +id_items[i][0] + '" id="'+ATTRIBUTE_ACTIVE_LIST_ELEMENT+'">' + list_source[id_items[i][0]] + '</li>'
                    :
                    dropDownAL += '<li al="' + id_items[i][0]+ '" >' + list_source[id_items[i][0]] + '</li>';

                break;
            case 'cashbox-report-table-price_column-input':
                (i == 0) ?
                    dropDownAL += '<li al="' +list_source[id_items[i][0]] + '" id="'+ATTRIBUTE_ACTIVE_LIST_ELEMENT+'">' + list_source[id_items[i][0]] + '</li>'
                    :
                    dropDownAL += '<li al="' + list_source[id_items[i][0]] + '" >' + list_source[id_items[i][0]] + '</li>';
                break;

            case 'cashbox-report-table-cost_type-input':
                (i == 0) ?
                    dropDownAL += '<li al="' +list_source[id_items[i][0]] + '" id="'+ATTRIBUTE_ACTIVE_LIST_ELEMENT+'">' + list_source[id_items[i][0]] + '</li>'
                    :
                    dropDownAL += '<li al="' + list_source[id_items[i][0]] + '" >' + list_source[id_items[i][0]] + '</li>';
                break;
        }
    }
    dropDownAL += '</ul>';
    return dropDownAL;
}


