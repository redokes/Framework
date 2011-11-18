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
		$template->updateReferences();
		return;
		$indexFile = $template->getPrivateDir() . 'index.html';
		include($indexFile);
	}
	
}