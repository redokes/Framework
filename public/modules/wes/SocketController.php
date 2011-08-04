<?php

class Wes_SocketController extends Redokes_Controller_Action {

	public function init() {
		$this->getView()
				->setValues(array(
					'title' => 'Socket Test'
				))
				->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
				->addJs('/js/ext-4.0.2a/ext-all.js')
				->addJs('http://localhost:8080/socket.io/socket.io.js')
				->addJs('/modules/wes/js/socket.js');
	}

	public function indexAction() {
		
	}

}