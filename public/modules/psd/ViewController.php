<?php
class Psd_ViewController extends Redokes_Controller_Action {

	public function indexAction() {
		echo "index action of psd";
	}

	public function _catch() {
		$action = FrontController::getInstance()->action;
		$psdTemplate = new Psd_Class_PsdTemplate($action);
		if ($psdTemplate->row['psdId']) {
			include $psdTemplate->getPrivatePath() . 'index.html';
		}
	}
}