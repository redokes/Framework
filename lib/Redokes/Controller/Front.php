<?php

class Redokes_Controller_Front {

	public $module = 'index';
	public $controller = 'index';
	public $action = 'index';
	public $params = array();
	private static $_instance;
	private $_dbAdapters = array();
	private $_cacheManager = false;

	public function __construct() {
		$this->initSession();
		$this->initDbAdapter();
		$this->parseRequest();
//		$this->processRoutes();
	}

	/**
	 * Returns the front controller instance
	 *
	 * @return Redokes_Controller_Front
	 */
	public static function getInstance() {
		if (!isset(self::$_instance)) {
			$c = __CLASS__;
			self::$_instance = new $c;
		}

		return self::$_instance;
	}

	public function initSession() {
		if (!strlen(session_id())) {
			if (isset($_REQUEST['sessionId'])) {
				session_id($_REQUEST['sessionId']);
			}
			session_start();
		}
	}
	
	public function initDbAdapter() {
		$this->getDbAdapter();
	}

	public function getParam($key, $defaultValue = false, $array = false) {
		if (!is_array($array)) {
			$array = $_REQUEST;
		}
		if (isset($array[$key])) {
			$defaultValue = $array[$key];
		}
		else if (isset($this->params[$key])) {
			$defaultValue = $this->params[$key];
		}
		else if (isset($_REQUEST[$key])) {
			$defaultValue = $_REQUEST[$key];
		}

		return $defaultValue;
	}

	public function parseRequest($request = false) {
		$this->module = 'index';
		$this->controller = 'index';
		$this->action = 'index';

		if ($request === false) {
			$request = $_SERVER['REQUEST_URI'];
		}
		$requestString = trim($request, '/');
		$request = explode('/', $requestString);
		$requestCount = count($request);
		$last = end($request);

		// check the last element to see if there are any ?key=value
		if (strpos($last, '?') !== false) {
			$parts = explode('?', $last);
			if (count($parts) > 1) {
				$request[$requestCount - 1] = $parts[0];
			}
		}
		
		if ($requestCount && strlen($request[0])) {
			$this->module = $request[0];
			if ($requestCount > 1 && strlen($request[1])) {
				$this->controller = $request[1];
				if ($requestCount > 2 && strlen($request[2])) {
					$this->action = $request[2];
					if ($requestCount > 3) {
						for ($i = 3; $i < $requestCount; $i += 2) {
							if (($i + 1) < $requestCount) {
								$this->params[$request[$i]] = $request[$i + 1];
							}
							else {
								$this->params[$request[$i]] = false;
							}
						}
					}
				}
			}
		}
		$this->params = array_merge($this->params, $_GET);
	}

	public function run() {
		$moduleName = $this->getModuleName($this->module);
    	$controllerName = $this->getControllerName($this->controller);
    	$actionName = $this->getActionName($this->action);
		
		// look for controller class
		$controllerClassName = $moduleName . '_' . $controllerName;
		$errorControllerClassName = $moduleName . '_ErrorController';
		
		if (class_exists($controllerClassName, true)) {
			$controllerClass = new $controllerClassName($this, $actionName);
		}
		else if (class_exists($errorControllerClassName, true)) {
			$controllerClass = new $errorControllerClassName($this, $actionName);
		}
		else {
			echo "Redokes Error Time. Could not find $controllerClassName or $errorControllerClassName";
		}

	}

	public function getModuleName($str) {
		$str = strtolower($str);
		$parts = explode('-', $str);
		$numParts = count($parts);
		for ($i = 0; $i < $numParts; $i++) {
			$parts[$i] = ucfirst($parts[$i]);
		}
		return implode('', $parts);
	}

	public function getControllerName($str) {
		$str = strtolower($str);
		$parts = explode('-', $str);
		$numParts = count($parts);
		for ($i = 0; $i < $numParts; $i++) {
			$parts[$i] = ucfirst($parts[$i]);
		}
		return implode('', $parts) . 'Controller';
	}

	public function getActionName($str) {
		$str = strtolower($str);
		$parts = explode('-', $str);
		$numParts = count($parts);
		for ($i = 1; $i < $numParts; $i++) {
			$parts[$i] = ucfirst($parts[$i]);
		}
		return implode('', $parts) . 'Action';
	}
	
	 /**
     * Retrieve dbadapter object
     *
     * @return Zend_Db_Adapter_Abstract
     */
    public function getDbAdapter($dbServer = 'default') {
		if (!isset($this->_dbAdapters[$dbServer])) {
			// get config
			$config = array(
				'host' => 'localhost',
				'dbname' => 'redokes_framework',
				'username' => 'root',
				'password' => ''
			);
			$this->_dbAdapters[$dbServer] = Zend_Db::factory('Pdo_Mysql', $config);
			Zend_Registry::set($dbServer, $this->_dbAdapters[$dbServer]);
			Zend_Db_Table_Abstract::setDefaultAdapter($this->_dbAdapters[$dbServer]);
		}
		return $this->_dbAdapters[$dbServer];
    }
	
	public function getCacheManager($name = 'file') {
		if ($this->_cacheManager === false) {
			$this->_cacheManager = new Zend_Cache_Manager;
		}
		return $this->_cacheManager;
	}

	public function getCache($name = 'file') {
		$cacheManager = $this->getCacheManager();
		if (!$cacheManager->hasCache($name)) {
			$cacheOptions = array(
				'frontend' => array(
					'name' => 'Core'
				),
				'backend' => array(
					'name' => 'File',
					'options' => array(
						'cache_dir' => CACHE_PATH
					)
				)
			);
			$cacheManager->setCacheTemplate($name, $cacheOptions);
		}
		return $cacheManager->getCache($name);
	}

}