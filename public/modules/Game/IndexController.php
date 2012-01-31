<?php

class Game_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Game'
			))
			->addExtJs()
			->addCss('/js/game/resources/css/game.css')
			->addJs('/js/game/bootstrap.js');
	}
	
}