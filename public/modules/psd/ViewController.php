<?php
class Psd_ViewController extends Papercut_Controller {

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