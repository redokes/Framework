<?php 
class Navigation_PrivateController extends Redokes_Controller_Ajax {
	
	public function init() {
//		if (!User_Model_User::hasAccess('navigation')) {
//			$this->cancelRequest();
//		}
	}

	public function getTrackStoreAction() {
		$db = FrontController::getInstance()->getDbAdapter();
		
		// get all tracks for listing
		$query = "SELECT * FROM navigation_track ORDER BY isDefault DESC, title";
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
		$trackId = intval(Redokes_Controller_Front::getInstance()->getParam('trackId', 0));
		$track = new Navigation_Model_Track($trackId);

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
		$items = array();
		
		$node = Redokes_Controller_Front::getInstance()->getParam('node');
		
		// if this is the root node, return the tracks
		if ($node == 'rootNode') {

			// select all tracks order by title
			$trackTable = new Navigation_Model_Db_Track();
			$select = $trackTable->select()->order('title');
			$rows = $trackTable->fetchAll($select);
			$numRows = count($rows);
			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$items[] = array(
						'text' => $rows[$i]['title'],
						'id' => 'trackId-' . $rows[$i]['trackId'],
						'cls' => 'folder',
						'itemType' => 'track',
						'trackId' => $rows[$i]->trackId,
						'title' => $rows[$i]->title,
						'itemId' => 0,
						'allowDrag' => false
					);
				}
			}
		}
		else if (preg_match('/trackId\-(\d+)/', $node, $matches)) {
			// get the top level children of the track
			$trackId = intval($matches[1]);
			$itemTable = new Navigation_Model_Db_Item();
			$select = $itemTable->select()->where('trackId = ?', $trackId)->where('parentId = 0')->order('sortOrder');
			$rows = $itemTable->fetchAll($select);
			$numRows = count($rows);
			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$items[] = array(
						'text' => $rows[$i]['title'],
						'id' => 'itemId-' . $rows[$i]['itemId'],
						'cls' => 'folder',
						'itemType' => 'item',

						'itemId' => $rows[$i]['itemId'],
						'title' => $rows[$i]['title'],
						'trackId' => $rows[$i]['trackId'],
						'parentId' => $rows[$i]['parentId'],
						'url' => $rows[$i]['url'],
						'target' => $rows[$i]['target']
					);
				}
			}
		}
		else if (preg_match('/itemId\-(\d+)/', $node, $matches)) {
			// get the children of this navigation item
			$itemId = intval($matches[1]);
			$item = new Navigation_Model_Item($itemId);
			if ($item->row->itemId) {
				$itemTable = new Navigation_Model_Db_Item();
				$select = $itemTable->select()->where('parentId = ?', $item->row->itemId)->order('sortOrder');
				$rows = $itemTable->fetchAll($select);
				$numRows = count($rows);
				if ($numRows) {
					for ($i = 0; $i < $numRows; $i++) {
						$items[] = array(
							'text' => $rows[$i]['title'],
							'id' => 'itemId-' . $rows[$i]['itemId'],
							'cls' => 'folder',
							'itemType' => 'item',

							'itemId' => $rows[$i]['itemId'],
							'title' => $rows[$i]['title'],
							'trackId' => $rows[$i]['trackId'],
							'parentId' => $rows[$i]['parentId'],
							'url' => $rows[$i]['url'],
							'target' => $rows[$i]['target']
						);
					}
				}
			}
		}

		// encode the array of nodes and output it as plain text
		$this->sendPlainText();
		echo json_encode($items);
	}
	
	public function addTrackAction() {
		$title = Redokes_Controller_Front::getInstance()->getParam('title', 'New Track');
		$track = new Navigation_Model_Track();
		$track->setRow(array(
			'title' => $title
		));
		$track->save();
	}
	
	public function addItemAction() {
		$title = Redokes_Controller_Front::getInstance()->getParam('title', 'New') . ' Child';
		$trackId = intval(Redokes_Controller_Front::getInstance()->getParam('trackId', 0));
		$parentId = intval(Redokes_Controller_Front::getInstance()->getParam('parentId', 0));
		$url = Redokes_Controller_Front::getInstance()->getParam('url', '#');
		
		$item = new Navigation_Model_Item();
		$item->setRow(array(
			'title' => $title,
			'trackId' => $trackId,
			'parentId' => $parentId,
			'url' => $url
		));
		$item->save();
		
		$this->setParam('itemId', $parentId);
		$this->setParam('trackId', $trackId);
		
		$track = new Navigation_Model_Track($trackId);
		$track->clearCache();

		$this->addMessage($item->row['title'] . ' added');
	}

	public function updateAction() {
		$itemType = Redokes_Controller_Front::getInstance()->getParam('itemType', false);
		if ($itemType == 'track') {
			$this->updateTrackAction();
		}
		else if ($itemType == 'item') {
			$this->updateItemAction();
		}
	}

	public function updateTrackAction() {
		$track = new Navigation_Model_Track();
		$track->loadPost();
		$this->addError($track->validate());
		if (!$this->anyErrors()) {
			$track->process();
			$track->clearCache();
			$this->setParam('row', $track->row);
		}
	}
	
	public function updateItemAction() {
		$item = new Navigation_Model_NavigationItem();
		$item->loadPost();
		if ($item->row['itemId']) {
			$item->process();
			
			$track = new Navigation_Model_Track($item->row['trackId']);
			$track->clearCache();
			
			$this->setParam('success', true);
			$this->setParam('row', $item->row);
			
			$newOrder = Redokes_Controller_Front::getInstance()->getParam('newOrder', array());
			for ($i = 0; $i < count($newOrder); $i++) {
				$item = new Navigation_Model_NavigationItem($newOrder[$i]);
				if ($item->row['itemId']) {
					$item->row['sortOrder'] = $i;
					$item->process();
				}
			}
		}
		
		$oldParentId = intval(Redokes_Controller_Front::getInstance()->getParam('oldParentId', 0));
		$track = new Navigation_Model_Track($oldParentId);
		$track->clearCache();
	}
	
	public function pasteListAction() {
		$html = Redokes_Controller_Front::getInstance()->getParam('html', '');
		$parentId = intval(Redokes_Controller_Front::getInstance()->getParam('parentId', 0));
		$trackId = intval(Redokes_Controller_Front::getInstance()->getParam('trackId', 0));
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
			
			$track = new Navigation_Model_Track($trackId);
			$track->clearCache();
		}
	}

	public function makeFromNewLines($str, $trackId, $parentId) {
		$lines = preg_split('/[\n\r]/', $str);
		$numLines = count($lines);
		for ($i = 0; $i < $numLines; $i++) {
			$item = new Navigation_Model_NavigationItem();
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
							$item = new Navigation_Model_NavigationItem();
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
		$items = Redokes_Controller_Front::getInstance()->getParam('items', '[]');
		$items = json_decode($items, true);
		for ($i = 0; $i < count($items); $i++) {
			$itemId = intval($items[$i]['itemId']);
			$trackId = intval($items[$i]['trackId']);
			if ($trackId) {
				if ($itemId) {
					// deleting an item
					$item = new Navigation_Model_Item($itemId);
					$item->delete();
					$track = new Navigation_Model_Track($item->row->trackId);
					$track->clearCache();
				}
				else {
					// deleting an entire track
					$track = new Navigation_Model_Track($trackId);
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
		$track = new Navigation_Model_Track(getParam('trackId', 0));
		$format = getParam('format', 'html');
		$urlField = 'url';
		if ($_POST['urlField'] == 'editUrl') {
			$urlField = 'editUrl';
		}
		$navId = Redokes_Controller_Front::getInstance()->getParam('navId', 'defaultNav');
		$navClass = Redokes_Controller_Front::getInstance()->getParam('navClass', 'defaultNav');
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