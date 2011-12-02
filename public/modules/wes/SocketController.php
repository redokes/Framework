<?php

class Wes_SocketController extends Redokes_Controller_Action {

	public function init() {
		$this->getView()
				->setValues(array(
					'title' => 'Socket Test'
				))
				->addExtJs()
				->addJs('http://localhost:8080/socket.io/socket.io.js')
				->addJs('/modules/wes/js/node-test.js');
	}

	public function indexAction() {
		
	}

}