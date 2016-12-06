<?php

namespace common\modules\cashbox\frontend;

use Yii;
class Yii2Cashbox extends \yii\base\Module
{
    /**
     * @inheritdoc
     */
    public $controllerNamespace = 'common\modules\cashbox\frontend\controllers';

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
        $this->registerTranslations();

        // custom initialization code goes here
    }

    public function registerTranslations()
    {
        Yii::$app->i18n->translations['cashbox'] = [
            'class' => 'yii\i18n\PhpMessageSource',
            'sourceLanguage' => 'ru-Ru',
            'basePath' => '@common/modules/cashbox/messages',
        ];
    }

    public static function t($category, $message, $params = [], $language = null)
    {
        return Yii::t('@common/modules/cashbox' . $category, $message, $params, $language);
    }
}
