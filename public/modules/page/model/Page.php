<?php
class Page_Model_Page extends Redokes_Model_Model {
	
	public $tableClassName = 'Page_Model_Db_Page';
	
	public $requiredStringFields = array(
		'title' => 'Title'
	);
	
}