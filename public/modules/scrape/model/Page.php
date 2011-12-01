<?php
class Scrape_Model_Page extends Redokes_Model_Model {
	public $tableClassName = 'Scrape_Model_Db_Page';
	
	public function afterUpdate() {
		// make sure there are no other pages in this scrape with the same title
		$checkPage = new Scrape_Model_Page();
		$checkPage->loadRow(array(
			'slug' => $this->row->slug,
			'scrapeId' => $this->row->scrapeId
		));
		
		if ($checkPage->row->pageId && $checkPage->row->pageId != $this->row->pageId) {
			// change the title.. this method isn't guaranteed
//			$this->row->title = $this->row->linkText . ' - ' . $this->row->title;
			$this->row->title = $this->row->title . ' - ' . $this->row->pageId;
			$this->generateSlug();
		}
	}
	
	public function getPageUrl() {
		return '/scrape/view/' . $this->row->scrapeId . '/' . $this->row->slug . '/';
	}
}