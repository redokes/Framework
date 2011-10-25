<?php

class Index_SetupController extends Redokes_Controller_Action {
	
	public function indexAction() {
		// Db config
		$dbConfig = new Db_Model_Config();
		$config = array(
			'host' => 'localhost',
			'dbname' => 'redokes_framework',
			'username' => 'root',
			'password' => ''
		);
		$dbConfig->setConfig($config);
	}
	
}