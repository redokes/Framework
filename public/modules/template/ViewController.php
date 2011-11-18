<?php

class Template_ViewController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$template = new Template_Model_Template();
		$select = $template->table->select();
		$rows = $template->table->fetchAll($select);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$row = $rows[$i];
			echo '<p>' . $row->templateId . '. ' . $row->title . ' ' . $row->hash . ' <a href="/template/view/' . $row->hash . '">View</a></p>';
		}
	}
	
	public function _catch(){
		$hash = intval($this->frontController->action);
		$template = new Template_Model_Template();
		$template->loadRow($hash, 'hash');
		if ($template->row->templateId) {
			$this->outputTemplate($template);
		}
		else {
			$this->indexAction();
		}
	}
	
	/**
	 *
	 * @param Template_Model_Template $template 
	 */
	public function outputTemplate($template) {
//		error_log(print_r($_SERVER, 1));
//		$template->updateReferences();
		$indexFile = $template->getIndexFile();
		$content = file_get_contents($indexFile);
		$this->getView()->setHtml($content);
		
//		$this->getView()
//			->addCss('/js/ext-4.0.7-gpl/resources/css/ext-all.css')
//			->addJs('/js/ext-4.0.7-gpl/ext-all.js')
//			->addJs('/js/redokes/redokes.js');
		$params = array(
			'pack' => 'bundled',
			'src' => '/js/mercury'
		);
		$urlParams = array();
		foreach($params as $key => $value) {
			$urlParams[] = $key . '=' . $value;
		}
		$params = implode('&', $urlParams);
		$this->getView()
			->addJs('/js/mercury/mercury_loader.js?' . $params);
	}
	
}