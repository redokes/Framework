<?php
class Psd_Class_PsdTemplate extends Papercut_Module {
	public $table = 'psd_templates';
	public $primaryKey = 'psdId';
	public $row = array(
		'psdId' => 0,
		'hash' => '',
		'title' => '',
		'templateStyle' => 0,
		'fileName' => ''
	);

	public $requiredStringFields = array(
		'title' => 'Title'
	);

	public $hasPostFile = false;
	public static $allowedExtensions = array(
		'psd'
	);

	public function getPublicPath() {
		return FileSystem::getSitePath() . 'psd/' . $this->row['psdId'] . '/';
	}

	public function getPrivatePath() {
		return FileSystem::getLocalSitePath() . 'psd/' . $this->row['psdId'] . '/';
	}

	public function getPsdPath() {
		return FileSystem::getSitePath() . 'psd/';
	}

	public function afterInsert() {
		// make directories
		FileSystem::makeDirectories($this->getPrivatePath() . 'img');
		FileSystem::makeDirectories($this->getPrivatePath() . 'css');
		FileSystem::makeDirectories($this->getPrivatePath() . 'js');
		FileSystem::makeDirectories($this->getPrivatePath() . 'includes');
	}

	public function process($doAudit = true) {
		parent::process($doAudit);
		$this->processPostFile();
		$this->convertToTemplate();
	}

	public function processPostFile() {
		// check if there is a post file
		// hasPostFile will only be true if it has been validated
		if ($this->hasPostFile) {
			
			// get the uploaded file info
			$file = $_FILES['file'];
			$extension = ext($file['name']);

			// set the file name based on the hash and extension
			$this->row['fileName'] = $this->row['hash'] . '.' . $extension;
			$this->update(false);

			$destination = $this->getPrivatePath() . $this->row['fileName'];
			move_uploaded_file($file['tmp_name'], $destination);

			// process the template file
			$this->processFile();
		}
	}

	public function processFile() {
		$importer = new Psd_Class_PsdImporter($this);
		$importer->toHtml();
		FileSystem::writeResourceFile($this->getPrivatePath() . 'index.html', $importer->getHtml(), false);
	}

	public function delete($doAudit = true){
		// delete all files
		$dir = $this->getPrivatePath();
		FileSystem::unlinkRecursive($dir, true);
		
		parent::delete($doAudit);
	}

	public function getIndexFile() {
		return $this->getPrivatePath() . 'index.html';
	}

	public function validate() {
		parent::validate();

		// make sure file is allowed
		if (isset($_FILES['file']) && $_FILES['file']['size']) {
			$file = $_FILES['file'];
			$extension = ext($file['name']);
			if (in_array($extension, Psd_Class_PsdTemplate::$allowedExtensions)) {
				$this->hasPostFile = true;
			}
			else {
				$this->addError('Invalid file type');
			}
		}

		// if this template is new it must have a file
		if (!$this->row['psdId']) {
			if (isset($_FILES['file']) && $_FILES['file']['size']) {

			}
			else {
				$this->addError('You must include a file');
			}
		}
	}

	public function convertToTemplate() {
		if ($this->row['psdId']) {
			$dirsToZip = array();
			$dirsToZip[] = $this->getPrivatePath() . 'img';
			$dirsToZip[] = $this->getPrivatePath() . 'css';
			$dirsToZip[] = $this->getPrivatePath() . 'js';
			$dirsToZip[] = $this->getPrivatePath() . 'includes';

			// need to zip the resource folders
			$zip = new Papercut_Zip();
			$zipFileName = file_name($this->row['fileName']) . '.zip';
			$zipFile = $this->getPrivatePath() . $zipFileName;
			if (is_file($zipFile)) {
				unlink($zipFile);
			}
			$zip->open($zipFile, ZIPARCHIVE::OVERWRITE);

			// add directories
			for ($i = 0; $i < count($dirsToZip); $i++) {
				$zip->addDir($dirsToZip[$i], end(explode('/', $dirsToZip[$i])));
			}
			$zip->close();

			// make template group from local zip
			$templateGroup = new Template_Class_Group();
			$templateGroup->createFromLocalFile($zipFile, $this->row['title'] . ' [PSD Import]');

			// make the template from the html file
			$template = new Template_Class_Template();
			$template->row['groupId'] = $templateGroup->row['groupId'];
			$template->createFromLocalFile($this->getIndexFile(), $this->row['title']);
		}
	}

	public function createCssFile($contents) {
		$cssFile = $this->getPrivatePath() . 'css/styles.css';
		FileSystem::writeResourceFile($cssFile, $contents, false);
	}

	public function getPublicCssPath() {
		return 'css/styles.css';
	}
}