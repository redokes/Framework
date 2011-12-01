<?php

class Scrape_ImportController extends Redokes_Controller_Ajax {

	private $scrape;

	public function indexAction() {
		
	}

	/*
	 * this function fails on tests where resource is like /img/../img/../img/img.jpg
	 */

	private function resolveUrl($absoluteUrl, $resourceUrl, $debug = false) {
		// check if reference is relative to the top. makes things easier
		//echo '<b>solving for ' . $absoluteUrl . ' ' . $resourceUrl . '</b><Br>';
		$realUrl = '';

		$resourceInfo = parse_url($resourceUrl);
		if (isset($resourceInfo['host'])) {
			return $resourceUrl;
		}

		if (substr($resourceUrl, 0, 1) == '/') {
			$realUrl = $this->scrape->row->url . $resourceUrl;
		}
		else {
			// strip off data after last slash of page url
			$urlInfo = parse_url($absoluteUrl);
			if (substr($absoluteUrl, -1, 1) != '/' && isset($urlInfo['path'])) {
				$absoluteUrl = dirname($absoluteUrl) . '/';
			}
			$realUrl = $absoluteUrl . $resourceUrl;
		}

		// scheme, host, path
		$urlInfo = parse_url($realUrl);
		if (!isset($urlInfo['scheme'])) {
			echo "absolute = $absoluteUrl";
			echo "resource = $resourceUrl";
			echo "realurl = $realUrl";
			show_array($urlInfo);
			die('no scheme');
		}
		$path = trim($urlInfo['path'], '/');
		$pathArray = explode('/', $path);
		$realPathArray = array();
		for ($i = 0; $i < count($pathArray); $i++) {
			if ($pathArray[$i] == '.') {
				
			}
			else if ($pathArray[$i] == '..') {
				array_pop($realPathArray);
			}
			else {
				$realPathArray[] = $pathArray[$i];
			}
		}
		$realUrl = $urlInfo['scheme'] . '://' . $urlInfo['host'] . '/' . str_replace('//', '/', implode('/', $realPathArray));
		//$this->log($realUrl . "\n\n");
		return $realUrl;
	}

	public function nextStepAction() {
		$this->scrape = new Scrape_Model_Info($this->frontController->getParam('scrapeId', 0));
		if (!$this->scrape->row->complete) {
			switch ($this->scrape->row->currentStep) {
				case 0:
					$this->getSiteLinks();
					break;
				case 1:
					$this->processContent();
					break;
				case 2:
					$this->fetchResources();
					break;
				case 3:
					$this->updateReferences();
					break;
				case 4:
					$this->scrape->row->complete = 1;
					$this->scrape->save(false);
					break;
			}
		}

		$this->setParam('row', $this->scrape->row->toArray());
	}

	public function getSiteLinks() {
		// check if we need to get the initial page
		$page = new Scrape_Model_Page();
		$page->loadRow($this->scrape->row->scrapeId, 'scrapeId');
		if (!$page->row->pageId) {
			$this->getTitle();
		}

		// get all pages that haven't have links fetched
		$select = $page->table->select()
				->where('scrapeId = ?', $this->scrape->row->scrapeId)
				->where('fetchedLinks = 0')
				->limit(3);
		$rows = $page->table->fetchAll($select);
		$records = $rows->toArray();
		$numRows = count($records);
		for ($i = 0; $i < $numRows; $i++) {
			$page = new Scrape_Model_Page();
			$page->row = $rows[$i];

			$newPages = array();

			$html = @file_get_contents($page->row->absoluteUrl);
			if ($html) {
				$dom = new Redokes_Dom_SimpleHtmlDom();
				$dom->load($html);

				$title = '';
				$titles = $dom->find('title');
				if (count($titles)) {
					$title = $dom->find('title', 0)->innertext;
				}

				$page->setRow(array(
					'title' => $title,
					'content' => $html
				));
				$page->save();

				// only fetch links if we need to
				if ($this->scrape->row->depth == -1 || $this->scrape->row->depth > $page->row->depth) {
					$links = $dom->find('a');
					for ($i = 0; $i < count($links); $i++) {
						$href = $links[$i]->href;
						$realUrl = $this->resolveUrl($page->row->absoluteUrl, $href);
						$anchor = $this->getAnchor($href);
						if ($anchor == $href) {
							$realUrl = $page->row->absoluteUrl;
						}

						// make sure we need to save this link
						if ($this->isValidLink($realUrl)) {

							// update url in content to be absolute
							$dom->find('a', $i)->href = $realUrl . $anchor;

							if ($this->isUniqueLink($realUrl)) {
								$linkText = $links[$i]->innertext;
								$linkText = trim(strip_tags($linkText));

								$newPage = new Scrape_Model_Page();
								$newPage->setRow(array(
									'scrapeId' => $this->scrape->row->scrapeId,
									'absoluteUrl' => $realUrl,
									'linkText' => $linkText
								));
								$newPage->save();
							}
						}
					}
				}

				// update the page with absolute url content
				$page->setRow(array(
					'content' => $dom->save(),
					'fetchedLinks' => 1
				));
				$page->save(false);
			}
			else {
				// TODO: 404. need to say so in the db
				$page->setRow(array(
					'content' => 'error importing',
					'fetchedLinks' => 1
				));
				$page->save(false);
			}
		}

		if ($numRows) {
			// get total number of pages
			$select = $page->table->select()->from('scrape_page', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId);
			$row = $page->table->fetchRow($select);
			$numPages = $row['num'];

			$select = $page->table->select()->from('scrape_page', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId)
					->where('fetchedLinks = 1');
			$row = $page->table->fetchRow($select);
			$numCompletePages = $row['num'];

			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}

			// get next title
			$nextTitle = '';
			$nextPage = new Scrape_Model_Page();
			$nextPage->loadRow(array(
				'scrapeId' => $this->scrape->row->scrapeId,
				'fetchedLinks' => 0
			));
			if ($nextPage->row->pageId) {
				$nextTitle = $nextPage->row->linkText;
				if (!strlen($nextTitle)) {
					$nextTitle = $nextPage->row->title;
				}
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			$this->scrape->row->currentStep++;
			$this->scrape->save(false);
		}
	}

	public function getTitle() {
		$html = @file_get_contents($this->scrape->row->url);
		if ($html) {
			$dom = new Redokes_Dom_SimpleHtmlDom();
			$dom->load($html);

			$title = '';
			$titles = $dom->find('title');
			if (count($titles)) {
				$title = $dom->find('title', 0)->innertext;
			}

			$this->scrape->row->title = $title;
			$this->scrape->save();

			$page = new Scrape_Model_Page();
			$page->setRow(array(
				'scrapeId' => $this->scrape->row->scrapeId,
				'title' => $this->scrape->row->title,
				'absoluteUrl' => $this->scrape->row->url
			));
			$page->save();
		}
	}

	public function processContent() {
		/*
		 * processedContent - go through content and find all elements
		 * insert these into scrape_elements with absolute remote paths
		 * update content with absolute urls
		 * create subpages
		 */

		// get pageId
		$page = new Scrape_Model_Page();
		$select = $page->table->select()
				->where('scrapeId = ?', $this->scrape->row->scrapeId)
				->where('processedContent = 0')
				->limit(4);
		$rows = $page->table->fetchAll($select);
		$records = $rows->toArray();
		$numRecords = count($records);
		for ($i = 0; $i < $numRecords; $i++) {
			$page = new Scrape_Model_Page();
			$page->row = $rows[$i];

			// references haven't been updated yet, so we can still look in the content of the scrape_pages
			// load content into dom object
			$dom = new Redokes_Dom_SimpleHtmlDom();
			$dom->load($page->row->content);

			$resourcesToFind = array(
				'link' => array(
					'pathAttribute' => 'href'
				),
				'img' => array(
					'pathAttribute' => 'src'
				),
				'param' => array(
					'pathAttribute' => 'value'
				),
				'embed' => array(
					'pathAttribute' => 'src'
				),
				'object' => array(
					'pathAttribute' => 'data'
				)
			);

			// loop through each element type
			foreach ($resourcesToFind as $tagName => $tagInfo) {
				$pathAttribute = $tagInfo['pathAttribute'];
				$elements = $dom->find($tagName);
				for ($j = 0; $j < count($elements); $j++) {

					$relativeUrl = $elements[$j]->$pathAttribute;
					$absoluteUrl = $this->resolveUrl($page->row->absoluteUrl, $relativeUrl);

					// make sure we need to save this resource
					if ($this->isSameDomain($absoluteUrl)) {

						// update url in content
						$dom->find($tagName, $j)->$pathAttribute = $absoluteUrl;

						// TODO: better way to look for unique using the zend query/model methods
						// make sure old url is unique
						$element = new Scrape_Model_Element();
						$element->loadRow(array(
							'absoluteUrl' => $absoluteUrl,
							'scrapeId' => $this->scrape->row->scrapeId
						));
						if (!$element->row->elementId) {
							$element->setRow(array(
								'pageId' => $page->row->pageId,
								'tag' => $tagName,
								'tagIndex' => $j,
								'absoluteUrl' => $absoluteUrl,
								'scrapeId' => $this->scrape->row->scrapeId
							));
							$element->save();
						}
					} // end if is valid link
				} // end for loop of elements
			} // end foreach of resource types
			// need to update content with new absolute urls
			$page->setRow(array(
				'content' => $dom->save()
			));
			$page->save(false);

			/*
			  // get the blank template
			  $template = new Template_Class_Template();
			  $template->loadRow('Blank Template', 'title');

			  // create the subpage
			  $subpage = new Pages_Class_Page();
			  $subpage->setRow(array(
			  'title' => $page->row->title,
			  'templateId' => $template->row->templateId
			  ));
			  $subpage->save(); */

			$page->setRow(array(
				'processedContent' => 1,
					//'title' => $subpage->row->title,
					//'newPageId' => $subpage->row->pageId
			));
			$page->save(false);

			// make a reference to the new url
			$reference = new Scrape_Model_Reference();
			$reference->setRow(array(
				'scrapeId' => $this->scrape->row->scrapeId,
				'beforeValue' => $page->row->absoluteUrl,
				'afterValue' => $page->getPageUrl()
			));
			$reference->save();
		}
		if ($numRecords) {
			// get total number of pages
			$select = $page->table->select()
					->from('scrape_page', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId);
			$row = $page->table->fetchRow($select);
			$numPages = $row['num'];

			$select = $page->table->select()
					->from('scrape_page', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId)
					->where('processedContent = 1');
			$row = $page->table->fetchRow($select);
			$numCompletePages = $row['num'];

			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}

			// get next title
			$nextTitle = '';
			$nextPage = new Scrape_Model_Page();
			$nextPage->loadRow(array(
				'scrapeId' => $this->scrape->row->scrapeId,
				'processedContent' => 0
			));
			if ($nextPage->row->pageId) {
				$nextTitle = $nextPage->row->linkText;
				if (!strlen($nextTitle)) {
					$nextTitle = $nextPage->row->title;
				}
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			$this->scrape->row->currentStep++;
			$this->scrape->save(false);
		}
	}

	private function fetchResources() {
		// get resource
		$element = new Scrape_Model_Element();
		$select = $element->table->select()
				->where('scrapeId = ?', $this->scrape->row->scrapeId)
				->where('complete = 0')
				->limit(5);
		$rows = $element->table->fetchAll($select);
		$records = $rows->toArray();
		$numRecords = count($records);
		for ($i = 0; $i < $numRecords; $i++) {
			$element = new Scrape_Model_Element();
			$element->row = $rows[$i];
			$element->import($this->scrape->getPrivateDir(), $this->scrape->getPublicDir());

			if (!$element->row->error) {

				$reference = new Scrape_Model_Reference();
				//$this->log($element->row->absoluteUrl . "\n$element->localPath\n\n");
				$reference->setRow(array(
					'scrapeId' => $this->scrape->row->scrapeId,
					'beforeValue' => $element->row->absoluteUrl,
					'afterValue' => $element->row->publicPath
				));
				$reference->save();

				if ($element->row->tag == 'link') {
					// need to get css resources and insert them
					// into the resources table for this pageId
					// fetch resource
					@$fileData = file_get_contents($element->row->localPath);
					if ($fileData) {
						// get images from url references in style sheet
						$matchItems = $this->getCssUrlPath($fileData);
						if (count($matchItems)) {
							for ($j = 0; $j < count($matchItems); $j++) {
								$relativeUrl = $matchItems[$j];
								$absoluteUrl = $this->resolveUrl($element->row->absoluteUrl, $relativeUrl);

								$newElement = new Scrape_Model_Element();
								$newElement->setRow(array(
									'scrapeId' => $this->scrape->row->scrapeId,
									'pageId' => $element->row->pageId,
									'tag' => 'img',
									'tagIndex' => $j,
									'absoluteUrl' => $absoluteUrl
								));
								$newElement->save(false);
								$fileData = str_replace($relativeUrl, $absoluteUrl, $fileData);

								/*
								  $newElement->import($this->scrape->getPrivateDir(), $this->scrape->getPublicDir());

								  if ($newElement->row->localPath) {
								  $reference = new Scrape_Model_Reference();
								  //$this->log($newElement->row->absoluteUrl . "\n$newElement->localPath\n\n");
								  $reference->setRow(array(
								  'scrapeId' => $this->scrape->row->scrapeId,
								  'beforeValue' => $newElement->row->absoluteUrl,
								  'afterValue' => $newElement->row->publicPath
								  ));
								  $reference->save(false);

								  // replace old url with new public url
								  $fileData = str_replace($relativeUrl, $newElement->row->publicPath, $fileData);
								  }

								  //$newResources = true;
								 */
							}
						}

						// update style sheet with public url
						file_put_contents($element->row->localPath, $fileData);
					}
				}
			}
		}
		if ($numRecords) {
			// get total number of elements
			$select = $element->table->select()->from('scrape_element', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId);
			$row = $element->table->fetchRow($select);
			$numPages = $row['num'];

			$select = $element->table->select()->from('scrape_element', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId)
					->where('complete = 1');
			$row = $element->table->fetchRow($select);
			$numCompletePages = $row['num'];

			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}

			// get next title
			$nextTitle = '';
			$nextElement = new Scrape_Model_Element();
			$nextElement->loadRow(array(
				'scrapeId' => $this->scrape->row->scrapeId,
				'complete' => 0
			));
			if ($nextElement->row->elementId) {
				$nextTitle = end(explode('/', $nextElement->row->absoluteUrl));
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			$this->scrape->row->currentStep++;
			$this->scrape->save(false);
		}
	}

	private function updateReferences() {
		// build reference map
		// TODO: need to find some way to not have to build this for every page
		// but still be able to update one page at a time
		// possibly store it at the end of the previous step in a field in the scrape_info table
		$referenceMap = array();
		$reference = new Scrape_Model_Reference();
		$select = $reference->table->select()
				->where('scrapeId = ?', $this->scrape->row->scrapeId);
		$rows = $reference->table->fetchAll($select);
		$records = $rows->toArray();
		$numRows = count($records);
		if ($numRows) {
			for ($i = 0; $i < $numRows; $i++) {
				$referenceMap[$records[$i]['beforeValue']] = $records[$i]['afterValue'];
			}
		}

		// get pageId
		$page = new Scrape_Model_Page();
		$select = $page->table->select()
				->where('scrapeId = ?', $this->scrape->row->scrapeId)
				->where('updatedReferences = 0')
				->limit(20);
		$rows = $page->table->fetchAll($select);
		$records = $rows->toArray();
		$numRows = count($records);
		for ($i = 0; $i < $numRows; $i++) {
			$page = new Scrape_Model_Page();
			$page->row = $rows[$i];

			// update the scrape content
			$dom = new Redokes_Dom_SimpleHtmlDom();
			$dom->load($page->row->content);

			$resourcesToFind = array(
				'link' => array(
					'pathAttribute' => 'href',
					'dir' => 'css',
				),
				'img' => array(
					'pathAttribute' => 'src',
					'dir' => 'img'
				),
				'a' => array(
					'pathAttribute' => 'href'
				),
				'param' => array(
					'pathAttribute' => 'value'
				),
				'embed' => array(
					'pathAttribute' => 'src'
				),
				'object' => array(
					'pathAttribute' => 'data'
				)
			);

			foreach ($resourcesToFind as $tagName => $tagInfo) {
				$items = $dom->find($tagName);
				$pathAttribute = $tagInfo['pathAttribute'];
				for ($i = 0; $i < count($items); $i++) {
					$anchor = $this->getAnchor($items[$i]->$pathAttribute);
					if ($anchor) {
						$urlNoAnchor = $this->urlNoAnchor($items[$i]->$pathAttribute);
						if (isset($referenceMap[$urlNoAnchor])) {
							$dom->find($tagName, $i)->$pathAttribute = $referenceMap[$urlNoAnchor] . $anchor;
						}
						else {
							//$this->log("no it is not set");
						}
					}
					else {
						if (isset($referenceMap[$items[$i]->$pathAttribute])) {
							$dom->find($tagName, $i)->$pathAttribute = $referenceMap[$items[$i]->$pathAttribute];
						}
						else {
							//$this->log("no map not set");
						}
					}
				}
			}

			// save new content
			$page->setRow(array(
				'content' => $dom->save(),
				'updatedReferences' => 1
			));
			$page->save(false);
		}

		if ($numRows) {

			// get total number of pages
			$select = $page->table->select()->from('scrape_page', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId);
			$row = $page->table->fetchRow($select);
			$numPages = $row['num'];

			$select = $page->table->select()->from('scrape_page', 'COUNT(*) num')
					->where('scrapeId = ?', $this->scrape->row->scrapeId)
					->where('updatedReferences = 1');
			$row = $page->table->fetchRow($select);
			$numCompletePages = $row['num'];


			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}

			// get next title
			$nextTitle = '';
			$nextPage = new Scrape_Model_Page();
			$nextPage->loadRow(array(
				'scrapeId' => $this->scrape->row->scrapeId,
				'updatedReferences' => 0
			));
			if ($nextPage->row->pageId) {
				$nextTitle = $nextPage->row->linkText;
				if (!strlen($nextTitle)) {
					$nextTitle = $nextPage->row->title;
				}
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			// no more pages to update so update the css files
			$element = new Scrape_Model_Element();
			$select = $element->table->select()
					->where('tag = \'link\'')
					->where('scrapeId = ?', $this->scrape->row->scrapeId)
					->where('error = 0');
			$rows = $element->table->fetchAll($select);
			$records = $rows->toArray();
			$numRows = count($records);

			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$contents = file_get_contents($records[$i]['localPath']);
					foreach ($referenceMap as $beforeValue => $afterValue) {
						// only replace this reference if it is a reference to a file and just just a url like domain.com
						// otherwise all references will be replaced
						if (substr($beforeValue, '-1') != '/' && substr($afterValue, '-1') != '/') {
							$contents = str_replace($beforeValue, $afterValue, $contents);
						}
					}
					file_put_contents($records[$i]['localPath'], $contents);
				}
			}

			$this->scrape->row->currentStep++;
			$this->scrape->save(false);
		}
	}

	private function isSameDomain($pageUrl) {
		$urlInfo = parse_url($pageUrl);
		if (isset($urlInfo['host'])) {
			if ($urlInfo['host'] != $this->scrape->urlInfo['host']) {
				return false;
			}
		}
		return true;
	}

	private function isValidLink($pageUrl) {
		if (preg_match('/\.jpg/', $pageUrl)) {
			return false;
		}
		if (preg_match('/\.pdf/', $pageUrl)) {
			return false;
		}
		if (!strlen($pageUrl)) {
			return false;
		}

		$urlInfo = parse_url($pageUrl);
		if (isset($urlInfo['host'])) {
			if ($urlInfo['host'] != $this->scrape->urlInfo['host']) {
				return false;
			}
		}

		// TODO: need to just strip links of the anchor bit before because this might
		// be to another page, just with a # on there
		// make sure not just an anchor
		if (substr($pageUrl, 0, 1) == '#') {
			return false;
		}

		// make sure not a mailto
		if (preg_match('/mailto:/i', $pageUrl)) {
			return false;
		}
		return true;
	}

	private function isUniqueLink($pageUrl) {
		// make sure this page url dosn't exist for this scrapeId
		$page = new Scrape_Model_Page();
		$select = $page->table->select()->from('scrape_page', 'COUNT(*) num')
				->where('scrapeId = ?', $this->scrape->row->scrapeId)
				->where('absoluteUrl = ?', $pageUrl);
		$row = $page->table->fetchRow($select);
		$numPages = $row['num'];
		if ($numPages) {
			return false;
		}
		return true;
	}

	private function getCssUrlPath($content) {
		preg_match_all('/url\s*\(([^\)]+)\)/si', $content, $matches);
		if (count($matches) && count($matches[1])) {
			for ($i = 0; $i < count($matches[1]); $i++) {
				$matches[1][$i] = trim($matches[1][$i], '\'" ');
			}
			return $matches[1];
		}
		return array();
	}

	private function urlNoAnchor($url) {
		return preg_replace('/#.*$/', '', $url);
	}

	private function getAnchor($url) {
		$parts = explode('#', $url);
		if (count($parts) > 1) {
			return '#' . end($parts);
		}
		return false;
	}

}