<?php

class Wes_IndexController extends Redokes_Controller_Action {

	public function init() {
		$this->getView()
			->setValues(array(
				'title' => $this->frontController->action . ' action'
			))
			->addCss('/fake/fake.css')
			->addJs('/fake/fake.js');
	}

	public function indexAction() {
		echo 'yo';
	}

	public function index2Action() {
		echo 'index2 content';
	}

}