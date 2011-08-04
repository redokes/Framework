<?php

class Wes_GameController extends Redokes_Controller_Action {

	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Wes Game'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addCss('/js/redokes/src/game/css/game.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
			->addJs('/modules/wes/js/wesokes.js')
			->addJs('http://redokes.com:8080/socket.io/socket.io.js');
	}

}