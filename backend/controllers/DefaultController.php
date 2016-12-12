<?php

namespace common\modules\cashbox\backend\controllers;

use yii\web\Controller;

/**
 * Default controller for the `Yii2CashboxBackend` module
 */
class DefaultController extends Controller
{
    /**
     * Renders the index view for the module
     * @return string
     */
    public function actionIndex()
    {
        return $this->render('index');
    }
}
