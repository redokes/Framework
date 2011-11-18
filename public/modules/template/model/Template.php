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
		'gif',
		'zip'
	);
	
	public function getPublicTemplatesDir() {
		return '/modules/template/templates/';
	}
	
	public function getPrivateTemplatesDir() {
		return MODULE_PATH . 'template/templates/';
	}
	
	public function getPrivateDir() {
		return MODULE_PATH . 'template/templates/' . $this->row->hash . '/';
	}
	
	public function getPublicDir() {
		return '/modules/template/templates/' . $this->row->hash . '/';
	}
	
	public function getPageUrl() {
		return '/modules/template/templates/' . $this->row->hash . '/index.html';
	}
	
	public function afterInsert() {
		$dir = $this->getPrivateDir();
		if (!is_dir($dir)) {
			mkdir($dir);
			chmod($dir, 0777);
		}
	}
	
	public function save($doAudit = false) {
		parent::save($doAudit);
		
		$this->createThumb();
	}
	
	public function processTemplateFile($path, $originalName = false) {
		if (is_file($path)) {
			$contents = file_get_contents($path);
			$originalFile = $this->getPrivateDir() . '.index.html';
			$indexFile = $this->getPrivateDir() . 'index.html';
			file_put_contents($originalFile, $contents);
			file_put_contents($indexFile, $contents);
			
			$this->updateReferences();
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
				
				// Check if this is a zip file
				if ($extension == 'zip') {
					// Extract zip contents
					$zip = new ZipArchive();
					$zip->open($resourceFile);
					$zip->extractTo($this->getPrivateDir());
					$zip->close();
					
					// Delete zip file
					unlink($resourceFile);
					
					// Delete __MACOSX
					$dir = $this->getPrivateDir() . '__MACOSX';
					if (is_dir($dir)) {
						// TODO: remove recursively files and dir
						Redokes_FileSystem::unlinkRecursive($dir);
					}
				}
			}
		}
	}
	
	public function updateReferences() {
		// Update references
		$originalIndexFile = $this->getIndexFile(true);
		$indexFile = $this->getIndexFile();
		
		$content = file_get_contents($originalIndexFile);
		$basePath = $this->getPublicDir();
		$content = $this->updateHtmlReferences($content, $basePath);
		file_put_contents($indexFile, $content);
	}
	
	public function updateHtmlReferences($content, $basePath) {
		$dom = new Redokes_Dom_SimpleHtmlDom($content);
		$elements = array(
			array(
				'tagName' => 'link',
				'property' => 'href'
			),
			array(
				'tagName' => 'img',
				'property' => 'src'
			)
		);
		$numElements = count($elements);
		for ($i = 0; $i < $numElements; $i++) {
			foreach($dom->find($elements[$i]['tagName']) as $element) {
				$element->{$elements[$i]['property']} = $this->getRealPath($element->{$elements[$i]['property']}, $basePath);
			}
		}
		echo $dom->save();
		die();
		return $content;
	}
	
	public function getRealPath($path, $basePath) {
		$newPath = $basePath . $path;
		return $newPath;
	}
	
	public function getIndexFile($original = false) {
		if ($original) {
			return $this->getPrivateDir() . '.index.html';
		}
		else {
			return $this->getPrivateDir() . 'index.html';
		}
	}
	
	public function createThumb() {
		$thumbFile = $this->getPrivateDir() . 'thumb.png';
		if (is_writable($this->getPrivateDir())) {
//			error_log('Writing');
//			error_log("phantomjs /sites/rasterize.js {$this->getAbsoluteUrl()} $thumbFile");
//			exec("phantomjs /sites/rasterize.js {$this->getAbsoluteUrl()} $thumbFile");
		}
		else {
			error_log('Directory not writable: ' . $this->getPrivateDir());
		}
		
	}
	
	public function beforeDelete() {
		// Clean up directories
		$dir = $this->getPrivateDir();
		if (is_dir($dir)) {
			Redokes_FileSystem::unlinkRecursive($dir);
		}
	}
	
}