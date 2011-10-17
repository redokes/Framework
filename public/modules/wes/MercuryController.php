<?php

class Wes_MercuryController extends Redokes_Controller_Action {

	public function init() {
		$this->getView()
			->setValues(array(
				'title' => 'Mercury Test'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addCss('/js/mercury/stylesheets/mercury.bundle.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
//			->addJs('/js/mercury/javascripts/mercury_loader.js?src=/js/mercury&pack=bundled');
			->addJs('/js/mercury/javascripts/mercury.js');
	}
	
	public function indexAction() {
		
	}
	
	public function editorAction() {
		
	}

}