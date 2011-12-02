<?php

class Psd_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Psd Importer'
			))
			->addExtJs()
			->addCss('/modules/template/css/template.css')
			->addJs('/js/redokes/redokes.js');
	}
	
}