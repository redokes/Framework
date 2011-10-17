<?php

class Wes_ContentController extends Redokes_Controller_Rest {
	
	public function post() {
		$this->setParam('params', $this->frontController->params);
	}
	
}