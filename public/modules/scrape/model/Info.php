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