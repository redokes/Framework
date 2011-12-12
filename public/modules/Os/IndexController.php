<?php

class Launcher_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()->setValues(array(
			'title' => 'Redokes OS'
		))
		->addExtJs()
		->addJs('/js/redokes/bootstrap.js')
		->addCss('/js/redokes/resources/redokes.css');
	}
	
}