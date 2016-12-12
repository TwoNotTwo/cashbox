<?php

namespace common\modules\cashbox\common\models;

use Yii;

/**
 * This is the model class for table "{{%cashbox_client}}".
 *
 * @property integer $id
 * @property string $clientname
 * @property integer $manager_id
 * @property string $price_column
 * @property integer $status
 */
class CashboxClient extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%cashbox_client}}';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['clientname'], 'required'],
            [['manager_id', 'status'], 'integer'],
            [['clientname'], 'string', 'max' => 255],
            [['price_column'], 'string', 'max' => 10],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'clientname' => 'Клиент',
            'manager_id' => 'Manager ID',
            'price_column' => 'Price Column',
            'status' => 'Status',
        ];
    }

}
