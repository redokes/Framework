<?php

// bootstrap file
error_reporting(E_ALL);
ini_set('display_errors', '1');
date_default_timezone_set('America/New_York');

//Set up constant varaibles
define('ROOT_PATH', dirname(__FILE__) . '/../');
define('APPLICATION_PATH', ROOT_PATH . 'application/');
define('PUBLIC_PATH', ROOT_PATH . 'public/');
define('MODULE_PATH', PUBLIC_PATH . 'modules/');
define('LIBRARY_PATH', ROOT_PATH . 'lib/');
define('CACHE_PATH', ROOT_PATH . 'cache/');

//Set the include path
set_include_path(get_include_path() . PATH_SEPARATOR . LIBRARY_PATH);

function __autoload($name) {
	$parts = explode('_', $name);
	$num = count($parts) - 1;
	$upperFile = implode('/', $parts). '.php';
	for ($i = 0; $i < $num; $i++) {
		$parts[$i] = strtolower($parts[$i]);
	}
	$lowerFile = implode('/', $parts) . '.php';
	if (is_file(LIBRARY_PATH . $upperFile)) {
		include_once LIBRARY_PATH . $upperFile;
	}
	else if (is_file(MODULE_PATH . $lowerFile)) {
		include_once MODULE_PATH . $lowerFile;
	}
}

function show_array($array) {
	echo '<pre>';
	print_r($array);
	echo '</pre>';
}

$frontController = Redokes_Controller_Front::getInstance();
$frontController->run();