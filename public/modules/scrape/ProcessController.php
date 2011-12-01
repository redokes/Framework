<?php
class Scrape_ProcessController extends Redokes_Controller_Ajax {
	
	public function processAction() {
		// Load record if it exists
		$scrapeId = $this->frontController->getParam('scrapeId', 0);
		$scrape = new Scrape_Model_Info($scrapeId);
		
		// Set new row data and save
		$scrape->setRow($_POST);
		$scrape->save();
		
		if ($scrape->anyErrors()) {
			$this->addError($scrape->errors);
		}
		else {
			$record = $scrape->row->toArray();
			$this->setParam('record', $record);
		}
	}
	
	public function deleteAction() {
		$selectedIds = $_POST['selected'];
		$titles = array();
		for ($i = 0; $i < count($selectedIds); $i++) {
			$scrape = new Scrape_Model_Info($selectedIds[$i]);
			$titles[] = $scrape->row['title'];
			$scrape->delete();
		}
		$this->addMessage(implode(', ', $titles) . ' <strong>deleted</strong>');
	}
	
	public function getGridRecordsAction() {
		$scrape = new Scrape_Model_Info();
		$select = $scrape->table->select()->order('scrapeId');
		$rows = $scrape->table->fetchAll($select);
		$records = $rows->toArray();
		$numRecords = count($records);
		
		// Loop through each record and set a fake thumb
//		$privateTemplatesDir = $template->getPrivateTemplatesDir();
//		$publicTemplatesDir = $template->getPublicTemplatesDir();
//		for ($i = 0; $i < $numRecords; $i++) {
//			$localThumb = $privateTemplatesDir . $records[$i]['hash'] . '/thumb.png';
//			$publicThumb = $publicTemplatesDir . $records[$i]['hash'] . '/thumb.png';
//			if (!is_file($localThumb)) {
//				// TODO: use default image
//				$publicThumb = '/google.png';
//			}
//			$records[$i]['thumb'] = $publicThumb;
//			$records[$i]['url'] = '/template/view/' . $records[$i]['hash'];
//		}
		
		$this->setParam('records', $records);
		$this->setParam('total', count($records));
	}
	
	public function loadRowAction() {
		$scrape = new Scrape_Model_Info(getParam('id', 0));
		$this->setParam('record', $scrape->row);
	}
	
	public function cleanAction() {
		$db = $this->frontController->getDbAdapter();
		$query = "TRUNCATE scrape_info";
		$db->query($query);
		$query = "TRUNCATE scrape_page";
		$db->query($query);
		$query = "TRUNCATE scrape_element";
		$db->query($query);
		$query = "TRUNCATE scrape_reference";
		$db->query($query);
	}
	
}