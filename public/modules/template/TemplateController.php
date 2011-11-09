<?php

class Template_TemplateController extends Redokes_Controller_Ajax {
	
	public function getGridRecordsAction() {
		$template = new Template_Model_Template();
		$select = $template->table->select()->order('title');
		$rows = $template->table->fetchAll($select);
		$records = $rows->toArray();
		$numRecords = count($records);
		
		// Loop through each record and set a fake thumb
		for ($i = 0; $i < $numRecords; $i++) {
			$records[$i]['thumb'] = '/google.png';
		}
		
		$this->setParam('records', $records);
		$this->setParam('total', count($records));
	}
	
	public function submitAction() {
		// Load record if it exists
		$templateId = $this->frontController->getParam('templateId', 0);
		$template = new Template_Model_Template($templateId);
		
		// Set new row data and save
		$template->setRow($_POST);
		$template->save();
		
		// Check if there were uploaded files
		if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
			$template->processTemplateFile($_FILES['file']['tmp_name'], $_FILES['file']['name']);
		}
		if (isset($_FILES['resource']) && $_FILES['resource']['error'] == 0) {
			$template->processResourceFile($_FILES['resource']['tmp_name'], $_FILES['resource']['name']);
		}
		
		
		
		if ($template->anyErrors()) {
			$this->addError($template->errors);
		}
		else {
			$this->setParam('record', $template->row->toArray());
		}
	}
	
}