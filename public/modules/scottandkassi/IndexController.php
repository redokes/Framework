<?php

class Scottandkassi_IndexController extends Redokes_Controller_Action {

	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Scott and Kassi',
				'head' => '<link rel="icon" type="image/png" href="http://scottandkassi.com/favicon.png" />'
			))
			->addCss('/modules/scottandkassi/css/scottandkassi.css')
			->addJs('/js/jquery/jquery-1.6.4.min.js')
			->addJs('/modules/scottandkassi/js/scottandkassi.js');
	}

}