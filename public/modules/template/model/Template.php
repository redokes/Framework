<?php
class Template_Model_Template extends Redokes_Model_Model {
	
	public $tableClassName = 'Template_Model_Db_Template';
	
	public $uniqueFields = array(
		'title' => 'Title'
	);
	
	public static $allowedResourceExtensions = array(
		'css',
		'js',
		'png',
		'jpg',
		'jpeg',
		'gif'
	);
	
	public function getPrivateDir() {
		return MODULE_PATH . 'template/templates/' . $this->row->hash . '/';
	}
	
	public function afterInsert() {
		$dir = $this->getPrivateDir();
		if (!is_dir($dir)) {
			mkdir($dir);
		}
	}
	
	public function processTemplateFile($path, $originalName = false) {
		if (is_file($path)) {
			$contents = file_get_contents($path);
			$indexFile = $this->getPrivateDir() . 'index.html';
			file_put_contents($indexFile, $contents);
		}
	}
	
	public function processResourceFile($path, $originalName = false) {
		if (is_file($path)) {
			$pathInfo = pathinfo($originalName);
			$extension = $pathInfo['extension'];
			if (in_array($extension, Template_Model_Template::$allowedResourceExtensions)) {
				$contents = file_get_contents($path);
				$resourceFile = $this->getPrivateDir() . $originalName;
				file_put_contents($resourceFile, $contents);
			}
		}
	}
	
}