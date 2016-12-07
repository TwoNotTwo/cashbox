<?php
/**
 * Created by PhpStorm.
 * User: Ganenko.k
 * Date: 07.12.2016
 * Time: 13:31
 */

namespace common\modules\cashbox\backend\assets;

use yii\web\AssetBundle;


class CashboxBackendAsset extends AssetBundle
{

    public $publishOptions = [
        'forceCopy' => true
    ];

    public $sourcePath = '@common/modules/cashbox/backend/web';

    public $css = [
        'css/cashboxbackend.css',

    ];
    public $js = [
        'js/cashboxbackend.js',

    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}