<?php
/**
 * миграция создания таблиц для кассового отчета
 *
 */
// yii migrate --migrationPath=common\modules\cashbox\migrations
use yii\db\Migration;

class m160703_105457_cashbox_tables extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE=InnoDB';
        }

        /*
         * cashbox_manager - имена менеджеров
         */
        $this->createTable('{{%cashbox_manager}}', [
            'id' => $this->primaryKey(),
            'managername' => $this->string()->notNull(),
            'status' => $this->smallInteger(2)->defaultValue(1),
        ], $tableOptions);


        /*
         * cashbox_client - покупатели/клиенты
         */
        $this->createTable('{{%cashbox_client}}', [
            'id' => $this->primaryKey(),
            'clientname' => $this->string()->notNull(), //покупатель
            'manager_id' => $this->integer(), //id записи менеджера
            'price_column' => $this->string(10), //ценовая колонка
            'status' => $this->smallInteger(2)->defaultValue(1),
        ], $tableOptions);

        /*
         * cashbox_seller - названия компаний, от имени которых продают
         */
        $this->createTable('{{%cashbox_seller}}', [
            'id' => $this->primaryKey(),
            'sellername' => $this->string()->notNull(),
            'status' => $this->smallInteger(2)->defaultValue(1),
        ], $tableOptions);


        /**
         * в фоновом режиме нужно считать итоговую сумму каждого отчета. Эти данные будут храниться в таблице с историей
         * сохраненых отчетов (cashbox_history). Т.е для хранения истории будут использоваться две таблицы - одна как оглавление, а другая
         * непосредственно хранит записи. cashbox_history - оглавление
         */
        $this->createTable('{{%cashbox_history}}', [
            'id' => $this->primaryKey(),
            'seller_id' => $this->integer()->notNull(),
            'cost' => $this->decimal(19,2),
            'report_date' => $this->date()->notNull(), //дата отчета
            'create_date'=> $this->date()->notNull(), //дата создания отчета (он может быть создан не в день, что выбран на календаре
            'lock' => $this->boolean()->defaultValue(false), //это поле отвечает за возможность редактировать отчет.
            //возможность редактировать отчет исчезает, когда проходит два дня. После завтра отчет заблокирутся
            // false - отчет не заблокирован. true - отчет заблокирован для редактирования
        ], $tableOptions);


        /**
         * cashbox_report_record - строки отчета. Т.е. то, что вводит пользователь
         * эта таблица заполняется тогда, когда пользователь нажимает "сохранить отчет"
         */
        $this->createTable('{{%cashbox_report_record}}', [
            'id' => $this->primaryKey(),
            'history_id' => $this->integer()->notNull(), //id записи из истории
            'cost' => $this->decimal(19, 2)->notNull(), //сумма
            'price_type' => $this->string(), //тип цены (Без НДС/С НДС)
            'client_id' => $this->integer(), //id записи клиента
            'manager_id' => $this->integer(), //id записи менеджера

            'price_column' => $this->string(), //ценовая колонка
            'document_number' => $this->string(), //номер документа
            'document_date' => $this->date(), //дата документа
        ], $tableOptions);

        /**
         * Черновики
         *
         * Черновик это как резервная копия... он создается автоматически, когда вы начинаете писать новый отчет.
         * Вот Вы выбрали продавца - компанию, которая продала товар, а теперь заполнили поле "Сумма", в этот
         * самый момент создался черновик. Он будет автоматически обновляться, когда поля таблицы отчета станут
         * заполнеными или изменят свое значение. Если пользователь нажмет кнопку "Сохранить", то черновик удалится, а
         * заместо него появится запись в cashbox_history и cashbox_report_record.
         *
         * Если нажать печать, то будет выполнена проверка: Если это черновик - сохранить ли отчет, а после распечатать
         * Если это сохраненный отчет, то вывод на печать.
         *
         * У Google черновики просто напросто сохраняется до тех пор, пока письмо не будет отправлено, после отправки
         * оно попадает в "Отправленные".
         *
         * Как я могу использовать "Черновик" ?
         *
         * Открываем "Кассовый отчет"
         * - ищем сохраненый отчет от сегодняшенго числа (cashbox_history), если его нет, то ищем в черновиках
         * (cashbox_history_draft). Если что-то нашли, то загружаем записи, относящиеся к найденному отчету
         *
         * - Если был найден сохраненный отчет, то проверяем можно ли его редактировать (lock). Если можно, то грузим
         * таблицей с полями input, иначе просчто выводим таблицей.
         * - Пусть отчет редактировать можно, тогда выведе его в редактируемой таблице и начав, что-то править,
         * сохраняем в черновик.
         *
         * Открываем сохраненный отчет, который можно редактировать. Он грузится в таблице с полями input. Вносим
         * изменения. Все это автоматически сохраняется в черновик. У нас две версии отчета - оригинал и измененый черновик
         *
         * Пусть пользователь нажмет кнопку "Печать". Тогда нужно спросить, сохранить ли текущую версию отчета ->
         * "Да, сохранить и распечатать", "Нет, только распечатать", "Отмена"
         *
         *
         *
         */
        /*
        $this->createTable('{{%cashbox_history_draft}}', [
            'id' => $this->primaryKey(),
            'seller_id' => $this->integer()->notNull(),
            'report_date' => $this->date()->notNull(), //дата отчета
            'report_id' => $this->integer(), //ID ранее сохраненного отчета
            'cost' => $this->decimal(19,2),
        ], $tableOptions);

        $this->createTable('{{%cashbox_report_record_draft}}', [
            'id' => $this->primaryKey(),
            'history_id' => $this->integer()->notNull(), //id записи из истории
            'cost' => $this->decimal(19, 2), //сумма
            'price_type' => $this->string(), //тип цены (Без НДС/С НДС)
            'manager_id' => $this->integer()->notNull(), //id записи менеджера
            'client_id' => $this->integer(), //id записи клиента
            'price_column' => $this->string(), //ценовая колонка
            'document_number' => $this->string(), //номер документа
            'document_date' => $this->date(), //дата документа
        ], $tableOptions);

*/
        //draft - черновик
        /*
         * technical_support_for_companies - тоже самое, что и cashbox_seller. Отличие только в наличии полей для
         * хранения реквизитов компаний
         *
         * пока что не использую так как заебусь. начну с малого
         */
/*
        $this->createTable('tbl_technical_support_for_companies', [
            'id' => $this->primaryKey(),
            'companyname' => $this->string(64)->notNull(),
            'ogrn' => $this->string(14),
            'inn' => $this->string(11),
            'kpp' => $this->string(10),
            'bik' => $this->string(10),
            'okved' => $this->string(10),
            'okpo' => $this->string(10),
            'rc' => $this->string(21),
            'kc' => $this->string(21),
            'legaladdress' => $this->string(),
            'POSTlegaladdress' => $this->string(25),
            'actualaddress' => $this->string(),
            'POSTactualaddress' => $this->string(25),
            'bankname' => $this->string(),
            'use_in_csshbox' => $this->boolean()->defaultValue(false),
        ], $tableOptions);
*/
    }

    public function down()
    {
        echo "m160703_105457_cashbox_tables cannot be reverted.\n";

        return false;
    }
}
