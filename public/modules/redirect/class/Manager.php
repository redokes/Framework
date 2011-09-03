<?php
class Redirect_Class_Manager extends Papercut_ModuleManager {
	public $title = 'Redirects';
	
	public $listeners = array(
		'FrontController.redirectLookup' => 'Redirect_Class_Manager::redirectLookup',
		'Simon_Application.init' => 'Redirect_Class_Manager::initApplication'
	);

	public static function initApplication(){
		FrontController::getInstance()->addScript('/modules/redirect/js/Interface.js');
	}
	
	public static function redirectLookup($event, $frontController) {
		$redirect = new Redirect_Class_Redirect();
		$redirect->loadRow($frontController->requestString, 'requestString');
		if ($redirect->row['redirectId']) {
			if (strtolower(substr($redirect->row['redirectUrl'], 0, 4) == 'http')) {
				redirect_to($redirect->row['redirectUrl']);
			}
			else {
				redirect($redirect->row['redirectUrl']);
			}
		}
	}
}