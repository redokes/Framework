<?php

class Page_IndexController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$page = new Page_Model_Page(1);
		$page->setRow(array(
			'title' => 'New Page'
		));
		$page->save();
		echo $page->row->title;
	}
	
}