<?php

class Scrape_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
//		$log = new Log_Entry('Scrape Test', array('one' => 'two'), 'info', 'Scrape');
//		$log->log();
		
		$this->getView()
			->setValues(array(
				'title' => 'Scrape Manager'
			))
			->addCss('/js/ext-4.0.7-gpl/resources/css/ext-all.css')
			->addJs('/js/ext-4.0.7-gpl/ext-all.js')
			
//			->addCss('/js/ext-4.1-pr1/resources/css/ext-neptune.css')
//			->addJs('/js/ext-4.1-pr1/ext-all-debug.js')
//			->addJs('/js/ext-4.1-pr1/ext-neptune.js')
			
			->addJs('/js/redokes/redokes.js');
	}
	
}