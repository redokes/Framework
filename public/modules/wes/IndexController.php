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
		$html = '<div>';
		$links = array(
			'/wes/index/index',
			'/wes/index/index2',
			'/wes/index/index3',
			'/wes/index/index4'
		);
		for ($i = 0; $i < count($links); $i++) {
			$html .= "<a href=\"{$links[$i]}\">{$links[$i]}</a> | ";
		}
		$html .= '</div>';
		
		return $html;
	}
	
	public function indexAction() {
		echo $this->getLinks();
		echo 'this is the index';
		$track = new Navigation_Model_Track(2);
		echo $track->getHtml('test-track');
		
//		$track->save();
		
		$item = new Navigation_Model_Item();
		$item->setRow(array(
			'trackId' => 1,
			'title' => 'test item'
		));
//		$item->save();
//		show_array($item->errors);
	}

	public function index2Action() {
		echo $this->getLinks();
		echo 'index2 content';
	}
	
	public function index3Action() {
		echo $this->getLinks();
		echo 'index3 content';
	}
	
	public function index4Action() {
		echo $this->getLinks();
		echo 'index4 content';
	}
	

}