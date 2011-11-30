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
			$realUrl = $this->scrape->row['url'] . $resourceUrl;
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
		$this->scrape = new Scrape_Model_Info(getParam('scrapeId', 0));
		if (!$this->scrape->row['complete']) {
			switch($this->scrape->row['currentStep']) {
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
					$this->scrape->row['complete'] = 1;
					$this->scrape->process(false);
					break;
			}
		}
		
		$this->setParam('row', $this->scrape->row);
	}
	
	public function getSiteLinks() {
		// check if we need to get the initial page
		$page = new Scrape_Model_Page();
		$page->loadRow($this->scrape->row['scrapeId'], 'scrapeId');
		if (!$page->row['pageId']) {
			$this->getPageTitle();
		}
		
		// get all pages that haven't have links fetched
		$query = "SELECT * FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']} AND fetchedLinks = 0 LIMIT 3";
		$result = mysql_query($query);
		while($row = mysql_fetch_assoc($result)) {
			$page = new Scrape_Model_Page();
			$page->setRow($row);
			
			$newPages = array();
			
			$html = @file_get_contents($page->row['absoluteUrl']);
			if ($html) {
				$dom = new SimpleHtmlDom();
				$dom->load($html);
				
				$title = '';
				$titles = $dom->find('title');
				if (count($titles)) {
					$title = $dom->find('title', 0)->innertext; 
				}
				
				$page->setRow(array(
					'pageTitle' => $title,
					'content' => $html
				));
				$page->process();
				
				// only fetch links if we need to
				if ($this->scrape->row['depth'] == -1 || $this->scrape->row['depth'] > $page->row['depth']) {
					$links = $dom->find('a');
					for ($i = 0; $i < count($links); $i++) {
						$href = $links[$i]->href;
						$realUrl = $this->resolveUrl($page->row['absoluteUrl'], $href);
						$anchor = $this->getAnchor($href);
						if ($anchor == $href) {
							$realUrl = $page->row['absoluteUrl'];
						}
						
						// make sure we need to save this link
						if ($this->isValidLink($realUrl)) {
							
							// update url in content to be absolute
							$dom->find('a', $i)->href = $realUrl.$anchor;
							
							if ($this->isUniqueLink($realUrl)) {
								$linkText = $links[$i]->innertext;
								$linkText = trim(strip_tags($linkText));
								
								$newPage = new Scrape_Model_Page();
								$newPage->setRow(array(
									'scrapeId' => $this->scrape->row['scrapeId'],
									'absoluteUrl' => $realUrl,
									'linkText' => $linkText
								));
								$newPage->process();
							}
						}
					}
				}
				
				// update the page with absolute url content
				$page->setRow(array(
					'content' => $dom->save(),
					'fetchedLinks' => 1
				));
				$page->process(false);
			}
			else {
				// TODO: 404. need to say so in the db
				$page->setRow(array(
					'content' => 'error importing',
					'fetchedLinks' => 1
				));
				$page->process(false);
			}
		}
		
		if (mysql_num_rows($result)) {
			// get total number of pages
			$numPages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']}";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numPages = $row['num'];
			}
			$numCompletePages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']} AND fetchedLinks = 1";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numCompletePages = $row['num'];
			}
			
			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}
			
			// get next title
			$nextTitle = '';
			$nextPage = new Scrape_Model_Page();
			$nextPage->loadRow(array(
				'scrapeId' => $this->scrape->row['scrapeId'],
				'fetchedLinks' => 0
			));
			if ($nextPage->row['pageId']) {
				$nextTitle = $nextPage->row['linkText'];
				if (!strlen($nextTitle)) {
					$nextTitle = $nextPage->row['pageTitle'];
				}
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			$this->scrape->row['currentStep']++;
			$this->scrape->process(false);
		}
	}
	
	public function getPageTitle() {
		$html = @file_get_contents($this->scrape->row['url']);
		if ($html) {
			$dom = new SimpleHtmlDom();
			$dom->load($html);
			
			$title = '';
			$titles = $dom->find('title');
			if (count($titles)) {
				$title = $dom->find('title', 0)->innertext; 
			}
			
			$this->scrape->row['pageTitle'] = $title;
			$this->scrape->process(false);
			
			$page = new Scrape_Model_Page();
			$page->setRow(array(
				'scrapeId' => $this->scrape->row['scrapeId'],
				'pageTitle' => $this->scrape->row['pageTitle'],
				'absoluteUrl' => $this->scrape->row['url']
			));
			$page->process();
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
		$query = "SELECT * FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']} AND processedContent = 0 LIMIT 4";
		$result = mysql_query($query);
		while ($row = mysql_fetch_assoc($result)) {
			
			$page = new Scrape_Model_Page();
			$page->setRow($row);
			
			// references haven't been updated yet, so we can still look in the content of the scrape_pages
			// load content into dom object
			$dom = new SimpleHtmlDom();
			$dom->load($page->row['content']);
			
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
			foreach($resourcesToFind as $tagName => $tagInfo) {
				$pathAttribute = $tagInfo['pathAttribute'];
				$elements = $dom->find($tagName);
				for ($j = 0; $j < count($elements); $j++) {
					
					$relativeUrl = $elements[$j]->$pathAttribute;
					$absoluteUrl = $this->resolveUrl($page->row['absoluteUrl'], $relativeUrl);
					
					// make sure we need to save this resource
					if ($this->isSameDomain($absoluteUrl)) {
						
						// update url in content
						$dom->find($tagName, $j)->$pathAttribute = $absoluteUrl;
						
						// TODO: better way to look for unique using the zend query/model methods
						// make sure old url is unique
						$element = new Scrape_Model_Element();
						$element->loadRow(array(
							'absoluteUrl' => $absoluteUrl,
							'scrapeId' => $this->scrape->row['scrapeId'] 
						));
						if (!$element->row['elementId']) {
							$element->setRow(array(
								'pageId' => $page->row['pageId'],
								'tag' => $tagName,
								'tagIndex' => $j,
								'absoluteUrl' => $absoluteUrl,
								'scrapeId' => $this->scrape->row['scrapeId']
							));
							$element->process();
						}
					} // end if is valid link
				} // end for loop of elements
			} // end foreach of resource types
			
			// need to update content with new absolute urls
			$page->setRow(array(
				'content' => $dom->save()
			));
			$page->process(false);
			
			/*
			// get the blank template
			$template = new Template_Class_Template();
			$template->loadRow('Blank Template', 'title');
			
			// create the subpage
			$subpage = new Pages_Class_Page();
			$subpage->setRow(array(
				'title' => $page->row['pageTitle'],
				'templateId' => $template->row['templateId']
			));
			$subpage->process();*/
			
			$page->setRow(array(
				'processedContent' => 1,
				//'pageTitle' => $subpage->row['title'],
				//'newPageId' => $subpage->row['pageId']
			));
			$page->process(false);
			
			// make a reference to the new url
			$reference = new Scrape_Model_Reference();
			$reference->setRow(array(
				'scrapeId' => $this->scrape->row['scrapeId'],
				'beforeValue' => $page->row['absoluteUrl'],
				'afterValue' => $page->getPageUrl()
			));
			$reference->process();
		}
		if (mysql_num_rows($result)) {
			// get total number of pages
			$numPages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']}";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numPages = $row['num'];
			}
			$numCompletePages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']} AND processedContent = 1";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numCompletePages = $row['num'];
			}
			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}
			
			// get next title
			$nextTitle = '';
			$nextPage = new Scrape_Model_Page();
			$nextPage->loadRow(array(
				'scrapeId' => $this->scrape->row['scrapeId'],
				'processedContent' => 0
			));
			if ($nextPage->row['pageId']) {
				$nextTitle = $nextPage->row['linkText'];
				if (!strlen($nextTitle)) {
					$nextTitle = $nextPage->row['pageTitle'];
				}
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			$this->scrape->row['currentStep']++;
			$this->scrape->process(false);
		}
	}
	
	private function fetchResources() {
		// get resource
		$query = "SELECT * FROM scrape_elements WHERE scrapeId = {$this->scrape->row['scrapeId']} AND complete = 0 LIMIT 5";
		$result = mysql_query($query);
		while ($row = mysql_fetch_assoc($result)) {
			$element = new Scrape_Model_Element();
			$element->setRow($row);
				
			$element->import($this->scrape->getPrivateDir(), $this->scrape->getPublicDir());
			
			if (!$element->row['error']) {
				
				$reference = new Scrape_Model_Reference();
				//$this->log($element->row->absoluteUrl . "\n$element->localPath\n\n");
				$reference->setRow(array(
					'scrapeId' => $this->scrape->row['scrapeId'],
					'beforeValue' => $element->row['absoluteUrl'],
					'afterValue' => $element->row['publicPath']
				));
				$reference->process();
				
				if ($element->row['tag'] == 'link') {
					// need to get css resources and insert them
					// into the resources table for this pageId
					
					// fetch resource
					@$fileData = file_get_contents($element->row['localPath']);
					if ($fileData) {
						// get images from url references in style sheet
						$matchItems = $this->getCssUrlPath($fileData);
						if (count($matchItems)) {
							for ($j = 0; $j < count($matchItems); $j++) {
								$relativeUrl = $matchItems[$j];
								$absoluteUrl = $this->resolveUrl($element->row['absoluteUrl'], $relativeUrl);
								
								$newElement = new Scrape_Model_Element();
								$newElement->setRow(array(
									'scrapeId' => $this->scrape->row['scrapeId'],
									'pageId' => $element->row['pageId'],
									'tag' => 'img',
									'tagIndex' => $j,
									'absoluteUrl' => $absoluteUrl
								));
								$newElement->process(false);
								$fileData = str_replace($relativeUrl, $absoluteUrl, $fileData);
								
								/*
								$newElement->import($this->scrape->getPrivateDir(), $this->scrape->getPublicDir());
								
								if ($newElement->row['localPath']) {
									$reference = new Scrape_Model_Reference();
									//$this->log($newElement->row->absoluteUrl . "\n$newElement->localPath\n\n");
									$reference->setRow(array(
										'scrapeId' => $this->scrape->row['scrapeId'],
										'beforeValue' => $newElement->row['absoluteUrl'],
										'afterValue' => $newElement->row['publicPath']
									));
									$reference->process(false);
									
									// replace old url with new public url
									$fileData = str_replace($relativeUrl, $newElement->row['publicPath'], $fileData);
								}
								
								//$newResources = true;
								*/
							}
						}
						
						// update style sheet with public url
						file_put_contents($element->row['localPath'], $fileData);
					}
				}
			}
		}
		if (mysql_num_rows($result)) {
			// get total number of resources
			$numPages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_elements WHERE scrapeId = {$this->scrape->row['scrapeId']}";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numPages = $row['num'];
			}
			$numCompletePages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_elements WHERE scrapeId = {$this->scrape->row['scrapeId']} AND complete = 1";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numCompletePages = $row['num'];
			}
			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}
			
			// get next title
			$nextTitle = '';
			$nextElement = new Scrape_Model_Element();
			$nextElement->loadRow(array(
				'scrapeId' => $this->scrape->row['scrapeId'],
				'complete' => 0
			));
			if ($nextElement->row['elementId']) {
				$nextTitle = end(explode('/', $nextElement->row['absoluteUrl']));
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			$this->scrape->row['currentStep']++;
			$this->scrape->process(false);
		}
	}
	
	private function updateReferences() {
		// build reference map
		// TODO: need to find some way to not have to build this for every page
		// but still be able to update one page at a time
		// possibly store it at the end of the previous step in a field in the scrape_info table
		$referenceMap = array();
		$query = "SELECT * FROM scrape_references WHERE scrapeId = {$this->scrape->row['scrapeId']}";
		$result = mysql_query($query);
		if (mysql_num_rows($result)) {
			while ($row = mysql_fetch_assoc($result)) {
				$referenceMap[$row['beforeValue']] = $row['afterValue'];
			}
		}
		
		// get pageId
		$query = "SELECT * FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']} AND updatedReferences = 0 LIMIT 20";
		$result = mysql_query($query);
		while ($row = mysql_fetch_assoc($result)) {
			$page = new Scrape_Model_Page();
			$page->setRow($row);
			
			// update the scrape content
			$dom = new SimpleHtmlDom();
			$dom->load($page->row['content']);
			
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
			
			foreach($resourcesToFind as $tagName => $tagInfo) {
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
			$page->process(false);
			
			
		}
		
		if (mysql_num_rows($result)) {
			// get total number of resources
			$numPages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']}";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numPages = $row['num'];
			}
			$numCompletePages = 0;
			$query = "SELECT COUNT(*) num FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']} AND updatedReferences = 1";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				$row = mysql_fetch_assoc($result);
				$numCompletePages = $row['num'];
			}
			if ($numPages) {
				$this->setParam('progress', array($numCompletePages, $numPages, $numCompletePages / $numPages));
			}
			
			// get next title
			$nextTitle = '';
			$nextPage = new Scrape_Model_Page();
			$nextPage->loadRow(array(
				'scrapeId' => $this->scrape->row['scrapeId'],
				'updatedReferences' => 0
			));
			if ($nextPage->row['pageId']) {
				$nextTitle = $nextPage->row['linkText'];
				if (!strlen($nextTitle)) {
					$nextTitle = $nextPage->row['pageTitle'];
				}
			}
			$this->pushParam('progress', $nextTitle);
		}
		else {
			// no more pages to update so update the css files
			$query = "SELECT * FROM scrape_elements WHERE tag = 'link' AND scrapeId = {$this->scrape->row['scrapeId']} AND error = 0";
			$result = mysql_query($query);
			if (mysql_num_rows($result)) {
				while ($row = mysql_fetch_assoc($result)) {
					$contents = file_get_contents($row['localPath']);
					foreach ($referenceMap as $beforeValue => $afterValue) {
						// only replace this reference if it is a reference to a file and just just a url like domain.com
						// otherwise all references will be replaced
						if (substr($beforeValue, '-1') != '/' && substr($afterValue, '-1') != '/') {
							$contents = str_replace($beforeValue, $afterValue, $contents);
						}
					}
					file_put_contents($row['localPath'], $contents);
				}
			}
			
			$this->scrape->row['currentStep']++;
			$this->scrape->process(false);
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
		$query = "SELECT COUNT(*) num FROM scrape_pages WHERE scrapeId = {$this->scrape->row['scrapeId']} AND absoluteUrl = '$pageUrl'";
		$result = mysql_query($query);
		if (mysql_num_rows($result)) {
			$row = mysql_fetch_assoc($result);
			if ($row['num']) {
				return false;
			}
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