#!/usr/bin/php
<?php
define('ROOT_PATH', dirname(__FILE__));
define('PUBLIC_PATH', ROOT_PATH . '/public');
define('LIBRARY_PATH', PUBLIC_PATH . '/lib');

$modules = array(
	array(
		'url' => 'https://github.com/mrclay/minify.git',
		'title' => 'Minify',
		'path' => LIBRARY_PATH . '/min'
	)
);

$numModules = count($modules);
for ($i = 0; $i < $numModules; $i++) {
	$module = $modules[$i];
	echo $modules[$i]['title'] . "\n";
	if (!is_dir($module['path'])) {
//		mkdir($module['path']);
		exec('git submodule add ' . $module['url'] . ' ' . $module['path']);
	}
}