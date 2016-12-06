<?php

namespace common\modules\cashbox\frontend\models;

use Yii;

/**
 * This is the model class for table "{{%cashbox_seller}}".
 *
 * @property integer $id
 * @property string $sellername
 * @property integer $status
 */
class CashboxSeller extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%cashbox_seller}}';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['sellername'], 'required'],
            [['status'], 'integer'],
            [['sellername'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'sellername' => 'Sellername',
            'status' => 'Status',
        ];
    }
}