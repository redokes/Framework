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
		$scrape->loadRow($hash, 'hash');
		if (!$scrape->row->scrapeId) {
			$scrape->loadRow($hash);
		}
		
		$page = new Scrape_Model_Page();
		if ($slug) {
			$select = $page->table->select()
					->where('scrapeId = ?', $scrape->row->scrapeId)
					->where('slug = ?', $slug)
					->limit(1);
			$row = $page->table->fetchRow($select);
			if ($row) {
				$page->row = $row;
				$this->outputPage($page);
			}
		}
		else {
			$scrape->loadRow($hash, 'hash');
			
			if ($scrape->row->scrapeId) {
				$select = $page->table->select()
						->where('scrapeId = ?', $scrape->row->scrapeId)
						->order('pageId')
						->limit(1);
				$row = $page->table->fetchRow($select);
				$page->row = $row;
				$this->outputPage($page);
			}
			else {
				$this->indexAction();
			}
		}
	}
	
	/**
	 *
	 * @param Scrape_Model_Page $page 
	 */
	public function outputPage($page) {
		// Get first page
		$this->getView()->setHtml($page->row->content);
	}
	
}