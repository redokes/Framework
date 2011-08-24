<?php

class Wes_IndexController extends Redokes_Controller_Action {

	public function init() {
		$this->getView()
			->setValues(array(
				'title' => $this->frontController->action . ' action'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addJs('/js/ext-4.0.2a/ext-all.js');
	}
	
	public function getLinks() {
		$html = '';
		$links = array(
			'/wes/index/index',
			'/wes/index/index2',
			'/wes/index/index3',
			'/wes/index/index4'
		);
		for ($i = 0; $i < count($links); $i++) {
			$html .= "<a href=\"{$links[$i]}\">{$links[$i]}</a> | ";
		}
		
		return $html;
	}
	
	public function indexAction() {
		echo 'my user id = ' . User_Model_User::getMyId();
		echo '<br>';
		echo $this->getLinks();
	}

	public function index2Action() {
		echo 'index2 content';
		echo $this->getLinks();
	}
	
	public function index3Action() {
		echo 'index2 content';
		echo $this->getLinks();
	}
	
	public function index4Action() {
		echo 'index2 content';
		echo $this->getLinks();
	}
	

}