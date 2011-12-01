<?php
class Psd_Model_Template extends Redokes_Model_Model {
	public $tableClassName = 'Psd_Model_Db_Template';

	public $requiredStringFields = array(
		'title' => 'Title'
	);

	public $hasPostFile = false;
	public static $allowedExtensions = array(
		'psd'
	);
	
	public function getPublicPsdDir() {
		return '/modules/psd/psds/';
	}
	
	public function getPrivatePsdDir() {
		return MODULE_PATH . 'psd/psds/';
	}
	
	public function getPrivateDir() {
		return MODULE_PATH . 'psd/psds/' . $this->row->hash . '/';
	}
	
	public function getPublicDir() {
		return '/modules/psd/psds/' . $this->row->hash . '/';
	}
	
	public function getPageUrl() {
		return '/modules/psd/psds/' . $this->row->hash . '/index.html';
	}

	public function afterInsert() {
		// Make directories
		$dir = $this->getPrivateDir();
		$dirsToMake = array(
			$dir . 'img',
			$dir . 'css',
			$dir . 'js',
			$dir . 'includes'
		);
		$numDirs = count($dirsToMake);
		for ($i = 0; $i < $numDirs; $i++) {
			mkdir($dirsToMake[$i], 0777, true);
		}
	}

	public function save($doAudit = true) {
		parent::save($doAudit);
		$this->processPostFile();
		$this->convertToTemplate();
	}

	public function processPostFile() {
		// check if there is a post file
		// hasPostFile will only be true if it has been validated
		if ($this->hasPostFile) {
			
			// get the uploaded file info
			$file = $_FILES['file'];
			$extension = strtolower(end(explode('.', $file['name'])));

			$destination = $this->getPsdPath();
			move_uploaded_file($file['tmp_name'], $destination);

			// process the template file
			$this->processFile();
		}
	}
	
	public function getPsdPath() {
		return $this->getPrivateDir() . $this->row->hash . '.psd';
	}

	public function processFile() {
		$importer = new Psd_Model_Importer($this);
		$importer->toHtml();
		$indexFile = $this->getPrivateDir() . 'index.html';
		$html = $importer->getHtml();
		file_put_contents($indexFile, $html);
	}

	public function delete($doAudit = true){
		// delete all files
		$dir = $this->getPrivateDir();
		FileSystem::unlinkRecursive($dir, true);
		
		parent::delete($doAudit);
	}

	public function getIndexFile() {
		return $this->getPrivateDir() . 'index.html';
	}

	public function validate() {
		parent::validate();

		// make sure file is allowed
		if (isset($_FILES['file']) && $_FILES['file']['size']) {
			$file = $_FILES['file'];
			$extension = strtolower(end(explode('.', $file['name'])));
			if (in_array($extension, Psd_Model_Template::$allowedExtensions)) {
				$this->hasPostFile = true;
			}
			else {
				$this->addError('Invalid file type');
			}
		}

		// if this template is new it must have a file
		if (!$this->row->psdId) {
			if (isset($_FILES['file']) && $_FILES['file']['size']) {

			}
			else {
				$this->addError('You must include a file');
			}
		}
	}

	public function convertToTemplate() {
		if ($this->row->psdId) {
			$dirsToZip = array();
			$dirsToZip[] = $this->getPrivateDir() . 'img';
			$dirsToZip[] = $this->getPrivateDir() . 'css';
			$dirsToZip[] = $this->getPrivateDir() . 'js';
			$dirsToZip[] = $this->getPrivateDir() . 'includes';

			// need to zip the resource folders
			$zip = new Redokes_Zip();
			$zipFileName = $this->row->hash . '.zip';
			$zipFile = $this->getPrivateDir() . $zipFileName;
			if (is_file($zipFile)) {
				unlink($zipFile);
			}
			$zip->open($zipFile, ZIPARCHIVE::OVERWRITE);

			// Add directories
			for ($i = 0; $i < count($dirsToZip); $i++) {
				$zip->addDir($dirsToZip[$i]);
			}
			$zip->close();

//			// Make template group from local zip
//			$templateGroup = new Template_Class_Group();
//			$templateGroup->createFromLocalFile($zipFile, $this->row->title . ' [PSD Import]');

			// Make the template from the html file
			$template = new Template_Model_Template();
			$template->row->title = $this->row->title;
			if ($template->save()) {
				$template->processResourceFile($zipFile);
				$template->processTemplateFile($this->getIndexFile());
				$template->createThumb();
			}
			else {
				$this->addError('Title not unique');
			}
			unlink($zipFile);
			
//			$template->row->groupId = $templateGroup->row->groupId;
//			$template->createFromLocalFile($this->getIndexFile(), $this->row->title);
		}
	}

	public function createCssFile($contents) {
		$cssFile = $this->getPrivateDir() . 'css/styles.css';
		file_put_contents($cssFile, $contents);
	}

	public function getPublicCssPath() {
		return 'css/styles.css';
	}
	
}