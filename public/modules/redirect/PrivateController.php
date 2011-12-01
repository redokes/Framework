<?php
class Redirect_PrivateController extends Redokes_Controller_Ajax {
	
	public function init() {
		if (!User_Class_User::hasAccess('redirect')) {
			$this->cancelRequest();
		}
	}
	
	public function processAction() {
		$this->isExt = true;
		$redirect = new Redirect_Class_Redirect(getParam('redirectId', 0));
		$redirect->loadPost();
		$redirect->isExt = true;
		$this->addError($redirect->validate());
		
		if (!$this->anyErrors()) {
			$redirect->process();
			
			$this->setParam('record', $redirect->row);
			$message = 'Redirect has been saved';
			$this->addMessage($message);
		}
	}
	
	public function deleteAction() {
		$selectedIds = $_POST['selected'];
		$titles = array();
		for ($i = 0; $i < count($selectedIds); $i++) {
			$redirect = new Redirect_Class_Redirect($selectedIds[$i]);
			$titles[] = $redirect->row['requestString'];
			$redirect->delete();
		}
		$this->addMessage(implode(', ', $titles) . ' <strong>deleted</strong>');
	}
	
	public function gridAction() {
		$grid = new Redokes_Query();
		$gridResult = $grid->getRecords();
		
		foreach ($gridResult as $param => $value){
			$this->setParam($param, $value);
		}
	}
	
	public function loadRowAction() {
		$redirect = new Redirect_Class_Redirect(getParam('id', 0));
		$this->setParam('record', $redirect->row);
	}
}