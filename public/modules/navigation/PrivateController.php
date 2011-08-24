<?php 
class Navigation_PrivateController extends Papercut_AjaxController {
	
	public function init() {
		if (!User_Class_User::hasAccess('navigation')) {
			$this->cancelRequest();
		}
	}

	public function getTrackStoreAction() {
		$db = FrontController::getInstance()->getDbAdapter();
		
		// get all tracks for listing
		$query = "SELECT * FROM navigation_tracks ORDER BY isDefault DESC, title";
		$rows = $db->fetchAll($query);
		if (count($rows)) {
			if ($rows[0]['isDefault']) {
				$rows[0]['title'] .= '*';
			}
		}
		$this->setParam('records', $rows);
		$this->setParam('total', count($rows));
	}

	public function loadTrackAction() {
		$trackId = intval(getParam('trackId', 0));
		$track = new Navigation_Class_Track($trackId);

		// load default if no track set
		if (!$track->row['trackId']) {
			$track->loadRow('1', 'isDefault');
		}

		if ($track->row['trackId']) {
			$this->setParam('content', $track->getHtml());
		}
		else {
			$this->addError('Invalid Track');
		}
	}

	public function getNodesAction() {
		$db = FrontController::getInstance()->getDbAdapter();

		// tree loader needs plaintext array of children as response
		$this->sendPlainText();
		$items = array();

		// make sure a node was submitted
		if (isset($_POST['node'])) {

			// if this is the root node, return the tracks
			if ($_POST['node'] == 'rootNode') {

				// select all tracks order by title
				$query = "SELECT * FROM navigation_tracks ORDER BY title";
				$result = $db->fetchAll($query);
				$numRows = count($result);
				if ($numRows) {
					for ($i = 0; $i < $numRows; $i++) {
						$items[] = array(
							'text' => $result[$i]['title'],
							'id' => 'trackId-' . $result[$i]['trackId'],
							'cls' => 'folder',
							'itemType' => 'track',
							'trackId' => $result[$i]['trackId'],
							'title' => $result[$i]['title'],
							'itemId' => 0,
							'allowDrag' => false
						);
					}
				}
			}
			else if (preg_match('/trackId\-(\d+)/', $_POST['node'], $matches)) {
				// get the top level children of the track
				$trackId = intval($matches[1]);
				$query = "SELECT * FROM navigation_items WHERE trackId = $trackId AND parentId = 0 ORDER BY sortOrder";
				$result = $db->fetchAll($query);
				$numRows = count($result);
				if ($numRows) {
					for ($i = 0; $i < $numRows; $i++) {
						$items[] = array(
							'text' => $result[$i]['title'],
							'id' => 'itemId-' . $result[$i]['itemId'],
							'cls' => 'folder',
							'itemType' => 'item',
							
							'itemId' => $result[$i]['itemId'],
							'title' => $result[$i]['title'],
							'trackId' => $result[$i]['trackId'],
							'parentId' => $result[$i]['parentId'],
							'url' => $result[$i]['url'],
							'target' => $result[$i]['target']
						);
					}
				}
			}
			else if (preg_match('/itemId\-(\d+)/', $_POST['node'], $matches)) {
				// get the children of this navigation item
				$itemId = intval($matches[1]);
				$navigationItem = new Navigation_Class_NavigationItem($itemId);
				if ($navigationItem->row['itemId']) {
					$query = "SELECT * FROM navigation_items WHERE parentId = {$navigationItem->row['itemId']} ORDER BY sortOrder";
					$result = $db->fetchAll($query);
					$numRows = count($result);
					if ($numRows) {
						for ($i = 0; $i < $numRows; $i++) {
							$items[] = array(
								'text' => $result[$i]['title'],
								'id' => 'itemId-' . $result[$i]['itemId'],
								'cls' => 'folder',
								'itemType' => 'item',
								
								'itemId' => $result[$i]['itemId'],
								'title' => $result[$i]['title'],
								'trackId' => $result[$i]['trackId'],
								'parentId' => $result[$i]['parentId'],
								'url' => $result[$i]['url'],
								'target' => $result[$i]['target']
							);
						}
					}
				}
			}
		}

		// encode the array of nodes and output it as plain text
		echo json_encode($items);
	}
	
	public function addTrackAction() {
		$title = getParam('title', 'New Track');
		$track = new Navigation_Class_Track();
		$track->setRow(array(
			'title' => $title
		));
		$track->process();
	}
	
	public function addItemAction() {
		$title = getParam('title', 'New') . ' Child';
		$trackId = intval(getParam('trackId', 0));
		$parentId = intval(getParam('parentId', 0));
		$url = getParam('url', '#');
		
		$item = new Navigation_Class_NavigationItem();
		$item->setRow(array(
			'title' => $title,
			'trackId' => $trackId,
			'parentId' => $parentId,
			'url' => $url
		));
		$item->process();
		
		$this->setParam('itemId', $parentId);
		$this->setParam('trackId', $trackId);
		
		$track = new Navigation_Class_Track($trackId);
		$track->clearCache();

		$this->addMessage($item->row['title'] . ' added');
	}

	public function updateAction() {
		$itemType = getParam('itemType', false);
		if ($itemType == 'track') {
			$this->updateTrackAction();
		}
		else if ($itemType == 'item') {
			$this->updateItemAction();
		}
	}

	public function updateTrackAction() {
		$track = new Navigation_Class_Track();
		$track->loadPost();
		$this->addError($track->validate());
		if (!$this->anyErrors()) {
			$track->process();
			$track->clearCache();
			$this->setParam('row', $track->row);
		}
	}
	
	public function updateItemAction() {
		$item = new Navigation_Class_NavigationItem();
		$item->loadPost();
		if ($item->row['itemId']) {
			$item->process();
			
			$track = new Navigation_Class_Track($item->row['trackId']);
			$track->clearCache();
			
			$this->setParam('success', true);
			$this->setParam('row', $item->row);
			
			$newOrder = getParam('newOrder', array());
			for ($i = 0; $i < count($newOrder); $i++) {
				$item = new Navigation_Class_NavigationItem($newOrder[$i]);
				if ($item->row['itemId']) {
					$item->row['sortOrder'] = $i;
					$item->process();
				}
			}
		}
		
		$oldParentId = intval(getParam('oldParentId', 0));
		$track = new Navigation_Class_Track($oldParentId);
		$track->clearCache();
	}
	
	public function pasteListAction() {
		$html = getParam('html', '');
		$parentId = intval(getParam('parentId', 0));
		$trackId = intval(getParam('trackId', 0));
		if ($trackId) {
			// check what kind of content was sent
			
			if (preg_match('/<ul|<ol/i', $html)) {
				// html list
				// convert any ol to ul
				$html = str_replace('<ol', '<ul', $html);
				$html = str_replace('</ol', '</ul', $html);

				// load up the html into a dom object
				$dom = new SimpleHtmlDom($html);
				$ul = $dom->find('>ul', 0);
				$this->makeFromUl($ul, $trackId, $parentId);
			}
			else if (preg_match('/[\n\r]/', $html)) {
				// multi line
				$this->makeFromNewLines($html, $trackId, $parentId);
			}
			else {
				// assume single line
				$this->makeFromNewLines($html, $trackId, $parentId);
			}
			return;
			
			$track = new Navigation_Class_Track($trackId);
			$track->clearCache();
		}
	}

	public function makeFromNewLines($str, $trackId, $parentId) {
		$lines = preg_split('/[\n\r]/', $str);
		$numLines = count($lines);
		for ($i = 0; $i < $numLines; $i++) {
			$item = new Navigation_Class_NavigationItem();
			$item->setRow(array(
				'url' => '#',
				'title' => $lines[$i],
				'trackId' => $trackId,
				'parentId' => $parentId
			));
			$item->validate();
			if (!$item->anyErrors()) {
				$item->process();
			}
		}
	}
	
	public function makeFromUl($ul, $trackId, $parentId) {
		if ($ul) {
			// find all list items and their a tags
			foreach($ul->childNodes() as $listItem) {
				if ($listItem->tag == 'li') {
					$item = false;
					foreach($listItem->childNodes() as $anchor) {
						if ($anchor->tag == 'a') {
							$target = 0;
							if ($anchor->target) {
								$target = 1;
							}
							$item = new Navigation_Class_NavigationItem();
							$item->setRow(array(
								'url' => $anchor->href,
								'title' => $anchor->plaintext,
								'target' => $target,
								'trackId' => $trackId,
								'parentId' => $parentId
							));
							$item->validate();
							if (!$item->anyErrors()) {
								$item->process();
							}
						}
						else if ($anchor->tag == 'ul' && $item) {
							$this->makeFromUl($anchor, $trackId, $item->row['itemId']);
						}
					}
				}
			}
		}
	}
	
	public function deleteItemAction() {
		$items = getParam('items', '[]');
		$items = json_decode($items, true);
		for ($i = 0; $i < count($items); $i++) {
			$itemId = intval($items[$i]['itemId']);
			$trackId = intval($items[$i]['trackId']);
			if ($trackId) {
				if ($itemId) {
					// deleting an item
					$item = new Navigation_Class_NavigationItem($itemId);
					$item->delete();
					$track = new Navigation_Class_Track($item->row['trackId']);
					$track->clearCache();
				}
				else {
					// deleting an entire track
					$track = new Navigation_Class_Track($trackId);
					$track->clearCache();
					$track->delete();
				}
			}
		}
	}
	
	public function getTracksAction() {
		$db = FrontController::getInstance()->getDbAdapter();
		$rows = array();
		$query = "SELECT * FROM navigation_tracks ORDER BY title";
		$result = $db->fetchAll($query);
		$this->setParam('rows', $result);
	}
	
	public function getTrackHtmlAction() {
		$track = new Navigation_Class_Track(getParam('trackId', 0));
		$format = getParam('format', 'html');
		$urlField = 'url';
		if ($_POST['urlField'] == 'editUrl') {
			$urlField = 'editUrl';
		}
		$navId = getParam('navId', 'defaultNav');
		$navClass = getParam('navClass', 'defaultNav');
		if ($track->row['trackId']) {
			if ($format == 'html') {
				$this->setParam('html', $track->getHtml($navId, $navClass, 0, $urlField));
			}
			else if ($format == 'json') {
				$this->setParam('json', $track->getJson(0, $urlField));
			}
		}
	}
}