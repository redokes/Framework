<?php

class Scrape_RestController extends Redokes_Controller_Rest {
	
	public function delete() {
		$ids = json_decode($this->frontController->params['ids'], true);
		$numIds = count($ids);
		for ($i = 0; $i < $numIds; $i++) {
			$scrape = new Scrape_Model_Info($ids[$i]);
			if ($scrape->row->scrapeId) {
				$scrape->delete();
			}
		}
	}
	
}