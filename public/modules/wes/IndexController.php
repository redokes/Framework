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
	
	public function dbAction() {
		$user = new User_Model_User(1);
		show_array($user->getRow());
		$user->loadPost(array(
			'email' => 'updated@wes.com'
		));
		$user->save();
		$user = new User_Model_User();
		$user->setRow(array(
			'email' => 'yeeeaaahhh'
		));
		$user->save();
		show_array($user->errors);
		show_array($user->getRow());
	}

	public function indexAction() {
		echo 'yo';
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