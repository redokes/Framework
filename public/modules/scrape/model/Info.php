<?php
class Scrape_Model_Info extends Redokes_Model_Model {
	public $tableClassName = 'Scrape_Model_Db_Info';
	public $urlInfo = array();
	public $requiredStringFields = array(
		'url' => 'URL'
	);
	
	public function __construct($id = false) {
		parent::__construct($id);
		$this->urlInfo = parse_url($this->row->url);
	}
	
	public function beforeInsert() {
		$urlInfo = parse_url($this->row->url);
		$path = '/';
		if (isset($urlInfo['path'])) {
			$path = $urlInfo['path'];
		}
		$scheme = $urlInfo['scheme'];
		$host = $urlInfo['host'];
		
		$siteUrl = $scheme . '://' . $host;
		$pageUrl = $siteUrl . $path;
		$this->row->url = $pageUrl;
	}
	
	public function afterInsert() {
		$this->makeDirectories();
	}
	
	public function afterUpdate() {
		if ($this->row->complete) {
			$this->createThumb();
			$this->convertToTemplate();
		}
	}
	
	public function beforeDelete() {
		// Clean up directories
		$dir = $this->getPrivateDir();
		if (is_dir($dir)) {
			Redokes_FileSystem::unlinkRecursive($dir);
		}
	}
	
	private function makeDirectories() {
		if (!is_dir($this->getPrivateScrapeDir())) {
			mkdir($this->getPrivateScrapeDir());
		}
		$scrapeDir = $this->getPrivateDir();
		if (!is_dir($scrapeDir)) {
			mkdir($scrapeDir);
			chmod($scrapeDir, 0777);
		}
	}
	
	/**
	 *
	 * @return Scrape_Model_Page $page
	 */
	public function getFirstPage() {
		$page = new Scrape_Model_Page();
		$select = $page->table->select()
				->where('scrapeId = ?', $this->row->scrapeId)
				->order('pageId')
				->limit(1);
		$row = $page->table->fetchRow($select);
		$page->row = $row;
		return $page;
	}
	
	public function convertToTemplate() {
		if ($this->row->scrapeId) {
			
			// need to zip the resource folders
			$zip = new Redokes_Zip();
			$zipFileName = $this->row->hash . '.zip';
			$zipFile = $this->getPrivateDir() . $zipFileName;
			if (is_file($zipFile)) {
				unlink($zipFile);
			}
			$zip->open($zipFile, ZIPARCHIVE::OVERWRITE);
			
			$dirsToZip = array();
			
			// Read top level items
			$dir = $this->getPrivateDir();
			if ($handle = opendir($dir)) {
				while (false !== ($file = readdir($handle))) {
					if (substr($file, 0, 1) != '.') {
						$path = $dir . $file;
						if (is_dir($path)) {
							$zip->addDir($path);
						}
						else if (is_file($path)) {
							$zip->addFile($path, $file);
						}
					}
				}
				closedir($handle);
			}
			$zip->close();
			
			// Get the first page for this scrape
			$page = $this->getFirstPage();
			
			// Make an index.html file for the top
			$indexFile = $this->getPrivateDir() . 'index.html';
			file_put_contents($indexFile, $page->row->content);
			
			// Make the template from the html file
			$newTemplateTitle = $this->row->title . ' (Scrape Import)';
			
			$template = new Template_Model_Template();
			$template->loadRow($newTemplateTitle, 'title');
			$template->row->title = $newTemplateTitle;
			if ($template->save()) {
				$template->processResourceFile($zipFile);
				$template->processTemplateFile($indexFile);
				$template->createThumb();
			}
			else {
				$this->addError('Title not unique');
			}
			unlink($zipFile);
			unlink($indexFile);
		}
	}
	
	public function getPublicScrapeDir() {
		return '/modules/scrape/scrapes/';
	}
	
	public function getPrivateScrapeDir() {
		return MODULE_PATH . 'scrape/scrapes/';
	}
	
	public function getPrivateDir() {
		return MODULE_PATH . 'scrape/scrapes/' . $this->row->hash . '/';
	}
	
	public function getPublicDir() {
		return '/modules/scrape/scrapes/' . $this->row->hash . '/';
	}
	
	public function getPageUrl() {
		return '/scrape/view/' . $this->row->hash . '/';
	}
	
}