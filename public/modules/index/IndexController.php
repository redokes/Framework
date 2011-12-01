<?php

class Index_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()->setValues(array(
			'title' => 'Index',
			'body' => 'Redokes Framework'
		));
	}
	
}
