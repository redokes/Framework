<?php
class Simon_Scrape_ProcessController extends Papercut_AjaxController {
	
	public function processAction() {
		$scrape = new Scrape_Model_Info(getParam('scrapeId', 0));
		$scrape->loadPost();
		$this->addError($scrape->validate(true));
		
		if (!$this->anyErrors()) {
			$scrape->process();
			
			$this->setParam('record', $scrape->row);
			$message = 'Info has been saved';
			$this->addMessage($message);
		}
	}
	
	public function deleteAction() {
		$selectedIds = $_POST['selected'];
		$titles = array();
		for ($i = 0; $i < count($selectedIds); $i++) {
			$scrape = new Scrape_Model_Info($selectedIds[$i]);
			$titles[] = $scrape->row['pageTitle'];
			$scrape->delete();
		}
		$this->addMessage(implode(', ', $titles) . ' <strong>deleted</strong>');
	}
	
	public function gridAction() {
		$grid = new Papercut_Query();
		$gridResult = $grid->getRecords();
		
		foreach ($gridResult as $param => $value){
			$this->setParam($param, $value);
		}
	}
	
	public function loadRowAction() {
		$scrape = new Scrape_Model_Info(getParam('id', 0));
		$this->setParam('record', $scrape->row);
	}
	
	public function cleanAction() {
		$query = "TRUNCATE scrape_info";
		mysql_query($query);
		$query = "TRUNCATE scrape_pages";
		mysql_query($query);
		$query = "TRUNCATE scrape_elements";
		mysql_query($query);
		$query = "TRUNCATE scrape_references";
		mysql_query($query);
	}
}