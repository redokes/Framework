<?php

class Wes_TestController extends Redokes_Controller_Action {

	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'this is the title'
			));
	}

}