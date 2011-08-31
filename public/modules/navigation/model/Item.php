<?php
class Navigation_Model_Item extends Redokes_Model_Model {
	public $tableClassName = 'Navigation_Model_Db_Item';
	
	public $requiredStringFields = array(
		'title' => 'Title'
	);
	
	public $keyword = 'Navigation Item';
	public $auditOnProcess = true;
	
	public function process($doAudit = true) {
		
		// get the highest sort order if not set
		if ($this->row['sortOrder'] == -1) {
			$this->row['sortOrder'] = 100;
			$query = "SELECT MAX(`sortOrder`) sortOrder FROM navigation_items WHERE trackId = {$this->row['trackId']} AND parentId = {$this->row['parentId']}";
			$rows = $db->fetchAll($query);
			$numRows = count($rows);
			if ($numRows) {
				$this->row['sortOrder'] = $rows[0]['sortOrder'] + 1;
			}
		}
		else {
			// check if any siblings have the same sort order
			$query = "SELECT COUNT(*) num FROM navigation_items WHERE trackId = {$this->row['trackId']} AND parentId = {$this->row['parentId']} AND sortOrder = {$this->row['sortOrder']} AND itemId <> {$this->row['itemId']}";
			$rows = $db->fetchAll($query);
			$numRows = count($rows);
			if ($numRows) {
				if ($rows[0]['num']) {
					// raise the sort order by one on all siblings above this item
					$query = "UPDATE navigation_items SET sortOrder = (sortOrder + 1) WHERE trackId = {$this->row['trackId']} AND parentId = {$this->row['parentId']} AND sortOrder >= {$this->row['sortOrder']} AND itemId <> {$this->row['itemId']}";
					$db->exec($query);
				}
			}
		}
		
		// if there is no track id set, get the track id of the parent
		if (!$this->row['trackId']) {
			$query = "SELECT trackId FROM navigation_items WHERE itemId = {$this->row['parentId']}";
			$rows = $db->fetchAll($query);
			$numRows = count($rows);
			if ($numRows) {
				$this->row['trackId'] = $rows[0]['trackId'];
			}
		}
		
		// make sure there is a track id just in case it was added as a child
		// of a deleted item
		if ($this->row['trackId']) {
			parent::process($doAudit);
		}
	}
	
	public function delete($doAudit = true) {
		// delete children first
		$select = $this->table->select()->where('trackId = ?', $this->row->trackId)->where('parentId = ?', $this->row->itemId);
		$rows = $this->table->fetchAll($select);
		$numRows = count($rows);
		if ($numRows) {
			for ($i = 0; $i < $numRows; $i++) {
				$item = new Navigation_Model_Item();
				$item->row = $rows[$i];
				$item->delete($doAudit);
			}
		}
		
		parent::delete($doAudit);
	}
	
	public static function deleteByUrl($url) {
		$db = FrontController::getInstance()->getDbAdapter();
		$navigationItem = new Navigation_Model_Item();
		
		$query = "SELECT * FROM {$navigationItem->table} WHERE url = {$db->quote($url)}";
		$rows = $db->fetchAll($query);
		$numRows = count($rows);
		
		
		for ($i = 0; $i < $numRows; $i++) {
			$navigationItem->setRow($rows[$i]);
			$navigationItem->delete();
		}
	}
}