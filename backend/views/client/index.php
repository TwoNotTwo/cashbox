<?php
/**
 * Created by PhpStorm.
 * User: Ganenko.k
 * Date: 07.12.2016
 * Time: 16:24
 */

/*
use yii\grid\GridView;
use yii\grid\SerialColumn;
use yii\grid\ActionColumn;
use yii\helpers\Url;
use yii\helpers\Html;
*/
use common\modules\cashbox\backend\assets\ClientAsset;

    $this->title = 'Управление записями о клиентах';

ClientAsset::register($this);
?>

<h3>Управление записями о клиентах</h3>

<div class="col-lg-4">
    <div class="row">
        Всего клиентов в базе: <?= $recordCount ?>
    </div>
    <button class="btn btn-default find-duplicate">Поиск неверных инициалов</button>
</div>

<div class="col-lg-6 client-body">

    <?php/* GridView::widget([
        'dataProvider' => $dataProvider,
        'columns' => [
            'clientname',

            [
                'class' => ActionColumn::className(),
                'template' => '{update}',
                'contentOptions' => ['width' => '23pt'],
                'buttons' => [
                    'update' => function ($url, $model) {
                        return Html::a('<span class="glyphicon glyphicon-pencil"></span>', '#'
                            , [
                                'title' => Yii::t('yii', 'Update'),
                                'data-pjax' => '0',
                            ]);
                    },

                ]
            ],
        ],
        ])
*/
    ?>
</div>