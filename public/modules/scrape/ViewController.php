<?php

class Scrape_ViewController extends Redokes_Controller_Action {
	
	public function indexAction() {
		$scrape = new Scrape_Model_Info();
		$select = $scrape->table->select();
		$rows = $scrape->table->fetchAll($select);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$row = $rows[$i];
			echo '<p>' . $row->scrapeId . '. ' . $row->title . ' ' . $row->hash . ' <a href="/scrape/view/' . $row->hash . '">View</a></p>';
		}
	}
	
	public function _catch(){
		$hash = $this->frontController->action;
		$params = $this->frontController->params;
		$slug = false;
		if (count($params)) {
			foreach($params as $key => $value) {
				$slug = $key;
			}
		}
		$scrape = new Scrape_Model_Info();
		if ($slug) {
			$scrape->loadRow(array(
				'slug' => $slug,
				'hash' => $hash
			));
		}
		else {
			$scrape->loadRow($hash, 'hash');
		}
		
		if ($scrape->row->scrapeId) {
			$this->outputPage($scrape);
		}
		else {
			$this->indexAction();
		}
	}
	
	/**
	 *
	 * @param Template_Model_Template $template 
	 */
	public function outputPage($scrape) {
		// Get first page
		$page = new Scrape_Model_Page();
		$select = $page->table->select()
				->where('scrapeId = ?', $scrape->row->scrapeId)
				->order('scrapeId')
				->limit(1);
		$row = $page->table->fetchRow($select);
		$page->row = $row;
		$content = $page->row->content;
		$this->getView()->setHtml($content);
	}
	
}