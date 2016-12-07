<?php

namespace common\modules\cashbox\common\models;

use Yii;

/**
 * This is the model class for table "{{%cashbox_manager}}".
 *
 * @property integer $id
 * @property string $managername
 * @property integer $status
 */
class CashboxManager extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%cashbox_manager}}';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['managername'], 'required'],
            [['status'], 'integer'],
            [['managername'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'managername' => 'Managername',
            'status' => 'Status',
        ];
    }
}
