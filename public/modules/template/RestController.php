<?php

class Template_RestController extends Redokes_Controller_Rest {
	
	public function delete() {
		$ids = json_decode($this->frontController->params['ids'], true);
		$numIds = count($ids);
		for ($i = 0; $i < $numIds; $i++) {
			$template = new Template_Model_Template($ids[$i]);
			$template->delete();
		}
	}
	
	public function post() {
		error_log('post time');
	}
	
}