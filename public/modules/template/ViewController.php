<?php

class Template_ViewController extends Redokes_Controller_Action {
	
	public function _catch(){
		$templateId = intval($this->frontController->action);
		$template = new Template_Model_Template($templateId);
		echo $template->getPrivateDir();
	}
	
}