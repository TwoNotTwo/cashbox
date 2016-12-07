<?php
use yii\helpers\Html;
use common\modules\cashbox\frontend\assets\CashboxAsset;

CashboxAsset::register($this);
$this->title = 'Кассовый отчет';
?>
<div class="toolbar-top">

    <div class="col-lg-4 col-sm-4">
        <?= Html::dropDownList('company', 0, [],
            [
                'class' => 'btn cashbox-select-company',
                'style' => [
                    'border' => '1px solid rgb(204, 204, 204)',
                    'margin-top' => '5pt',
                    'width' => '100%',
                ],
            ]
        );
        ?>
    </div>

    <div class="col-lg-4 col-sm-3">
        <div style=" font-size: 1em; font-size: 1.3em; height: 46px; line-height: 46px;">
            <div class="tool-bar__report-date-box" style="text-align: center;">
                <span class="tool-bar__report-date-box__date">
                    <?= date('d.m.y'); ?>
                </span>
                <span class="glyphicon glyphicon-calendar calendar-toggle" style="padding-left: 10pt; color:rgb(84, 84, 84);"></span>

                <div class="calendar-box">
                    <select class="calendar-box__month-select">
                        <option value="0">Январь</option>
                        <option value="1">Февраль</option>
                        <option value="2">Март</option>
                        <option value="3">Апрель</option>
                        <option value="4">Май</option>
                        <option value="5">Июнь</option>
                        <option value="6">Июль</option>
                        <option value="7">Август</option>
                        <option value="8">Сентябрь</option>
                        <option value="9">Октябрь</option>
                        <option value="10">Ноябрь</option>
                        <option value="11">Декабрь</option>
                    </select>
                    <input class="calendar-box__year-select" type="number" value="" min="2012" max="9999" size="4" />

                    <table class="calendar-box__table">
                        <thead>
                        <tr class="calendar-box__table__week">
                            <td>Пн</td>
                            <td>Вт</td>
                            <td>Ср</td>
                            <td>Чт</td>
                            <td>Пт</td>
                            <td>Сб</td>
                            <td>Вс</td>
                        </tr>
                        </thead>

                        <tbody class="calendar-box__table__tbody">

                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-4 col-sm-5 btn-group-right">

        <div class="btn-group">
            <?= Html::button('', ['class' => 'btn btn-default glyphicon glyphicon-file report__new-report', 'title' => Yii::t('cashbox', 'Новый отчет')]);?>
        </div>

        <div class="btn-group">
            <?= Html::a('', '#', ['class'=> 'btn btn-default glyphicon glyphicon-print report_print-report', 'title' => Yii::t('cashbox', 'Печатать')]); ?>
        </div>

        <div class="btn-group btn-group-lg">
            <?= Html::a('', '#', ['class'=> 'btn btn-default glyphicon glyphicon-floppy-disk report__save-report', 'title' => Yii::t('cashbox', 'Сохранить')]); ?>
        </div>

        <div class="btn-group">
            <?= Html::a('', '#', ['class'=> 'btn btn-default glyphicon glyphicon-folder-open', 'title' => Yii::t('cashbox', 'Сохраненные отчеты'), 'name' => 'toggle-history']); ?>
        </div>

    </div>
</div>


<div class="col-lg-12 col-sm-12 report">
    <div class="report__info-box">
        <span class="report__info-box__status">Сохранено</span>
        <span class="report__info-box__total-cost">Итого: <span>0.00</span> руб.</span>
    </div>
    <div class="report__history col-lg-2"></div>

    <div class="col-lg-12 report__table-box">
        <table class="report__table">

            <thead class="report__table__thead">
                <tr class="report__table__thead__tr">
                    <td>№</td>
                    <td>Сумма</td>
                    <td>Тип цены</td>
                    <td>Клиент</td>
                    <td>Менеджер</td>
                    <td>Колонка</td>
                    <td>Номер документа</td>
                    <td>Дата документа</td>
                </tr>
            </thead>
            <tbody class="report__table__tbody">
                <tr class="report__table__tbody__tr">
                    <td class="report__table__tbody__tr__row-number">1</td>
                    <td class="report__table__tbody__tr__cost"><input class="report__table__tbody__tr__cost__input" autofocus/></td>
                    <td class="report__table__tbody__tr__price-type"><input class="report__table__tbody__tr__price-type__input"/></td>
                    <td class="report__table__tbody__tr__client"><input class="report__table__tbody__tr__client__input"/></td>
                    <td class="report__table__tbody__tr__manager"><input class="report__table__tbody__tr__manager__input"/></td>
                    <td class="report__table__tbody__tr__price-column"><input class="report__table__tbody__tr__price-column__input"/></td>
                    <td class="report__table__tbody__tr__document-number"><input class="report__table__tbody__tr__document-number__input"/></td>
                    <td class="report__table__tbody__tr__document-date"><input class="report__table__tbody__tr__document-date__input"/></td>
                </tr>
                <tr class="report__table__tbody__tr_last">
                    <td class="report__table__tbody__tr__row-number">2</td>
                    <td class="report__table__tbody__tr__cost"><input class="report__table__tbody__tr__cost__input"/></td>
                    <td class="report__table__tbody__tr__price-type"><input class="report__table__tbody__tr__price-type__input"/></td>
                    <td class="report__table__tbody__tr__client"><input class="report__table__tbody__tr__client__input"/></td>
                    <td class="report__table__tbody__tr__manager"><input class="report__table__tbody__tr__manager__input"/></td>
                    <td class="report__table__tbody__tr__price-column"><input class="report__table__tbody__tr__price-column__input"/></td>
                    <td class="report__table__tbody__tr__document-number"><input class="report__table__tbody__tr__document-number__input"/></td>
                    <td class="report__table__tbody__tr__document-date"><input class="report__table__tbody__tr__document-date__input"/></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<input style="opacity: 0;"/>
