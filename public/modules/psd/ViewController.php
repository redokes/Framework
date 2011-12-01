<?php
class Psd_ViewController extends Redokes_Controller_Action {

	public function indexAction() {
		$psd = new Psd_Model_Template();
		$select = $psd->table->select();
		$rows = $psd->table->fetchAll($select);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$row = $rows[$i];
			$psd = new Psd_Model_Template();
			$psd->row = $row;
			echo '<p>' . $row->psdId . '. ' . $row->title . ' ' . $row->hash . ' <a href="'.$psd->getPageUrl().'">View</a></p>';
		}
	}
	
}