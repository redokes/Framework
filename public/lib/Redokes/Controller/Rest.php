<?php

class Redokes_Controller_Rest extends Redokes_Controller_Ajax {

	public function __construct($frontController, $action = 'index') {
		$requestMethod = strtolower($_SERVER['REQUEST_METHOD']);
		$params = array();
		switch($requestMethod) {
			case 'get':
				$action = 'get';
				parse_str(file_get_contents('php://input'), $params);
				break;
			
			case 'post':
				$action = 'post';
				parse_str(file_get_contents('php://input'), $params);
				break;
			
			case 'put':
				$action = 'put';
				parse_str(file_get_contents('php://input'), $params);
				break;
			
			case 'delete':
				$action = 'delete';
				parse_str(file_get_contents('php://input'), $params);
				break;
		}
		
		$frontController->params = $params;
		
		parent::__construct($frontController, $action);
	}
	
	public function get() {}
	public function post() {}
	public function put() {}
	public function delete() {}

}