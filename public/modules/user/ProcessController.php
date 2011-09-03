<?php 
class User_ProcessController extends Redokes_Controller_Ajax {
	
	public function registerAction() {
		$email = $this->frontController->getParam('email');
		$password = $this->frontController->getParam('password');
		$confirmPassword = $this->frontController->getParam('confirmPassword');
		
		$user = new User_Model_User();
		$user->loadPost();
		$success = $user->save();
		if (!$success) {
			$this->addError($user->errors);
		}
		
	}
	
	public function loginAction() {
		$email = $this->frontController->getParam('email');
		$password = $this->frontController->getParam('password');
		
		$user = new User_Model_User();
		$user->loadPost();
		$success = $user->login();
		if (!$success) {
			$this->addError('Incorrect login');
		}
	}
	
	public function logoutAction() {
		$user = new User_Model_User();
		$user->logout();
	}
	
}