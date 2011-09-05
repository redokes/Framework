<?php

class Files_IndexController extends Redokes_Controller_Action {
	
	public function init() {
		$this->getView()
			->setValues(array(
				'title' => 'File Test'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
			->addJs('/js/redokes/redokes.js');
	}
	
	public function indexAction() {
		
	}
	
	public function wesAction() {
		
	}
}