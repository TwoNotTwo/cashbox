<?php
/**
 * Created by PhpStorm.
 * User: Ganenko.k
 * Date: 07.12.2016
 * Time: 17:16
 */

namespace common\modules\cashbox\backend\assets;

use yii\web\AssetBundle;


class ClientAsset extends AssetBundle {
    public $publishOptions = [
        'forceCopy' => true
    ];

    public $sourcePath = '@common/modules/cashbox/backend/web';

    public $css = [


    ];
    public $js = [
        'js/client.js',

    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];

} 