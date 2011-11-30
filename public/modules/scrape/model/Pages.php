<?php
class Scrape_Model_Info extends Redokes_Model_Model {
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
		'updatedCssResources' => 0,
		'depth' => 0
	);
}