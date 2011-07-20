<?php

class Queso_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => "Jared and Wes's Awesome Queso Countdown Homepage",
				'head' => '<embed src="/modules/queso/ff6-returners.mid" autostart=true loop=false volume=100 hidden=true><noembed><bgsound src="ff6-returners.mid"></noembed>'
			));
	}

}