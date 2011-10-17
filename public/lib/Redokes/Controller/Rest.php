<?php

class Redokes_Controller_Rest extends Redokes_Controller_Ajax {

	public function __construct($frontController, $action = 'index') {
		$requestMethod = strtolower($_SERVER['REQUEST_METHOD']);
		$params = array();
		switch($requestMethod) {
			case 'get':
				$action = 'get';
				$params = $_GET;
				break;
			
			case 'post':
				$action = 'post';
				$params = $_POST;
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
		
		if (isset($params[$frontController->controller])) {
			$data = json_decode($data[$frontController->controller], true);
			$frontController->params = $data;
		}
		
		parent::__construct($frontController, $action);
	}
	
	public function get() {}
	public function post() {}
	public function put() {}
	public function delete() {}

}