<?php
class Scrape_Model_Page extends Redokes_Model_Model {
	public $table = 'scrape_pages';
	public $primaryKey = 'pageId';
	public $row = array(
		'pageId' => 0,
		'scrapeId' => 0,
		'newPageId' => 0,
		'pageTitle' => '',
		'absoluteUrl' => '',
		'fetchedLinks' => 0,
		'processedContent' => 0,
		'content' => '',
		'fetchedResources' => 0,
		'linkText' => '',
		'updatedReferences' => 0,
		'templated' => 0,
		'processedCss' => 0,
		'fetchedCssResources' => 0,
		'updatedCssReferences' => 0,
		'depth' => 0,
		'safeTitle' => ''
	);
	
	public function process($doAudit = true) {
		$this->row['safeTitle'] = safe_title($this->row['pageTitle']);
		// make sure there are no other pages in this scrape with the same title
		$checkPage = new Scrape_Model_Page();
		$checkPage->loadRow(array(
			'safeTitle' => $this->row['safeTitle'],
			'scrapeId' => $this->row['scrapeId']
		));
		
		if ($checkPage->row['pageId'] && $checkPage->row['pageId'] != $this->row['pageId']) {
			// change the title.. this method isn't guaranteed
			$this->row['pageTitle'] = $this->row['linkText'] . ' - ' . $this->row['pageTitle'];
			$this->row['safeTitle'] = safe_title($this->row['pageTitle']);
		}
		
		parent::process($doAudit);
	}
	
	public function getPageUrl() {
		return '/scrape/view/' . $this->row['scrapeId'] . '/' . $this->row['safeTitle'] . '/';
	}
}