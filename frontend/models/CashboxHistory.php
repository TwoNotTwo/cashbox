<?php

namespace common\modules\cashbox\frontend\models;

use Yii;

/**
 * This is the model class for table "{{%cashbox_history}}".
 *
 * @property integer $id
 * @property integer $seller_id
 * @property string $cost
 * @property string $report_date
 * @property string $create_date
 * @property integer $lock
 */
class CashboxHistory extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%cashbox_history}}';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['seller_id', 'report_date', 'create_date'], 'required'],
            [['seller_id', 'lock'], 'integer'],
            [['cost'], 'number'],
            [['report_date', 'create_date'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'seller_id' => 'Seller ID',
            'cost' => 'Cost',
            'report_date' => 'Report Date',
            'create_date' => 'Create Date',
            'lock' => 'Lock',
        ];
    }
}
