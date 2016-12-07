<?php

use common\modules\cashbox\backend\assets\CashboxBackendAsset;

CashboxBackendAsset::register($this);
$this->title = 'Управление кассовым отчетом';

?>

<div class="cashboxbackend-toolbar">
    <div class="btn-group btn-group-sm">
        <button class="btn btn-default">Неправильные инициалы</button>
        <button class="btn btn-default">Дубликаты</button>
        <button class="btn btn-default">Переназначить клиентов другому менеджеру</button>
        <button class="btn btn-default">Продавцы</button>
        <button class="btn btn-default">Клиенты</button>
        <button class="btn btn-default">Менеджеры</button>

    </div>
</div>

<div class="cashboxbackend-body">

</div>

<!--
<div class="col-lg-8">
    <div> <input type="text" /></div>

</div>
<div class="col-lg-4">
    <ul>
        <li><a href="#">Поиск неправильных инициалов</a></li>
        <li><a href="#">Поиск дубликатов</a></li>
        <li><a href="#">Переназначить клиентов другому менеджеру</a></li>
        <li><a href="#">Продавцы</a></li>
        <li><a href="#">Менеджеры</a></li>
        <li><a href="#">Клиенты</a></li>
    </ul>

</div>

-->