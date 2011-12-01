<?php

class Template_TemplateController extends Redokes_Controller_Ajax {
	
	public function getGridRecordsAction() {
		$template = new Template_Model_Template();
		$select = $template->table->select()->order('title');
		$rows = $template->table->fetchAll($select);
		$records = $rows->toArray();
		$numRecords = count($records);
		
		// Loop through each record and set a fake thumb
		$privateTemplatesDir = $template->getPrivateTemplatesDir();
		$publicTemplatesDir = $template->getPublicTemplatesDir();
		for ($i = 0; $i < $numRecords; $i++) {
			$localThumb = $privateTemplatesDir . $records[$i]['hash'] . '/thumb.png';
			$publicThumb = $publicTemplatesDir . $records[$i]['hash'] . '/thumb.png';
			if (!is_file($localThumb)) {
				// TODO: use default image
				$publicThumb = '/google.png';
			}
			$records[$i]['thumb'] = $publicThumb;
			$records[$i]['url'] = '/template/view/' . $records[$i]['hash'];
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
		if (isset($_FILES['resource']) && $_FILES['resource']['error'] == 0) {
			$template->processResourceFile($_FILES['resource']['tmp_name'], $_FILES['resource']['name']);
		}
		if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
			$template->processTemplateFile($_FILES['file']['tmp_name'], $_FILES['file']['name']);
		}
		
		$template->createThumb();
		
		if ($template->anyErrors()) {
			$this->addError($template->errors);
		}
		else {
			$record = $template->row->toArray();
			$record['thumb'] = $template->getPublicDir() . 'thumb.png?ts=' . time();
			$this->setParam('record', $record);
		}
	}
	
	public function makeEditableAction() {
		$id = $this->frontController->getParam('id');
		$templateId = $this->frontController->getParam('templateId');
		$template = new Template_Model_Template($templateId);
		$template->makeEditable($id);
		$this->setParam('domId', $id);
	}
	
	public function updateContentAction() {
		parse_str(file_get_contents('php://input'), $params);
		$content = json_decode($params['content'], true);
		foreach($content as $domId => $data) {
			$value = $data['value'];
			
		}
		$this->setParam('post', $content);
	}
	
}