<?php 

class Redirect_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Redirect Manager'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
			->addJs('/js/redokes/redokes.js');
	}
	
}