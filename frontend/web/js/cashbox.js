/** КЛАВИШИ */
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_ENTER = 13;
var KEY_ESC = 27;
var KEY_TAB = 9;
var KEY_SHIFT = 16;
var KEY_BACKSPACE = 8;
var KEY_DELETE = 46;
var KEY_PAGEUP = 33;
var KEY_PAGEDOWN = 34;



var contextmenu_row;
var contextmenu_row_index;

//эта переменная хранит ссылку на элемент, от которого был совершен вызов контекстного меню
var contextmenu_element;

var client_list;
var manager_list;


//массив для хранения состояния списка сохраненных отчетов
var state_history = [];

/** клавиши */

/**
 * Как сделать вывод запроса на подтверждения действия?
 *
 *
 * Вставка новой строки в произвольное место, удаление строки, очистка строки происходит через
 * контекстное меню.
 *
 * == контекстное меню ==
 * новая строка перед текущей
 * новая строка после текущей
 * удалить строку
 * очистить строку
 * == контекстное меню ==
 *
 */



$(document).ready(function() {
    welcome();
    resizeReportList();
    resizeReportHeader();
    getClientList();
    getManagerList();
    getSellerList();



//скрываем контекстное меню

    $(document).on('click', 'body', function(event) {
       closeContextMenu();
    });


    //подгрузка истории отчетов при смене компании
    $(document).on('change', '.cashbox-select-company', function(){
        var seller = $('.cashbox-select-company option:selected').val();
        getHistory(seller);
        loadReport($('.report__history__year-list__item__month-list__item__day-list__item_active'));
    });

//добавление пустой строки в конец таблице, при переходе корретки на текущую последнюю строку
        parent_row = $(this).parents('.report__table__tbody__tr_last');
        $(parent_row).attr('class', 'report__table__tbody__tr');
        count_row = $('.report__table__tbody__tr').length + 1;

        $(parent_row).after(
            '<tr class="report__table__tbody__tr_last">' +
            '<td class="report__table__tbody__tr__row-number">' + count_row + '</td>' +
            '<td class="report__table__tbody__tr__cost"><input class="report__table__tbody__tr__cost__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__price-type"><input class="report__table__tbody__tr__price-type__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__client"><input class="report__table__tbody__tr__client__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__manager"><input class="report__table__tbody__tr__manager__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__price-column"><input class="report__table__tbody__tr__price-column__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__document-number"><input class="report__table__tbody__tr__document-number__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__document-date"><input class="report__table__tbody__tr__document-date__input" value=""/></td>' +
            '</tr>'
        );


        scrollToBottomReportList();
        resizeReportHeader();
    });


//показать/скрыть сохраненные отчеты
    $(document).on('click', 'a[name=toggle-history]', function () {
        $(this).toggleClass('active');
        $('.report__history').toggleClass('report__history_visible');
        $('.report__table-box').toggleClass('col-lg-10 col-lg-12');
        resizeReportHeader();
        resizeReportHistory();
    });


//раскрыть/закрыть месяца
    $(document).on('click', '.report__history__year-list__item__month-list__item__caption', function (event) {
        $(this).parent().children('.report__history__year-list__item__month-list__item__day-list').toggleClass('report__history__year-list__item__month-list__item__day-list_visible');
        event.stopPropagation();
        resizeReportHistory();
        saveStateHistory();
    });


//раскрыть/закрыть год
    $(document).on('click', '.report__history__year-list__item__caption', function (event) {
        $(this).parent().children('.report__history__year-list__item__month-list').toggleClass('report__history__year-list__item__month-list_visible');
        event.stopPropagation();
        resizeReportHistory();
        saveStateHistory();
    });


//новый отчет
    $(document).on('click', '.report__new-report', function () {
        // нужно делать отслеживание того сохранен ли отчет или нет чтобы не терять введенные данные
        newReport();
        resizeReportHeader();
    });


//сохранение отчета
    $(document).on('click', '.report__save-report', function(){
        saveReport();
    });

//печать отчета
    $(document).on('click', '.report_print-report', function(){
       printReport();
    });

//загрузка отчета
    $(document).on('click', '.report__history__year-list__item__month-list__item__day-list__item', function(){
        loadReport($(this));
    });


//при потере фокуса у поля "Сумма" применить mask_money
    $(document).on('focusout', '.report__table__tbody__tr__cost__input', function () {
        $(this).val(mask_money($(this).val()));
    });


//при потре фокуса у поля "Дата документа" применить mask_date
    $(document).on('focusout', '.report__table__tbody__tr__document-date__input', function () {
        $(this).val(mask_date($(this).val(), true));
    });


//подсчет суммы, когда уходит фокус поля "Сумма"
    $(document).on('focusout', '.report__table__tbody__tr__cost__input', function () {
        setTotalCost();
    });



//горячие клавиши
    $(document).on('keydown', '.report__table__tbody__tr td input', function (event) {
        input = $(this);

        current_row = getCurrentRow($(input));

        switch (event.keyCode) {
            case KEY_PAGEUP:
                if (!usingList()) {
                    copyUpperRow(current_row, input);
                }
            break;

            case KEY_PAGEDOWN:
                console.log('Копирование значений строки, что расположена ниже. Не реализовано.');
            break;

            case  KEY_ENTER:
                if (!usingList()) {
                    getNextInput($(input)).focus();
                }
            break;

            case KEY_TAB:
                removeDropDownList();
            break;

        }
    });


//вызов контекстного меню
/*
     $(document).on('contextmenu', '.report__table__tbody input', function(event) {
         event.preventDefault();

         contextmenu_row = $(this).parents('.report__table__tbody__tr');
         contextmenu_row_index = contextmenu_row.index();
         contextmenu_element = $(this);

         items = [
            ['Добавить пустую строку сверху', '', 'glyphicon glyphicon-arrow-up color-blue', 'insert-top'],
            ['Добавить пустую строку снизу', '', 'glyphicon glyphicon-arrow-down color-blue_dark', 'insert-bottom']
         ];

         if (contextmenu_row_index > 0){
            prev_row = contextmenu_row.prev();
            if (isEmpty(prev_row)){
                items.push(['Скопировать то, что сверху', '', 'glyphicon glyphicon-chevron-down color-green', 'addfromtop-row']);
            }
         }

         if (isEmpty(contextmenu_row)) {
            items.push( ['Очистить строку', '', 'glyphicon glyphicon-minus color-orange', 'clear-row'] );
         }

         items.push( ['Удалить строку', '', ' glyphicon glyphicon-trash color-red', 'delete-row'] );

         contextmenu = generateContextMenu(items, event);
         closeCalendar();
     });
*/


//очистка строки
    $(document).on('click', '.clear-row', function (event) {
        event.preventDefault();

        if (isEmpty($('.report__table__tbody__tr:eq(' + contextmenu_row_index + ')'))) {
            if (confirm('Строка будет очищена. Вы точно хотите это сделать?')) {
                $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ') input').val('');
                $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ') input').attr('recid', '');
            } else {
                closeContextMenu();
                return false;
            }
        } else {
            $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ') input').val('');
            $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ') input').attr('recid', '');
        }
        setTotalCost();
    });


//удаление строки
    $(document).on('click', '.delete-row', function (event) {
        event.preventDefault();
        if (isEmpty($('.report__table__tbody__tr:eq(' + contextmenu_row_index + ')'))) {
            if (confirm('Строка будет удалена. Вы точно хотите это сделать?')) {
                $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ')').remove();
                row_count = $('.report__table__tbody__tr').length;
                if (row_count == 0) {
                    $('.report__table__tbody__tr_last').children('td').children('input').focus();
                }
                renumbering();

            } else {
                closeContextMenu();
                return false;
            }
        } else {
            $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ')').remove();
            row_count = $('.report__table__tbody__tr').length;
            if (row_count == 0) {
                $('.report__table__tbody__tr_last').children('td').children('input').focus();
            }
            renumbering();
        }
        setTotalCost();
    });


//вставка строки сверху
    $(document).on('click', '.insert-top', function (event) {
        event.preventDefault();
        $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ')').before(
            '<tr class="report__table__tbody__tr">' +
            '<td class="report__table__tbody__tr__row-number"></td>' +
            '<td class="report__table__tbody__tr__cost"><input class="report__table__tbody__tr__cost__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__price-type"><input class="report__table__tbody__tr__price-type__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__client"><input class="report__table__tbody__tr__client__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__manager"><input class="report__table__tbody__tr__manager__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__price-column"><input class="report__table__tbody__tr__price-column__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__document-number"><input class="report__table__tbody__tr__document-number__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__document-date"><input class="report__table__tbody__tr__document-date__input" value=""/></td>' +
            '</tr>'
        );
        renumbering();
    });


//вставка строки снизу
    $(document).on('click', '.insert-bottom', function (event) {
        event.preventDefault();
        $('.report__table__tbody__tr:eq(' + contextmenu_row_index + ')').after(
            '<tr class="report__table__tbody__tr">' +
            '<td class="report__table__tbody__tr__row-number"></td>' +
            '<td class="report__table__tbody__tr__cost"><input class="report__table__tbody__tr__cost__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__price-type"><input class="report__table__tbody__tr__price-type__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__client"><input class="report__table__tbody__tr__client__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__manager"><input class="report__table__tbody__tr__manager__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__price-column"><input class="report__table__tbody__tr__price-column__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__document-number"><input class="report__table__tbody__tr__document-number__input" value=""/></td>' +
            '<td class="report__table__tbody__tr__document-date"><input class="report__table__tbody__tr__document-date__input" value=""/></td>' +
            '</tr>'
        );
        renumbering();
    });


//копирование значений строки той, что сверху
    $(document).on('click', '.addfromtop-row', function (event) {
        event.preventDefault();
        copyUpperRow(contextmenu_row, contextmenu_element);
    });




//выбор даты в календаре
    $(document).on('click', '.calendar-box__table__tbody__item', function (event) {
        $('.tool-bar__report-date-box__date').html(getCalendarDate());
    });




//автозаполнение
    /** тип цены */
    $(document).on('input', '.report__table__tbody__tr__price-type__input', function (event) {
        if (event.keyCode != KEY_TAB && event.keyCode != KEY_SHIFT) {

            $(this).ludwig_autocomplete({
                list: [
                    ['Без НДС']
                ],
                minChar: 1,
                delayList: 50,
                displayList: false,
                delayAutoFill: 50,
                autoFill: true
            }, event);
        }
    });
    /** тип цены */


    /** ценовая колонка */
    $(document).on('keyup', '.report__table__tbody__tr__price-column__input', function (event) {
        if (event.keyCode != KEY_TAB && event.keyCode != KEY_SHIFT) {
            $(this).ludwig_autocomplete({
                list: [
                    ['обл.'],
                    ['ч/л'],
                    ['дил.'],
                    ['ком.'],
                    ['1'],
                    ['2'],
                    ['3'],
                    ['4']
                ],
                minChar: 1,
                delayList: 100,
                displayList: false,
                delayAutoFill: 100,
                autoFill: true
            }, event);
        }
    });
    /** ценовая колонка */


    /** клиент */
    $(document).on('keyup', '.report__table__tbody__tr__client__input', function (event) {

        var typeOrganization =
            [
                'ооо', 'ооо ', ' ооо',
                'одо', 'одо ', ' одо',
                'оао', 'оао ', ' оао',
                'зао', 'зао ', ' зао',
                'ао ', ' ао',
                'ип ', ' ип',
                'тд ', ' тд',
                'чп ', ' чп'
            ];
        inputVal = $(this).val();


        //поиск и перевод в верхний регистр типа организации
        for (var i = 0; i < typeOrganization.length; i++) {
            posTypeOrganization = inputVal.toLowerCase().indexOf(typeOrganization[i].toLowerCase());
            if (posTypeOrganization != -1) {
                copyTypeOrganization = inputVal.substr(posTypeOrganization, typeOrganization[i].length);
                inputVal = inputVal.substr(0, posTypeOrganization) + copyTypeOrganization.toUpperCase();
            }
        }

//поиск и перевод в верхний регистр инициалов
        var initials = '';
        var reg = /\s.\./gi;
        var initialsShort = reg.exec(inputVal)+'';


        reg = /\s.\..\./gi;
        var initialsFull = reg.exec(inputVal)+'';


        if (initialsShort.length > 0 && initialsShort != 'null') {
            initials = initialsShort;
        }

        if (initialsFull.length > 0 && initialsFull != 'null') {
            initials = initialsFull;
        }

        if (initials != 'null') {
            leftPart = inputVal.substr(0, inputVal.indexOf(initials));
            rightPart = inputVal.substr(leftPart.length + initials.length, inputVal.length - leftPart.length - initials.length);
            initials = initials.toUpperCase();
            inputVal = leftPart + initials + rightPart;
        }

        if (inputVal.length > 0)
            $(this).val(inputVal);
//конец. поиск и перевод в верхний регистр инициалов



        if (event.keyCode != KEY_TAB && event.keyCode != KEY_SHIFT) {
            $(this).ludwig_autocomplete({
                list: client_list,
                minChar: 2,
                displayList: true,
                capitalLetter: true
            }, event);
        }
    });
    /** клиент */


    /** менеджер */
    $(document).on('keyup', '.report__table__tbody__tr__manager__input', function (event) {
        if (event.keyCode != KEY_TAB && event.keyCode != KEY_SHIFT) {
            $(this).ludwig_autocomplete({
                list: manager_list,
                minChar: 2,
                displayList: true,
                capitalLetter: true
            }, event);
        }
    });
    /** менеджер */
//автозаполнение


    /**
     * заполнение таблий "Клиент" и "Менеджер"
     *
     * поля "Клиент" - "Менеджер" - "Колонка"
     * отправлять в БД можно, если заполнено:
     *
     * в "Менеджер"
     * "Менеджер"
     *
     * в "Клиент"
     * "Клиент"  "Менеджер"  "Колонка"
     * "Клиент"  "Колонка"
     *
     * проверка выполняется когда поле теряет фокус.
     * проверка на заполненность полей
     *
     */



/** изменение значение input */
$(document).bind('activeInputChange', function (event, input) {

    switch ($(input).attr('class')){
        case 'report__table__tbody__tr__client__input':
            current_row = getCurrentRow($(input));

            manager = current_row.children('td').children('.report__table__tbody__tr__manager__input');
            priceColumn = current_row.children('td').children('.report__table__tbody__tr__price-column__input');

            manager.val('');
            manager.removeAttr(ATTR_RECID);

            priceColumn.val('');
            priceColumn.removeAttr(ATTR_RECID);
        break;

        case 'report__table__tbody__tr__manager__input':

        break;
    }
});

/** изменение значение input */



/** отслеживание момента заполнения input через autocomplete */
    $(document).bind('autocompleteDone', function (event, input) {
        var managerFill = false;
        var priceColumnFill = false;
        var clientFill = false;

        event.preventDefault();
        inputType = $(input).attr('class');
        current_row = getCurrentRow(input);


        managerInput = current_row.children('td').children('.report__table__tbody__tr__manager__input');
        priceColumnInput = current_row.children('td').children('.report__table__tbody__tr__price-column__input');
        clientInput = current_row.children('td').children('.report__table__tbody__tr__client__input');
        documentNumberInput = current_row.children('td').children('.report__table__tbody__tr__document-number__input');

        switch (inputType) {
            case 'report__table__tbody__tr__client__input':
                recid = $(input).attr(ATTR_RECID).split('::');
                manager = recid[2];
                priceColumn = recid[3];

                if (manager >= 1) {
                    managerFill = true;
                    for (var i = 0; i < manager_list.length; i++) {
                        if (manager_list[i][0] == manager) {
                            managerInput.val(manager_list[i][1]);
                            break;
                        }
                    }
                    managerInput.attr(ATTR_RECID, manager + '::' + manager_list[i][1]);
                }

                if (priceColumn.length >= 1) {
                    priceColumnFill = true;
                    priceColumnInput.attr(ATTR_RECID, priceColumn);
                    priceColumnInput.val(priceColumn);
                }


                (priceColumnFill) ? false : priceColumnInput.focus();
                (managerFill) ? false : managerInput.focus();
                (managerFill && priceColumnFill) ? documentNumberInput.focus() : false;
            break;

            case 'report__table__tbody__tr__manager__input':
                if (!(priceColumnInput.hasAttr(ATTR_RECID))) {
                    priceColumnInput.val('');
                    priceColumnInput.focus();
                } else {
                    sendClientToDB(clientInput, managerInput, priceColumnInput);

                    /* дописать проверку заполненности полей: номер документа, дата документа.
                        если все заполенно, то преход на новую строку?
                        новая строка - создать пустую или проверить заполненность слудующей?
                      */
                    documentNumberInput.focus();
                }
            break;

            //поле "Тип цены"
            case 'report__table__tbody__tr__price-type__input':
                var nextInput = getNextInput(input);
                while (nextInput.val().length > 0 ){
                    nextInput = getNextInput(nextInput);
                }
                nextInput.focus();
            break;

            //поле "Колонка"
            case 'report__table__tbody__tr__price-column__input':
                //вот тут нужно проверять заполненность полей "Клиент" "Менеджер" "Колонка"
                /**
                 * * в "Клиент"
                 * "Клиент"  "Менеджер"  "Колонка"
                 * "Клиент"  "Колонка", если колонка - ч/л
                 */
                    // изначально предполаголось писать проверку в функции checkFieldsForDB

                clientFill = clientInput.hasAttr(ATTR_RECID);
                managerFill = managerInput.hasAttr(ATTR_RECID);
                priceColumnFill = priceColumnInput.hasAttr(ATTR_RECID);

                sendClientToDB(clientInput, managerInput, priceColumnInput);
                var nextInput = getNextInput(input);
                while (nextInput.val().length > 0 ){
                    nextInput = getNextInput(nextInput);
                }
                nextInput.focus();
            break
        }
        removeIdActiveInput();
        removeDropDownList();
    });
/** отслеживание момента заполнения input через autocomplete */


    $(document).bind('clickOnListItem', function (event) {
        setAttrFromDropDownListItem();
    });

/** отслеживание момента потери фокуса input */
    $(document).bind('activeInputFocusOut', function (event, input) {
        removeDropDownList();
        current_row = getCurrentRow($(input));
        managerInput = current_row.children('td').children('.report__table__tbody__tr__manager__input');
        priceColumnInput = current_row.children('td').children('.report__table__tbody__tr__price-column__input');
        documentNumberInput = current_row.children('td').children('.report__table__tbody__tr__document-number__input');

        switch ($(input).attr('class')) {
            case 'report__table__tbody__tr__client__input':

                //удаление значений и атрибута записи у полей "Менеджер", "Колонка"
                if (!$(input).hasAttr(ATTR_RECID)) {
                    answer = findItems($(input).val(), client_list);

                    if (answer.length == 1) {
                        $(input).attr(ATTR_RECID,
                            client_list[answer[0][0]][0] + '::' +
                            client_list[answer[0][0]][1] + '::' +
                            client_list[answer[0][0]][2] + '::' +
                            client_list[answer[0][0]][3] + '::' +
                            client_list[answer[0][0]][4]
                        );

                        /**
                         * работает криво. Идея была в заполнении менеджера и колонки
                         * если клиент заполнен, но не нажали Enter, а фокус ушел, например через Tab
                         */
                        //console.log(manager_list);
                        //console.log('/' + );

/*
                        managerID = client_list[answer[0][0]][2];
                        priceColumnID = client_list[answer[0][0]][3];


                        managerInput.val(manager_list[managerID-1][1]);
                        managerInput.attr(ATTR_RECID, manager_list[managerID-1][0] + '::' + manager_list[managerID-1][1]);

                        priceColumnInput.val(priceColumnID);
                        priceColumnInput.attr(ATTR_RECID, priceColumnID);

                        var managerFill = false;
                        var priceColumnFill = false;
                        var clientFill = false;

                        managerFill = (managerInput.val().length > 1) ? true : false;
                        priceColumnFill = (priceColumnInput.val().length > 1) ? true : false;


                        console.log(managerFill + '/' + priceColumnFill);
                        (priceColumnFill) ? false : priceColumnInput.focus();

                        (managerFill) ? false : managerInput.focus();

                        (priceColumnFill && managerFill) ?  documentNumberInput.focus() : false;
*/
                    } else {
                        managerInput.val('');
                        managerInput.removeAttr(ATTR_RECID);

                        priceColumnInput.val('');
                        priceColumnInput.removeAttr(ATTR_RECID);
                    }
                }
            break;

            case 'report__table__tbody__tr__manager__input':
                //если вставки из выпадающего списка не было (аттрибут recid не существует)
                if (!$(input).hasAttr(ATTR_RECID)) {
                    //то ищем введенное значение в локальном массиве
                    answer = findItems($(input).val(), manager_list);
                    if (answer.length == 1) {
                        $(input).attr(ATTR_RECID, manager_list[answer[0][0]][0] + '::' + manager_list[answer[0][0]][1]);
                    } else {
                        //поиск продолжится в БД
                        console.log('отпарвка Менеджра в БД');
                        sendManagerToDB(input);
                    }
                    //если клиент, менеджер и колонка введены, то обновляем запись в таблице клиент
                    if (!isEmpty(current_row)){
                        console.log('отправка данных клиента после потери фокуса полем "Менеджер"');
                        sendClientToDB(clientInput, managerInput, priceColumnInput);
                    }
                }
            break;
        }
    });
/** отслеживание момента потери фокуса input */
});


$(window).resize(function(){
    resizeReportList();
    resizeReportHeader();
    resizeReportHistory();
});


function resizeReportList(){
    var body_height = $('body').height();
    var reportList = $('.report');
    var footer_height = $('.footer').height();
    var reportList_height = body_height-footer_height-200;

    $(reportList).height(reportList_height);

    $('.report__table__tbody').css('max-height',reportList_height - 82);
}

function resizeReportHistory(){
    var body_height = $('body').height();
    var reportHistory = $('.report__history_visible');
    var footer_height = $('.footer').height();
    var reportHistory_height = body_height-footer_height-244;

    $(reportHistory).height(reportHistory_height);

    //$('.report__table__tbody').css('max-height',reportList_height - 82);
}


//подстраивает ширину ячеек шапки таблицы под ячеки таблицы с данными
function resizeReportHeader(){

//массив ширин ячеек строки таблицы отчета
var widths = [];

    //в цыкле обращаемся к каждой ячейки первой строки таблицы отчета и запоминаем ширину этой ячеки
    $('.report__table__tbody tr:eq(0) td ').each(function() {
        widths.push($(this)[0].getBoundingClientRect().width);
    });

    //подставляем сохраненные значения ширин ячеек первой строки таблицы в ячейки шапки таблицы
    $('.report__table__thead__tr td:eq(0)').css('width', widths[0]);
    $('.report__table__thead__tr td:eq(1)').css('width', widths[1]);
    $('.report__table__thead__tr td:eq(2)').css('width', widths[2]);
    $('.report__table__thead__tr td:eq(3)').css('width', widths[3]);
    $('.report__table__thead__tr td:eq(4)').css('width', widths[4]);
    $('.report__table__thead__tr td:eq(5)').css('width', widths[5]);
    $('.report__table__thead__tr td:eq(6)').css('width', widths[6]);
    $('.report__table__thead__tr td:eq(7)').css('width', widths[7]);
}



//приводит строку к виду "123 456.78"
function mask_money(val){
    val = val+''; //мнимое преобразование в строку
    var result = '';

    val = val.replace(/[^0-9\-\,\.]/gi, '');

    if (val.length > 0) {
        val = val.replace(/\,/gi, '.');
        dotCount = val.split('.').length-1;
        while (dotCount >1){
            val = val.replace('.', '');
            dotCount = val.split('.').length-1;
        }

        pos = val.indexOf('.');
        if (pos == -1 || val.length-pos == 1){
            val += '.00';
            pos = val.indexOf('.');
        }

        if (val.length-pos == 2){
            val +='0';
        }

        var len = (val.substr(0, pos-1)).length;
        var cut_count = Math.floor(len/3);

        for (var i = 1; i <= cut_count; i++){
            result = val.substr(len-2*i, 3)+' '+result;
            len--;
        }
        len--;

        if (cut_count >0){
            result = val.substr(0, len-2*cut_count+2)+' '+result.substr(0, result.length-1)+val.substr(pos, 3);
        } else {
            result = val.substr(0, len-2*cut_count+2)+result.substr(0, result.length-1)+val.substr(pos, 3);
        }
    }
    return result;
}




//приводит строку (дату) к виду дд.мм.гг. длина введенного значения должна быть хотя бы 4 цифры
function mask_date(val, checkDate){

    checkDate = checkDate || false; //делать ли проверку даты
    var array_of_possible_dates = [];

    //функция проверки даты, принимает значение и диапазоны
    function check_range(data, minValue, maxValue, correctData){
        correctData = correctData || false;
        data = Number(data);
        var check = (data >= minValue && data <=maxValue) ? (correctData)?data:true : (correctData)? (data < minValue)? minValue:maxValue: false;

        return check;
    }


    //удаляю все символы кроме цифр
    val = val.replace(/\D/g,"");

    if (val.length >= 4 && val != '010170'){

        // обрезаем введенное значение до 6-ти символов
        (val.length > 6) ? val = val.substr(0,6):false;

        if (checkDate) {
            // Указать место/значение начальной даты
            starting_date = $('.tool-bar__report-date-box__date').html();

            starting_date = starting_date.replace(/[^0-9\-\,\.]/gi, '');
            // Указать место/значение начальной даты

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
                                (month > 9) ?
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

        //день/месяц/год делятся по две цифры
        var result = val.substr(0, 2) + '.' + val.substr(2, 2) + '.' + val.substr(4, 2);

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
        array_of_possible_dates[i] = (array_of_possible_dates[i]+"").replace(/\D/g,"");
        array_of_possible_dates[i] = array_of_possible_dates[i].substr(0,2)+'.'+array_of_possible_dates[i].substr(2,2)+'.'+array_of_possible_dates[i].substr(4,2);
    }

    //сортируем даты по возрастанию
    for (i= 0; i <(array_of_possible_dates.length-1); i++){
        var current = array_of_possible_dates[i];
        current = current.split('.');

        var next = array_of_possible_dates[i+1];
        next = next.split('.');

        for ($j = 0; $j < 3; $j++){
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

    result = result.replace(/\D/g,"");

    return result;
}




//переназначает номера строк (report__table__tbody__tr__row-number)
function renumbering(){
    row_count = $('.report__table__tbody__tr').length;
    for (var i=contextmenu_row_index; i <= row_count; i++){
        $('.report__table__tbody tr').eq(i).children('.report__table__tbody__tr__row-number').html(i+1);
    }
}




//обновить поле "Итого" на странице
function setTotalCost(){
    $('.report__info-box__total-cost span').html(mask_money(getTotalCost()));
}



//подсчет общей суммы
function getTotalCost(){
    row_count = $('.report__table__tbody__tr').length;
    cost = 0.00;

    for (var i=0; i < row_count; i++) {
        val = $('.report__table__tbody tr').eq(i).children('td').children('.report__table__tbody__tr__cost__input').val();
        val = (typeof(val) == 'undefined') ? 0.0 : val.replace(/[^0-9\-\.]/gi, '');
        cost += Number(val) * 100;
    }
    if (cost == 0){
        cost = '0.00';
    } else cost = cost/100;

    return cost;
}




//вернет длину строки. 0 - пустая иначе - что-то введено
function isEmpty(row){

    len =  $(row).children('td').children('.report__table__tbody__tr__client__input').val().length;
    len += $(row).children('td').children('.report__table__tbody__tr__manager__input').val().length;
    len += $(row).children('td').children('.report__table__tbody__tr__price-column__input').val().length;
    return len;
}




// копирует атрибуты и значения полей верхней строки
function copyUpperRow(current_row, focus_on){
    /**
     *  можно добавить такую штуку:
     *
     *  проверка на заполненность полей. Т.е. если сума не заполнена, то переместить фокус на поле "Сумма"
     */
    var row_index = current_row.index();
    if ((row_index+1) > 1) {
        //currentInput = $(focus_on);
        focus_on = focus_on.attr('class');

        clone = $('.report__table__tbody__tr').eq(row_index - 1);

        if (focus_on == 'report__table__tbody__tr__document-date__input') {

            clone_document_date = clone.children('td').children('.report__table__tbody__tr__document-date__input').clone();
            current_row.children('.report__table__tbody__tr__document-date').html(clone_document_date);
            current_row.children('td').children('.report__table__tbody__tr__document-date__input').focus();


        } else if (focus_on == 'report__table__tbody__tr__manager__input'){

            var clone_manager = clone.children('td').children('.report__table__tbody__tr__manager__input').clone();
            current_row.children('.report__table__tbody__tr__manager').html(clone_manager);
            current_row.children('td').children('.report__table__tbody__tr__price-column__input').focus();

        } else {
            if (isEmpty(current_row)) {
                if (confirm('Строка уже заполнена, заменить существующие значения?')) {


                    console.log('Копирование верхней строки');

                    //предыдущая строка


                    //клон поля "Клиент"
                    var clone_client = clone.children('td').children('.report__table__tbody__tr__client__input').clone();
                    current_row.children('.report__table__tbody__tr__client').html(clone_client);

                    //клон поля "Менеджер"
                    var clone_manager = clone.children('td').children('.report__table__tbody__tr__manager__input').clone();
                    current_row.children('.report__table__tbody__tr__manager').html(clone_manager);

                    //клон поля "Колонка"
                    var clone_price_column = clone.children('td').children('.report__table__tbody__tr__price-column__input').clone();
                    current_row.children('.report__table__tbody__tr__price-column').html(clone_price_column);
                }

            } else {

                //предыдущая строка
                clone = $('.report__table__tbody__tr').eq(row_index - 1);

                //клон поля "Клиент"
                clone_client = clone.children('td').children('.report__table__tbody__tr__client__input').clone();
                current_row.children('.report__table__tbody__tr__client').html(clone_client);

                //клон поля "Менеджер"
                clone_manager = clone.children('td').children('.report__table__tbody__tr__manager__input').clone();
                current_row.children('.report__table__tbody__tr__manager').html(clone_manager);

                //клон поля "Колонка"
                clone_price_column = clone.children('td').children('.report__table__tbody__tr__price-column__input').clone();
                current_row.children('.report__table__tbody__tr__price-column').html(clone_price_column);

            }
            current_row.children('td').children('.report__table__tbody__tr__document-number__input').focus();
        }
    } else {
        console.log('Я должен копировать верхнюю строку, но строка имеет номер '+ (row_index+1) +' и мне нечего копировать');
    }
}




function welcome(){
    console.log('=== Кассовый отчет ===');
}


//сохранение отчета
function saveReport(){
    //собираем данные
    var count_row = $('.report__table__tbody__tr').length;
    var report = [];//new Array;

    reportDate = $('.tool-bar__report-date-box__date').text().replace(/[^0-9\-\.]/gi, '').split('.');

    reportDate = '20'+reportDate[2]+'-'+reportDate[1]+'-'+reportDate[0];

    //дата отчета (из календаря)
    report.push(reportDate);

    //компания - продавец
    var seller = $('.cashbox-select-company option:selected').val();
    report.push(seller);


    var row = $('.report__table__tbody__tr').eq(0);
    for (var i=0; i <= count_row; i++){
            var cost = row.children('td').children('.report__table__tbody__tr__cost__input').val();

            var priceType = row.children('td').children('.report__table__tbody__tr__price-type__input');
                priceType = (priceType.hasAttr(ATTR_RECID))? priceType.attr(ATTR_RECID): '';

            var client = row.children('td').children('.report__table__tbody__tr__client__input');
                client = (client.hasAttr(ATTR_RECID))? client.attr(ATTR_RECID).split('::')[0]: '';

            var manager = row.children('td').children('.report__table__tbody__tr__manager__input');
                manager = (manager.hasAttr(ATTR_RECID))? manager.attr(ATTR_RECID).split('::')[0]: '';

            var priceColumn = row.children('td').children('.report__table__tbody__tr__price-column__input');
                priceColumn = (priceColumn.hasAttr(ATTR_RECID))? priceColumn.attr(ATTR_RECID): '';

        
            var documentNumber = row.children('td').children('.report__table__tbody__tr__document-number__input').val();


            var documentDate = row.children('td').children('.report__table__tbody__tr__document-date__input').val().split('.');
                documentDate = '20'+documentDate[2]+'-'+documentDate[1]+'-'+documentDate[0];

        if (cost.length > 0){
            report.push(
                [
                    cost,
                    priceType,
                    client,
                    manager,
                    priceColumn,
                    documentNumber,
                    documentDate
                ]
            );
        }
        row = row.next();
    }

    //отправляем их в БД

    $.ajax({
        url: '/cashbox/default/save-report',
        type: 'POST',
        data: {'report':report},
        async: true,
        success: function(answer){
            //console.log('Сохранение отчета. '+answer);
            getHistory(seller);
            scrollToSameWay();
        },
        error: function(answer){
            console.log('Ошибка отправки данных отчета в БД. #'+answer);
        }
    });
    $('.report__info-box__status').fadeIn(3000);
    $('.report__info-box__status').fadeOut(3000);

}


//печать отчета
function printReport(){
    var count_row = $('.report__table__tbody__tr').length;
    var report = new Array;

    reportDate = $('.tool-bar__report-date-box__date').text().replace(/[^0-9\-\.]/gi, '').split('.');

    reportDate = '20'+reportDate[2]+'-'+reportDate[1]+'-'+reportDate[0];

    //дата отчета (из календаря)
    report.push(reportDate);

    //компания - продавец
    var seller = $('.cashbox-select-company option:selected').html();
    report.push(seller);


    var row = $('.report__table__tbody__tr').eq(0);
    for (var i=0; i <= count_row; i++){
        var cost = row.children('td').children('.report__table__tbody__tr__cost__input').val();

        var priceType = row.children('td').children('.report__table__tbody__tr__price-type__input').val();

        var client = row.children('td').children('.report__table__tbody__tr__client__input').val();

        var manager = row.children('td').children('.report__table__tbody__tr__manager__input').val();

        var priceColumn = row.children('td').children('.report__table__tbody__tr__price-column__input').val();


        var documentNumber = row.children('td').children('.report__table__tbody__tr__document-number__input').val();


        var documentDate = row.children('td').children('.report__table__tbody__tr__document-date__input').val();

        if (cost.length > 0){
            report.push(
                [
                    cost,
                    priceType,
                    client,
                    manager,
                    priceColumn,
                    documentNumber,
                    documentDate
                ]
            );
        }
        row = row.next();
    }



    $.ajax({
        url: '/cashbox/default/print-report',
        type: 'POST',
        data: {'report':report},
        async: true,
        success: function(answer){
            window.location.replace(answer);
        },
        error: function(answer){
            console.log('Ошибка отправки данных отчета в БД. #'+answer);
        }
    });

}



//загрузка отчета
function loadReport(item){
    newReport();
    reportId = item.attr('id');
    $.ajax({
        url: '/cashbox/default/load-report',
        type: 'POST',
        data: {'id': reportId },
        async: false,
        success: function(answer){
            var records = createArrayFromString(answer);
            if (records.length > 1) {
                $('.report__table__tbody__tr').remove();
                $('.tool-bar__report-date-box__date').html(records[0]);
                for (var i = 1; i < records.length; i++) {
                    $('.report__table__tbody__tr_last').before(
                        '<tr class="report__table__tbody__tr">' +
                        '<td class="report__table__tbody__tr__row-number">' + i + '</td>' +
                        '<td class="report__table__tbody__tr__cost"><input class="report__table__tbody__tr__cost__input" value="' + mask_money(records[i][1]) + '"/></td>' +
                        '<td class="report__table__tbody__tr__price-type"><input class="report__table__tbody__tr__price-type__input" recid="' + records[i][2] + '" value="' + records[i][2] + '"/></td>' +
                        '<td class="report__table__tbody__tr__client"><input class="report__table__tbody__tr__client__input" recid="' + records[i][4] + '" value="' + getClientName(records[i][4]).replace(/"/g, '&quot;') + '"/></td>' +
                        '<td class="report__table__tbody__tr__manager"><input class="report__table__tbody__tr__manager__input"  recid="' + records[i][3] + '" value="' + getManagerName(records[i][3]).replace(/"/g, '&quot;') + '"/></td>' +
                        '<td class="report__table__tbody__tr__price-column"><input class="report__table__tbody__tr__price-column__input" recid="' + records[i][5] + '"value="' + records[i][5] + '"/></td>' +
                        '<td class="report__table__tbody__tr__document-number"><input class="report__table__tbody__tr__document-number__input" value="' + records[i][6] + '"/></td>' +
                        '<td class="report__table__tbody__tr__document-date"><input class="report__table__tbody__tr__document-date__input" value="' + mask_date(records[i][7]) + '"/></td>' +
                        '</tr>'
                    );
                }
                $('.report__table__tbody__tr_last .report__table__tbody__tr__row-number').html($('.report__table__tbody__tr').length + 1);
            }
            setTotalCost();
            $('.report__history__year-list__item__month-list__item__day-list__item_active').removeClass('report__history__year-list__item__month-list__item__day-list__item_active');
            item.addClass('report__history__year-list__item__month-list__item__day-list__item_active');
            saveStateHistory();
            resizeReportHeader();
        },
        error: function(answer){
            console.log('Ошибка загрузки отчета. #'+answer);
        }
    })
}


function getManagerName(id){
    if (id > 0) {
        for (var i = 0; i < manager_list.length; i++) {
            if (manager_list[i][0] == id) {
                return manager_list[i][1];
            }
        }
    } else return '';
}



function getClientName(id){
    for (var i=0; i<client_list.length; i++){
        if (client_list[i][0] == id){
            return client_list[i][1];
        }
    }
}



//получсаем список продавцов-компаний
function getSellerList(){
    $.ajax({
        url: '/cashbox/default/get-seller-list',
        type: 'POST',
        async: true,
        success: function(answer){
            var seller = createArrayFromString(answer)
            setSellerList(seller);

            getHistory(seller[0][0]);
        },
        error: function(answer){
            console.log('Ошибка получения списка продавцов. # '+answer);
        }
    })
}


//создаем список продавцов-компаний
function setSellerList(arr){
    option = '';
    for (var i=0; i< arr.length; i++){
        option += '<option value="'+ arr[i][0] +'">'+ arr[i][1] +'</option>';
    }
    $('.cashbox-select-company').html(option);

    arr.forEach(function(item, i, arr){
       state_history.push(i);
    });
}



function getClientList(){
    $.ajax({
        url: '/cashbox/default/get-client-list',
        type: 'POST',
        async: false,
        success: function(answer){
            arr = createArrayFromString(answer);
            setClientList(arr);
        },
        error: function(answer){
            console.log('Ошибка получения списка клиентов. # '+answer);
        }
    });
}

function setClientList(arr){
    client_list = arr;
}


function sendClientToDB(clientInput, managerInput, priceColumnInput){
    clientmane = $(clientInput).val();

    /*
        иногда возникает ошибка, так как ответ от БД после добавления новой записи еще не пришел
        добавить таймер или ожидание какого-лтбо события
    */
    manager = managerInput.attr(ATTR_RECID);
    if (manager != undefined) {
        manager = manager.split('::');
        managerID = manager[0];
    } else {
        managerID = '';
    }
    priceColumn = priceColumnInput.attr(ATTR_RECID);
    if (clientmane.length > 3) {
        $.ajax({
            url: '/cashbox/default/find-client',
            type: 'POST',
            data: {'clientname': clientmane, 'manager': managerID, 'pricecolumn': priceColumn},
            async: true,
            success: function (answer){
                $(clientInput).attr(ATTR_RECID, answer);
                getClientList();
            },
            error: function(answer){
                console.log('Ошибка отправки данных клиента. #'+answer);
            }
        });
    }
}


function sendManagerToDB(input){
    managername = $(input).val();
    if (managername.length > 3) {
        $.ajax({
            url: '/cashbox/default/find-manager',
            type: 'POST',
            data: {'managername': managername},
            async: false,
            success: function (answer) {
                //строка вида id::managername
                $(input).attr(ATTR_RECID, answer);
                getManagerList();
            },
            error: function (answer) {
                console.log('Ошибка отправки имени менеджера в БД. # ' + answer);
            }
        });
    }
}


function getManagerList(){
    $.ajax({
        url: '/cashbox/default/get-manager-list',
        type: 'POST',
        async: false,
        success: function(answer){
            arr = createArrayFromString(answer);
            setManagerList(arr);
        },
        error: function(answer){
            console.log('Ошибка получения списка менеджеров. # '+answer);
        }
    });
}

function setManagerList(arr){
    manager_list = arr;

}

//сохранит в массив состояние списка сохраненных отчетов
function saveStateHistory(){
    //компания - продавец
    var seller = $('.cashbox-select-company option:selected').val();

    delete state_history[seller];
    state_history[seller] = [];

    $('.report__history__year-list__item__month-list_visible').each(function(){
        var state_history_item = [];
        state_history_item.push($(this).prev('.report__history__year-list__item__caption').html());
        $(this).children('li').children('.report__history__year-list__item__month-list__item__day-list_visible').each(function(){
            state_history_item.push($(this).prev('.report__history__year-list__item__month-list__item__caption').html());
            $(this).children('.report__history__year-list__item__month-list__item__day-list__item_active').each(function(){
                state_history_item.push($(this).attr('id'));
            });
        });
        state_history[seller].push(state_history_item);
    });

    //console.log(state_history[seller]);
}


//новый отчет
function newReport(){
    $('.report__table__tbody__tr').remove();
    $('.report__table__tbody__tr_last').before(
        '<tr class="report__table__tbody__tr">' +
        '<td class="report__table__tbody__tr__row-number">1</td>' +
        '<td class="report__table__tbody__tr__cost"><input class="report__table__tbody__tr__cost__input"/></td>' +
        '<td class="report__table__tbody__tr__price-type"><input class="report__table__tbody__tr__price-type__input"/></td>' +
        '<td class="report__table__tbody__tr__client"><input class="report__table__tbody__tr__client__input"/></td>' +
        '<td class="report__table__tbody__tr__manager"><input class="report__table__tbody__tr__manager__input"/></td>' +
        '<td class="report__table__tbody__tr__price-column"><input class="report__table__tbody__tr__price-column__input"/></td>' +
        '<td class="report__table__tbody__tr__document-number"><input class="report__table__tbody__tr__document-number__input"/></td>' +
        '<td class="report__table__tbody__tr__document-date"><input class="report__table__tbody__tr__document-date__input"/></td>' +
        '</tr>'
    );

    count_row = $('.report__table__tbody__tr').length + 1;

    $('.report__table__tbody__tr_last .report__table__tbody__tr__row-number').html($('.report__table__tbody__tr').length + 1);
    setTotalCost();
    $('.report__table__tbody__tr__cost__input').first().focus();
}


//загрузит состояние списка сохраненных отчетов
function loadStateHistory(){
    var seller = $('.cashbox-select-company option:selected').val();
    if (state_history[seller] != undefined) {
        for (i = 0; i < state_history[seller].length; i++) {
            var year = $('#year' + state_history[seller][i][0]).next('.report__history__year-list__item__month-list').addClass('report__history__year-list__item__month-list_visible');
            for (j = 1; j < state_history[seller][i].length; j++) {
                if (isNaN(state_history[seller][i][j])) {
                    var month = $('#month' + state_history[seller][i][j]).next('.report__history__year-list__item__month-list__item__day-list').addClass('report__history__year-list__item__month-list__item__day-list_visible');
                } else {
                    var day = $('.report__history__year-list__item__month-list__item__day-list__item#' + state_history[seller][i][j]);
                    $(day).addClass('report__history__year-list__item__month-list__item__day-list__item_active');
                    //loadReport(day);
                }
            }
        }
    }
}

//функция вернет массив ключ - значение, для отслеживания заполненности полей Клиент-Менеджер-Колонка
function checkFieldsForDB(row){
    /**
     * Пусть эта функция так же делает проверку на корректность введенных данных
     *
     */
    fields = [0, 0, 0]; //client-manager-priceColumn

    /*
    len =  $(row).children('.report__table__tbody__tr__client').children('input').val().length;
    len += $(row).children('.report__table__tbody__tr__manager').children('input').val().length;
    len += $(row).children('.report__table__tbody__tr__price-column').children('input').val().length;
    return len;
    */

    return fields;
}


function getHistory(sellerID){
    var result = false;
    $.ajax({
        url: '/cashbox/default/get-history',
        type: 'POST',
        data: {'seller': sellerID},
        async: false,
        success: function(answer){
            if (answer.length >0) {
                createHistoryBox(createArrayFromString(answer));
                loadStateHistory();
            }
        },
        error: function(answer){
            console.log('ошиба загрузки истории отчетов. '+answer);

        }
    });
}

function createHistoryBox(records){
    var Months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    var history = '<ul class="report__history__year-list">';
    var currentYear = null;
    var currentMonth = null;
    var currentDay = null;

    for (i=0; i<records.length; i++){
        var recordDate = records[i][2].split('-');
        if (recordDate[0] != currentYear) {
            history += (currentYear != null) ? '</ul/></ul></li>' : '';
            currentYear = recordDate[0];
            currentMonth = null;
            currentDay = null;

            history +=  '<li class="report__history__year-list__item">';
            history +=      '<div class="report__history__year-list__item__caption" id="year'+currentYear+'">'+currentYear+'</div>';
            history +=      '<ul class="report__history__year-list__item__month-list">';
        }

        if (recordDate[1] != currentMonth){
            history += (currentMonth != null) ? '</ul></li>' : '';
            currentMonth = recordDate[1];
            currentDay = null;

            history +=          '<li class="report__history__year-list__item__month-list__item">';
            history +=              '<div class="report__history__year-list__item__month-list__item__caption" id="month'+Months[currentMonth-1]+'">'+Months[currentMonth-1]+'</div>';
            history +=              '<ul class="report__history__year-list__item__month-list__item__day-list ">';
        }

        if (recordDate[2] != currentDay){
            currentDay = recordDate[2];
            history +=                  '<li class="report__history__year-list__item__month-list__item__day-list__item" id="'+records[i][0]+'">';
            history +=                      '<span class="report__history__year-list__item__month-list__item__day-list__item__caption">'+currentDay+'</span>';
            history +=                      '<span class="report__history__year-list__item__month-list__item__day-list__item__cost">'+mask_money(records[i][1])+' руб.</span>';
            history +=                  '</li>';
        }
    }
    $('.report__history').html(history);
}

//из строки вида elem1, elem2; elem3, elem4 создаст массив вида
// [ [elem1, elem2], [elem3, elem4] ]
function createArrayFromString(str){
    arr = [];
    element = str.split(';');
    for (var i=0; i< element.length; i++){
        item = element[i].split(',');
        arr[i] = item;
    }
    return arr;
}

//вернет объект - следующее поле ввода
function getNextInput(currentInput){
    //console.log('next input');
    var nextInput = $(currentInput).parents('td').next().children('input');
    nextInput = (nextInput.hasAttr('class')) ? nextInput : $(currentInput).parents('tr').next('tr').children('td').find('input').first();

    return nextInput;
}

//прокрутка вниз списка... перестает работать после добавления 53 строки
function scrollToBottomReportList(){
    /**
     * добавил *2. это костыль, чтобы, когда окно малого размера опускание вниз списка тоже работало
     */
    var height = $('.report__table__tbody').height()*2;


    return $('.report__table__tbody').scrollTop(height);
}

//прокрутка в тоже самое место
function scrollToSameWay(){
    var height = $('.report__table__tbody').pageYOffset;
    return $('.report__table__tbody').scrollTop(height);
}


function getCurrentRow(input){
    return $(input).parents('.report__table__tbody__tr');
}

$.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined;
};