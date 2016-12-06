<?php

namespace common\modules\cashbox\frontend\assets;

use yii\web\AssetBundle;


class CashboxAsset extends AssetBundle
{

    public $publishOptions = [
        'forceCopy' => true
    ];

    public $sourcePath = '@common/modules/cashbox/frontend/web';

    public $css = [
        'css/cashbox.css',
        'css/contextmenu.css',
        'css/calendar.css',
        'css/autocomplete.css',
    ];
    public $js = [
        'js/cashbox.js',
        'js/contextmenu.js',
        'js/calendar.js',
        'js/core_autocomplete.js',

    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}