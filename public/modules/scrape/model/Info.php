<?php
class Scrape_Model_Info extends Redokes_Model_Model {
	public $table = 'scrape_info';
	public $primaryKey = 'scrapeId';
	public $row = array(
		'scrapeId' => 0,
		'pageTitle' => '',
		'url' => '',
		'complete' => 0,
		'depth' => 0,
		'currentStep' => 0
	);
	public $urlInfo = array();
	
	public function __construct($id = false) {
		parent::__construct($id);
		$this->urlInfo = parse_url($this->row['url']);
	}
	
	public function insert($doAudit = true) {
		$urlInfo = parse_url($this->row['url']);
		$path = '/';
		if (isset($urlInfo['path'])) {
			$path = $urlInfo['path'];
		}
		$scheme = $urlInfo['scheme'];
		$host = $urlInfo['host'];
		
		$siteUrl = $scheme . '://' . $host;
		$pageUrl = $siteUrl . $path;
		$this->row['url'] = $pageUrl;
		
		parent::insert($doAudit);
		$this->makeDirectories();
	}
	
	private function makeDirectories() {
		if (!is_dir($this->getPrivateScrapeDir())) {
			mkdir($this->getPrivateScrapeDir());
		}
		$scrapeDir = $this->getPrivateScrapeDir() . 'scrape-' . $this->row['scrapeId'] . '/';
		if (!is_dir($scrapeDir)) {
			mkdir($scrapeDir);
		}
	}
	
	public function getPrivateScrapeDir() {
		return RESOURCE_PATH . 'scrape/';
	}
	
	public function getPageUrl() {
		return '/resources/scrape/scrape-' . $this->row['scrapeId'] . '/';
	}
	
	public function getPublicDir() {
		return '/resources/scrape/scrape-' . $this->row['scrapeId'] . '/';
	}
	
	public function getPrivateDir() {
		return RESOURCE_PATH . 'scrape/scrape-' . $this->row['scrapeId'] . '/';
	}
}