<?php

class Files_IndexController extends Redokes_Controller_Action {
	
	public function init() {
		$this->getView()
			->setValues(array(
				'title' => 'File Test'
			))
			->addJs('/js/ext-4.0.7-gpl/ext-all.js')
			->addCss('/js/ext-4.0.7-gpl/resources/css/files-theme.css')
			->addCss('/modules/files/css/files.css')
			->addJs('/js/redokes/redokes.js');
	}
	
	public function indexAction() {
		
	}
	
	public function wesAction() {
		$this->getView()
			->addJs('http://localhost:8080/socket.io/socket.io.js');
	}
	
}