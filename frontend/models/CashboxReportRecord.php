<?php

namespace common\modules\cashbox\frontend\models;

use Yii;

/**
 * This is the model class for table "{{%cashbox_report_record}}".
 *
 * @property integer $id
 * @property integer $history_id
 * @property string $cost
 * @property string $price_type
 * @property integer $manager_id
 * @property integer $client_id
 * @property string $price_column
 * @property string $document_number
 * @property string $document_date
 */
class CashboxReportRecord extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%cashbox_report_record}}';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['history_id', 'cost'], 'required'],
            [['history_id', 'manager_id', 'client_id'], 'integer'],
            [['cost'], 'number'],
            [['document_date'], 'safe'],
            [['price_type', 'price_column', 'document_number'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'history_id' => 'History ID',
            'cost' => 'Cost',
            'price_type' => 'Price Type',
            'manager_id' => 'Manager ID',
            'client_id' => 'Client ID',
            'price_column' => 'Price Column',
            'document_number' => 'Document Number',
            'document_date' => 'Document Date',
        ];
    }
}
