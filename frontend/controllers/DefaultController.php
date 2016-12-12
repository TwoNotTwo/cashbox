<?php

namespace common\modules\cashbox\frontend\controllers;

use Yii;
//use yii\db\QueryBuilder;
use yii\web\Controller;
use common\modules\cashbox\common\models\CashboxSeller;
use common\modules\cashbox\common\models\CashboxClient;
use common\modules\cashbox\common\models\CashboxManager;
use common\modules\cashbox\common\models\CashboxHistory;
use common\modules\cashbox\common\models\CashboxReportRecord;



/**
 * Default controller for the `cashbox` module
 */
class DefaultController extends Controller
{
    /**
     * Renders the index view for the module
     * @return string
     */
    public function actionIndex()
    {
        $sellerList = CashboxSeller::find()->where(['status' => '1'])->all();
        return $this->render('index', [
            'sellerList' => $sellerList,
        ]);
    }


    public function actionGetSellerList(){
        $records = CashboxSeller::find()->where(['status' => 1])->all();
        $answer = '';
        for ($i=0; $i<count($records); $i++ ){
            foreach ($records[$i] as $value)
                $answer .= $value .',';
            $answer = substr($answer, 0, strlen($answer)-1);
            ($i < count($records)-1) ? $answer .= ';': false;
        }
        return $answer;
    }

    public function actionGetClientList(){
        $records = CashboxClient::find()->where(['status' => 1])->all();
        $answer = '';
        for ($i=0; $i<count($records); $i++ ){
            foreach ($records[$i] as $value)
                $answer .= $value .',';
            $answer = substr($answer, 0, strlen($answer)-1);
            ($i < count($records)-1) ? $answer .= ';': false;
        }
        return $answer;
    }


    public function actionGetManagerList(){
        $records = CashboxManager::find()->where(['status' => 1])->all();
        $answer = '';
        for ($i=0; $i<count($records); $i++ ){
            foreach ($records[$i] as $value)
                $answer .= $value .',';
            $answer = substr($answer, 0, strlen($answer)-1);
            ($i < count($records)-1) ? $answer .= ';': false;
        }
        return $answer;
    }


    public function actionFindManager(){
        if (Yii::$app->request->post('managername')){
            $managerName = Yii::$app->request->post('managername');
            $record = CashboxManager::findOne(['managername' => $managerName]);
            if ($record == null){
                $manager = new CashboxManager();
                $manager->managername = $managerName;
                $manager->save();
                return $manager->id.'::'.$manager->managername;
            } else return $record->id.'::'.$record->managername;

        }
    }

    public function actionFindClient(){
        if (Yii::$app->request->post('clientname')){
            $clientname = Yii::$app->request->post('clientname');
            $manager = (Yii::$app->request->post('manager')) ? Yii::$app->request->post('manager') : null;
            $priceColumn = (Yii::$app->request->post('pricecolumn')) ? Yii::$app->request->post('pricecolumn') : null;

            $record = CashboxClient::findOne(['clientname' => $clientname]);
            if ($record == null){
                $client = new CashboxClient();

                $client->clientname = $clientname;
                $client->manager_id = $manager;
                $client->price_column = $priceColumn;
                $client->save();
                return $client->id.'::'.$client->clientname.'::'.$client->manager_id.'::'.$client->price_column;
            } else {
                $record->manager_id = $manager;
                $record->price_column = $priceColumn;
                $record->save();
                return $record->id.'::'.$record->clientname.'::'.$record->manager_id.'::'.$record->price_column;
            }


        } else return 'no clientname';

    }


    public function actionSaveReport(){
        if (Yii::$app->request->post('report')){
            $newReport_data = Yii::$app->request->post('report');

            $idRecord = null;
            /**
             * $reportDate - хранит дату отчета (выбирается в календаре)
             * Сейчас дата приходит в "правильном" формате гггг-мм-дд,
             * вероятно стоит преобразование в этот формат сделать на сервере.
             * При передачи даты указать маску, по которой дата сформирована
             */
            $reportDate = $newReport_data[0];

            $seller = $newReport_data[1];

            // "уменьшаем" количество элементов на 2, так как первые два элемента - это дата отчета и компания-продавец
            $newReport_size = count($newReport_data)-2;

            $oldHistory = CashboxHistory::findOne(['seller_id' => $seller, 'report_date' => $reportDate, 'lock' => 0 ]);

            // сохраняем новый отчет
            if ($oldHistory == null){

                $newHistory = new CashboxHistory();
                $newHistory->seller_id = $seller;
                $newHistory->report_date = $reportDate;
                $newHistory->create_date = date('Y-m-d');
                $newHistory->save();

                $cost = 0.00;
                for ($i = 0; $i < $newReport_size; $i++) {
                    $newReport = new CashboxReportRecord();
                    $newReport->history_id = $newHistory->id;
                    $newReport->cost = str_replace(' ', '', $newReport_data[$i + 2][0]);
                    $newReport->price_type = $newReport_data[$i + 2][1];
                    $newReport->client_id = $newReport_data[$i + 2][2];
                    $newReport->manager_id = $newReport_data[$i + 2][3];
                    $newReport->price_column = $newReport_data[$i + 2][4];
                    $newReport->document_number = $newReport_data[$i + 2][5];
                    $newReport->document_date = $newReport_data[$i + 2][6];
                    $newReport->save();

                    $cost += $newReport->cost;
                }
                $newHistory->cost = $cost;
                $newHistory->save();

            } else {
                //пересохраняем существующий отчет

                /** получим все записи (только id), которые привязаны к отчету */
                $oldReport = CashboxReportRecord::find()->where(['history_id' => $oldHistory->id])->all();
                $oldReport_size = count($oldReport);

                $cost = 0.0;
                if ($oldReport_size == $newReport_size){
                    echo 'количество записей не изменилось.';
                    for ($i =0; $i<$oldReport_size; $i++){
                        $oldReport[$i]->cost = str_replace(' ', '', $newReport_data[$i + 2][0]);
                        $oldReport[$i]->price_type = $newReport_data[$i + 2][1];
                        $oldReport[$i]->client_id = $newReport_data[$i + 2][2];
                        $oldReport[$i]->manager_id = $newReport_data[$i + 2][3];
                        $oldReport[$i]->price_column = $newReport_data[$i + 2][4];
                        $oldReport[$i]->document_number = $newReport_data[$i + 2][5];
                        $oldReport[$i]->document_date = $newReport_data[$i + 2][6];
                        $oldReport[$i]->save();
                        $cost += $oldReport[$i]->cost;
                    }
                    $oldHistory->cost = $cost;
                    $oldHistory->save();
                }
                if ($oldReport_size > $newReport_size){
                    echo 'количество записей сократилось.';
                    for ($i =0; $i<$newReport_size; $i++){
                        $oldReport[$i]->cost = str_replace(' ', '', $newReport_data[$i + 2][0]);
                        $oldReport[$i]->price_type = $newReport_data[$i + 2][1];
                        $oldReport[$i]->client_id = $newReport_data[$i + 2][2];
                        $oldReport[$i]->manager_id = $newReport_data[$i + 2][3];
                        $oldReport[$i]->price_column = $newReport_data[$i + 2][4];
                        $oldReport[$i]->document_number = $newReport_data[$i + 2][5];
                        $oldReport[$i]->document_date = $newReport_data[$i + 2][6];
                        $oldReport[$i]->save();
                        $cost += $oldReport[$i]->cost;
                    }
                    $oldHistory->cost = $cost;
                    $oldHistory->save();

                    for ($i=$newReport_size; $i<$oldReport_size; $i++){
                        $oldReport[$i]->delete();
                    }

                }
                if ($oldReport_size < $newReport_size){
                    echo 'количество записей увеличилось.';

                    for ($i =0; $i<$oldReport_size; $i++){
                        $oldReport[$i]->cost = str_replace(' ', '', $newReport_data[$i + 2][0]);
                        $oldReport[$i]->price_type = $newReport_data[$i + 2][1];
                        $oldReport[$i]->client_id = $newReport_data[$i + 2][2];
                        $oldReport[$i]->manager_id = $newReport_data[$i + 2][3];
                        $oldReport[$i]->price_column = $newReport_data[$i + 2][4];
                        $oldReport[$i]->document_number = $newReport_data[$i + 2][5];
                        $oldReport[$i]->document_date = $newReport_data[$i + 2][6];
                        $oldReport[$i]->save();

                        $cost += $oldReport[$i]->cost;
                    }

                    for ($i = $oldReport_size; $i < $newReport_size; $i++) {
                        $newReport = new CashboxReportRecord();
                        $newReport->history_id = $oldHistory->id;
                        $newReport->cost = str_replace(' ', '', $newReport_data[$i + 2][0]);
                        $newReport->price_type = $newReport_data[$i + 2][1];
                        $newReport->client_id = $newReport_data[$i + 2][2];
                        $newReport->manager_id = $newReport_data[$i + 2][3];
                        $newReport->price_column = $newReport_data[$i + 2][4];
                        $newReport->document_number = $newReport_data[$i + 2][5];
                        $newReport->document_date = $newReport_data[$i + 2][6];
                        $newReport->save();
                        $cost += $newReport->cost;
                    }

                    $oldHistory->cost = $cost;
                    $oldHistory->save();
                }

            }

        } else {
            echo 'нет параметра';
        }
    }

    public function actionPrintReport(){
        $report_data = Yii::$app->request->post('report');

        //echo $report_data;
        $report_saveDate = date("d.m.y", strtotime($report_data[0]));
        $seller = $report_data[1];

        $total_cost = 0.00;

        $reportTable_recordCount = count($report_data)-2;


        $objPHPExcel = new \PHPExcel();
        $sheet = 0;
        $objPHPExcel->setActiveSheetIndex($sheet);
        $objPHPExcel->getActiveSheet()->getPageSetup()->setPaperSize(\PHPExcel_Worksheet_PageSetup::PAPERSIZE_A4);

        $objPHPExcel->getActiveSheet()->getPageMargins()->setTop(0.0);
        $objPHPExcel->getActiveSheet()->getPageMargins()->setLeft(0.6);
        $objPHPExcel->getActiveSheet()->getPageMargins()->setRight(0.0);
        $objPHPExcel->getActiveSheet()->setCellValue('A1', $seller);


        $objPHPExcel->getActiveSheet()->getStyle('A1')->getFont()->setSize(14);
        $objPHPExcel->getActiveSheet()->getStyle('A1')->getFont()->setUnderline(\PHPExcel_Style_Font::UNDERLINE_SINGLE);
        $objPHPExcel->getActiveSheet()->setCellValue('C1', $report_saveDate);
        $objPHPExcel->getActiveSheet()->getStyle('C1')->getFont()->setSize(14);
        $objPHPExcel->getActiveSheet()->getStyle('C1')->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);
        $objPHPExcel->getActiveSheet()->getStyle('C1')->getFont()->setUnderline(\PHPExcel_Style_Font::UNDERLINE_SINGLE);

        $styleArray = new \PHPExcel_Style();
        $styleArray->applyFromArray(
            array(
                'borders' => array(
                    'bottom' => array('style' => \PHPExcel_Style_Border::BORDER_THIN),
                    'top' => array('style' => \PHPExcel_Style_Border::BORDER_THIN),
                    'left' => array('style' => \PHPExcel_Style_Border::BORDER_THIN),
                    'right' => array('style' => \PHPExcel_Style_Border::BORDER_THIN),

                ),
            )
        );


        $objPHPExcel->getActiveSheet()->getColumnDimension('A')->setWidth(11);
        $objPHPExcel->getActiveSheet()->getColumnDimension('B')->setWidth(14);
        $objPHPExcel->getActiveSheet()->getColumnDimension('C')->setWidth(31);
        $objPHPExcel->getActiveSheet()->getColumnDimension('D')->setWidth(13);
        $objPHPExcel->getActiveSheet()->getColumnDimension('E')->setWidth(5);
        $objPHPExcel->getActiveSheet()->getColumnDimension('F')->setWidth(9);
        $objPHPExcel->getActiveSheet()->getColumnDimension('G')->setWidth(12);
        $total_count_record = $reportTable_recordCount;
        $correct_pos = 3;

        for ($i = 0; $i < $reportTable_recordCount; $i++) {
            if (str_replace(' ', '', $report_data[$i + 2][0]) == '0') {
                $correct_pos -= 1;
            } else {
                $pos = $i + $correct_pos;

                $posA = 'A' . $pos;
                $posB = 'B' . $pos;
                $posC = 'C' . $pos;
                $posD = 'D' . $pos;
                $posE = 'E' . $pos;
                $posF = 'F' . $pos;
                $posG = 'G' . $pos;


                //дата отчета
                $objPHPExcel->getActiveSheet()->setCellValue($posA, $report_saveDate);  //заполняем дату
                $objPHPExcel->getActiveSheet()->getRowDimension($i + $correct_pos)->setRowHeight(30);
                $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posA);
                $objPHPExcel->getActiveSheet()->getStyle($posA)->getFont()->setSize(12);

                //сумма
                $cost = str_replace(' ', '', $report_data[$i + 2][0]);
                $objPHPExcel->getActiveSheet()->setCellValue($posB, (Float)$cost);
                $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posB);
                $objPHPExcel->getActiveSheet()->getStyle($posB)->getNumberFormat()->setFormatCode(\PHPExcel_Style_NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
                $objPHPExcel->getActiveSheet()->getStyle($posB)->getFont()->setSize(12);
                $total_cost += $cost;

                //клиент
                $objPHPExcel->getActiveSheet()->setCellValue($posC, $report_data[$i + 2][2]);
                $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posC);
                $objPHPExcel->getActiveSheet()->getStyle($posC)->getFont()->setSize(12);

                //менеджер
                $objPHPExcel->getActiveSheet()->setCellValue($posD, $report_data[$i + 2][3]);
                $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posD);
                $objPHPExcel->getActiveSheet()->getStyle($posD)->getFont()->setSize(12);

                //ценовая колонка
                $objPHPExcel->getActiveSheet()->setCellValue($posE, $report_data[$i + 2][4]);
                $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posE);
                $objPHPExcel->getActiveSheet()->getStyle($posE)->getFont()->setSize(12);

                //тип цены
                $objPHPExcel->getActiveSheet()->setCellValue($posF, $report_data[$i + 2][1]);
                $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posF);
                $objPHPExcel->getActiveSheet()->getStyle($posF)->getFont()->setSize(12);

                //данные накладной

                $document_data = '';
                if ($report_data[$i + 2][5] > 0) {
                    $document_data .= '№ ' . $report_data[$i + 2][5];
                }

                if ($report_data[$i + 2][6] > 0) {
                    $document_data .= strlen($document_data) > 0 ? '          ' : false;
                    $document_data .= 'от ' . $report_data[$i + 2][6];

                }
                $objPHPExcel->getActiveSheet()->setCellValue($posG, $document_data);

                $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posG);
                $objPHPExcel->getActiveSheet()->getStyle($posG)->getFont()->setSize(12);

                $objPHPExcel->getActiveSheet()->getStyle($posA)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                $objPHPExcel->getActiveSheet()->getStyle($posB)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                $objPHPExcel->getActiveSheet()->getStyle($posC)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                $objPHPExcel->getActiveSheet()->getStyle($posD)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                $objPHPExcel->getActiveSheet()->getStyle($posE)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                $objPHPExcel->getActiveSheet()->getStyle($posF)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                $objPHPExcel->getActiveSheet()->getStyle($posG)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

                $objPHPExcel->getActiveSheet()->getStyleByColumnAndRow(2, $pos)->getAlignment()->setWrapText(true);
                $objPHPExcel->getActiveSheet()->getStyleByColumnAndRow(6, $pos)->getAlignment()->setWrapText(true);
            }

        }

        $total = $total_count_record + $correct_pos;
        $posA = 'A' . $total;
        $posB = 'B' . $total;

        $objPHPExcel->getActiveSheet()->getRowDimension($total)->setRowHeight(30);
        $objPHPExcel->getActiveSheet()->setCellValue($posA, 'Итого:');
        $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posA);
        $objPHPExcel->getActiveSheet()->getStyle($posA)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
        $objPHPExcel->getActiveSheet()->getStyle($posA)->getFont()->setSize(12);

        $total_cost = str_replace(' ', '', $total_cost);
        $objPHPExcel->getActiveSheet()->setCellValue($posB, (Float)$total_cost);


        $objPHPExcel->getActiveSheet()->setSharedStyle($styleArray, $posB);
        $objPHPExcel->getActiveSheet()->getStyle($posB)->getFont()->setSize(12);
        $objPHPExcel->getActiveSheet()->getStyle($posB)->getNumberFormat()->setFormatCode(\PHPExcel_Style_NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
        $objPHPExcel->getActiveSheet()->getStyle($posB)->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);


        // Rename worksheet
        $objPHPExcel->getActiveSheet()->setTitle('Отчет по кассе за ' . $report_saveDate);


        // Set active sheet index to the first sheet, so Excel opens this as the first sheet
        $objPHPExcel->setActiveSheetIndex(0);

        //header('Content-Type: application/vnd.ms-excel');
        switch ($seller) {
            case '"ПВ-Регион" ООО':
                $seller = 'PV-Region';
            break;
            case '"Поливалент" ООО':
                $seller = 'Polivalent';
            break;
            default:
                $seller = '';
            break;

        }
        $filename = 'reports/Report_' . $seller . '_' . $report_saveDate . '.xls';
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        header('Cache-Control: max-age=0');
        $objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save($filename);
        //$objWriter->save(str_replace(__FILE__,'reports/'.$filename,__FILE__));

        /*
        $filename = "frontend/reports/reports/Report_" . $seller . '_' . $report_saveDate . '.xls';
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        $objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save($filename);

        return $filename;
        */
        return $filename;
    }

    public function actionLoadReport(){
        $answer = '';
        if (Yii::$app->request->post('id')){

            $historyId = Yii::$app->request->post('id');
            $reportDate = CashboxHistory::find()->where(['id' => $historyId])->all();

            if ($reportDate != null) {
                $reportDate = date('d.m.y', strtotime($reportDate[0]['report_date']));

                $records = CashboxReportRecord::find()->where(['history_id' => $historyId])->all();

                if (count($records) > 0) {
                    for ($i = 0; $i < count($records); $i++) {
                        $answer .= $records[$i]['id'] . ',' . $records[$i]['cost'] . ',' . $records[$i]['price_type'] . ',' . $records[$i]['manager_id'] . ',' . $records[$i]['client_id'] . ',' . $records[$i]['price_column'] . ',' . $records[$i]['document_number'] . ',' . date('d.m.y', strtotime($records[$i]['document_date']));
                        ($i < count($records) - 1) ? $answer .= ';' : false;
                    }
                    return $reportDate.';'.$answer;
                }
            }
            return $reportDate;
        }
    }

    public function actionGetHistory(){
        $answer ='';
        if (Yii::$app->request->post('seller')){
            $seller = Yii::$app->request->post('seller');
            $records = CashboxHistory::find()
                ->select(['id', 'cost', 'report_date'])
                ->where(['seller_id' => $seller])
                ->orderBy('report_date DESC')
                ->all();

            for ($i = 0; $i < count($records); $i++ ){
                $answer .= $records[$i]['id'].','.$records[$i]['cost'].','.$records[$i]['report_date'];//.';';
                ($i < count($records)-1) ? $answer .= ';': false;
            }
        }

        return $answer;
    }
}
