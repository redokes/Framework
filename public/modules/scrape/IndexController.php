<?php

class Scrape_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Scrape Manager'
			))
			->addExtJs()
			->addCss('/modules/template/css/template.css')
			->addJs('/js/redokes/redokes.js');
	}
	
}