<?php

class Index_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()->setValues(array(
			'title' => 'Index'
		));
		
		$user = new User_Model_User();
		$user->loadSessionUser();
		if ($user->hasAccess('Fake')) {
			echo 'has access';
		}
		else {
			echo 'no access';
		}
	}
	
}