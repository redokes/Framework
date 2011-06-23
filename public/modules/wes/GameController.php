<?php

class Wes_GameController extends Redokes_Controller_Action {

	public function init() {
		$this->getView()
			->setValues(array(
				'title' => 'Wes Game'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
			->addJs('/modules/wes/js/wesokes.js');
	}

	public function indexAction() {
		
	}

}