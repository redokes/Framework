<?php
class Scrape_Model_Reference extends Redokes_Model_Model {
	public $table = 'scrape_references';
	public $primaryKey = 'referenceId';
	public $row = array(
		'referenceId' => 0,
		'scrapeId' => 0,
		'beforeValue' => '',
		'afterValue' => ''
	);
}