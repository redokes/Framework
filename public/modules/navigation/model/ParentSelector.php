<?php
class Navigation_Class_ParentSelector {
	public $display = '';
	public $target = 0;
	public $oldUrl = false;
	public $newUrl = false;
	public $editUrl = false;
	public $itemIds = array();
	public $items = array();
	
	public function __construct($oldUrl) {
		$this->oldUrl = $oldUrl;
		$this->newUrl = $oldUrl;
		$this->loadDb();
	}
	
	public function loadDb() {
		$db = FrontController::getInstance()->getDbAdapter();
		
		if (strlen($this->oldUrl)) {
			
			// load up the item info
			$query = "SELECT * FROM navigation_items WHERE url = ?";
			$rows = $db->fetchAll($query, $this->oldUrl);
			$numRows = count($rows);
			if ($numRows) {
				$this->display = $rows[0]['title'];
				$this->target = $rows[0]['target'];
				$this->editUrl = $rows[0]['editUrl'];
			}
			
			// get top level items
			$query = "SELECT navigation_items.*, navigation_tracks.title trackTitle
				FROM navigation_items, navigation_tracks
				WHERE url = ?
				AND parentId = 0
				AND navigation_items.trackId = navigation_tracks.trackId";
			$rows = $db->fetchAll($query, $this->oldUrl);
			$numRows = count($rows);
			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$rows[$i]['title'] = 'Top Level - ' . $rows[$i]['trackTitle'];
					$rows[$i]['itemId'] = '0-' . $rows[$i]['trackId'];
					$rows[$i]['url'] = '';
					$rows[$i]['editUrl'] = '';
					$this->items[] = $rows[$i];
					$this->itemIds[] = $rows[$i]['itemId'];
				}
			}
			
			// load up the items with this url
			$query = "SELECT items1.* FROM navigation_items items1, navigation_items items2
				WHERE items2.url = ?
				AND items2.parentId = items1.itemId";
			$rows = $db->fetchAll($query, $this->oldUrl);
			$numRows = count($rows);
			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$this->items[] = $rows[$i];
					$this->itemIds[] = $rows[$i]['itemId'];
				}
			}
		}
	}
	
	public function setParentInfo($parentInfo) {
		$this->display = $parentInfo['display'];
		$this->target = 0;
		if (isset($parentInfo['target'])) {
			$this->target = 1;
		}
		$this->itemIds = array();
		$this->items = array();
		
		if (isset($parentInfo['itemIds'])) {
			if (is_array($parentInfo['itemIds'])) {
				$this->itemIds = $parentInfo['itemIds'];
			}
			else if (is_string($parentInfo['itemIds'])) {
				if (strlen($parentInfo['itemIds'])) {
					$this->itemIds = explode(',', $parentInfo['itemIds']);
				}
			}
		}
	}
	
	public function validate() {
		$errors = array();
		if (count($this->itemIds) && !strlen($this->display)) {
			$errors[] = 'Display text is required when adding an item to the navigation';
		}
		
		return $errors;
	}
	
	public function process($doAudit = true) {
		$db = FrontController::getInstance()->getDbAdapter();
		
		// keep track of all track ids that were modified so cache can be cleared
		$trackIds = array();
		
		// keep track of the updated db items so we can compare against new submtited ones
		$updatedIds = array();
		
		// update old urls to new url
		if (strlen($this->oldUrl)) {
			$query = "SELECT * FROM navigation_items WHERE url = ?";
			$rows = $db->fetchAll($query, $this->oldUrl);
			$numRows = count($rows);
			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$item = new Navigation_Class_NavigationItem();
					$item->setRow($rows[$i]);
					$item->row['url'] = $this->newUrl;
					$item->row['editUrl'] = $this->editUrl;
					$item->update($doAudit);
				}
			}
		}
		
		// get all nav items with this url
		$query = "SELECT * FROM navigation_items WHERE url = ?";
		$rows = $db->fetchAll($query, $this->newUrl);
		$numRows = count($rows);
		if ($numRows) {
			for ($i = 0; $i < $numRows; $i++) {
				$row = $rows[$i];
				$item = new Navigation_Class_NavigationItem();
				$item->setRow($row);
				
				// check for top level
				if (!$item->row['parentId']) {
					$item->row['parentId'] = '0-' . $item->row['trackId'];
				}
				
				// remember the modified tracks
				$trackIds[$item->row['trackId']] = true;
				
				// delete db row if not in post data
				if (!in_array($item->row['parentId'], $this->itemIds)) {
					$item->delete($doAudit);
				}
				else {
					// update the db rows that were in post data
					$item->setRow(array(
						'title' => $this->display,
						'target' => $this->target
					));
					if ($item->row['parentId'] == '0-' . $item->row['trackId']) {
						$item->row['parentId'] = 0;
						$item->process($doAudit);
						$item->row['parentId'] = '0-' . $item->row['trackId'];
					}
					else {
						$item->process($doAudit);
					}
					
					// check for top level
					if (!$item->row['parentId']) {
						//$item->row['parentId'] = '0-' . $item->row['trackId'];
					}
					$updatedIds[] = $item->row['parentId'];
				}
			}
		}
		//show_array($this->itemIds);
		//show_array($updatedIds);
		// loop through submitted item ids and check against updated item ids
		// so we know which ones need to be inserted
		for ($i = 0; $i < count($this->itemIds); $i++) {
			if (!in_array($this->itemIds[$i], $updatedIds)) {
				$item = new Navigation_Class_NavigationItem();
				
				$trackId = 0;
				
				// if new item has a parent that is top level, the itemId (referring to the parent)
				// will be 0-trackId
				if (substr($this->itemIds[$i], 0, 1) == '0') {
					$trackId = intval(end(explode('-', $this->itemIds[$i])));
					$this->itemIds[$i] = 0;
				}
				else {
					// get the trackId of the parent
					$parent = new Navigation_Class_NavigationItem($this->itemIds[$i]);
					$trackId = $parent->row['trackId'];
				}
				$item->setRow(array(
					'title' => $this->display,
					'target' => $this->target,
					'trackId' => $trackId,
					'parentId' => $this->itemIds[$i],
					'url' => $this->newUrl,
					'editUrl' => $this->editUrl,
				));
				$item->process($doAudit);
				$trackIds[$item->row['trackId']] = true;
			}
		}
		
		// clear cache for modified tracks
		foreach($trackIds as $trackId => $bool) {
			$track = new Navigation_Class_Track($trackId);
			$track->clearCache();
		}
	}
}