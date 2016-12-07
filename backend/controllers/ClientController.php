<?php
/**
 * Created by PhpStorm.
 * User: Ganenko.k
 * Date: 07.12.2016
 * Time: 16:23
 */

namespace common\modules\cashbox\backend\controllers;

use Yii;
use yii\web\Controller;
use yii\data\ActiveDataProvider;
use common\modules\cashbox\common\models\CashboxClient;

class ClientController extends Controller {

    public function actionIndex(){

        $recordCount = CashboxClient::find()->count();
/*
        $provider = new ActiveDataProvider([
            'query' => CashboxClient::find(),
            'pagination' => [
                'pageSize' => 15,
            ],

        ]);
*/
        return $this->render('index',[
            'recordCount' => $recordCount,
  //          'dataProvider' =>$provider

        ]);
    }

    public function actionFindUncorrInitials(){
        if (Yii::$app->request->isAjax){
            $query = CashboxClient::find()->where(['clientname' => 'Очкина Г.Н'])->all();


            return $query;
        }
    }


} 