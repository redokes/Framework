<?php

class User_IndexController extends Redokes_Controller_Action {
	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'User'
			))
			->addExtJs()
			->addJs('/js/redokes/redokes.js');
		
		if (User_Model_User::isLoggedIn()) {
			echo 'is logged in';
		}
		else {
			$this->setView('login');
			echo 'is not logged in';
		}
	}
}