<?php

class Index_IndexController extends Redokes_Controller_Action {
	
	public function getLinks() {
		$links = array(
			'<a href="/index/index/index">index</a>',
			'<a href="/index/index/one">one</a>',
			'<a href="/index/index/two">two</a>'
		);
		return implode(' | ', $links);
	}
	
	public function indexAction() {
		$this->getView()->setValues(array(
			'title' => 'Index',
			'body' => $this->getLinks()
		));
	}
	
	public function oneAction() {
		$this->getView()->setValues(array(
			'title' => 'one',
			'body' => $this->getLinks()
		));
	}
	
	public function twoAction() {
		$this->getView()->setValues(array(
			'title' => 'two',
			'body' => $this->getLinks()
		));
	}
	
}