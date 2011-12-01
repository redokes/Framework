<?php
class Psd_Class_Manager extends Papercut_ModuleManager {
	public $title = 'PSD';
	public $accessName = 'psd';
	
	public $listeners = array(
		'Simon_Application.init' => 'Psd_Class_Manager::initApplication'
	);

	public static function initApplication(){
		FrontController::getInstance()->addScript('/modules/psd/js/Interface.js');
	}
}