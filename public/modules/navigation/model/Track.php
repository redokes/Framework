<?php
class Navigation_Model_Track extends Redokes_Model_Model {
	
	public $tableClassName = 'Navigation_Model_Db_Track';
	public $itemTable = false;
	
	public $requiredStringFields = array(
		'title' => 'Title'
	);
	
	public $keyword = 'Navigation Track';
	public $auditOnProcess = true;
	
	public function __construct($id = false) {
		parent::__construct($id);
		$this->itemTable = new Navigation_Model_Db_Item();
	}
	
	public function delete($doAudit = true) {
		// get top level items and delete them, which will delete all children
		$itemTable = new Navigation_Model_Db_Item();
		$select = $itemTable->select()->where('trackId = ?', $this->row->trackId)->where('parentId = 0');
		$rows = $itemTable->fetchAll($select);
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
	
	private function buildHtml($topId = '', $className = '', $parentId = 0, $urlField = 'url') {
		$str = '';
		$select = $this->itemTable->select()
				->where('trackId = ?', $this->row->trackId)
				->where('parentId = ?', $parentId)
				->order('sortOrder');
		$rows = $this->itemTable->fetchAll($select);
		
		$numRows = count($rows);
		if ($numRows) {
			if ($parentId) {
				$str .= '<ul>';
			}
			else {
				$str .= '<ul id="'.$topId.'" class="'.$className.'">';
			}
			
			for ($i = 0; $i < $numRows; $i++) {
				//Check if target is a new window
				$target = '';
				if ($rows[$i]['target']) {
					$target = 'target="_blank"';
				}
				$slug = Redokes_Util::getSlug($rows[$i]['title']);
				$str .= "<li name=\"item_{$this->row->trackId}-{$rows[$i]['itemId']}\" class=\"$slug\"><a href=\"{$rows[$i][$urlField]}\" $target class=\"$slug\">{$rows[$i]['title']}</a>";
				$str .= $this->buildHtml($topId, $className, $rows[$i]['itemId'], $urlField);
				$str .= '</li>';
				
			}
			$str .= '</ul>';
		}
		else if (!$parentId) {
			$str .= '<ul id="'.$topId.'" class="'.$className.'">';
		}
		return $str;
	}
	
	private function buildJson($parentId = 0, $urlField = 'url') {
		$arr = array();
		$query = "SELECT * FROM navigation_item WHERE trackId = {$this->row->trackId} AND parentId = $parentId ORDER BY sortOrder ";
		$rows = $db->fetchAll($query);
		$numRows = count($rows);
		if ($numRows) {
			for ($i = 0; $i < $numRows; $i++) {
				$rows[$i]['slug'] = Redokes_Util::getSlug($rows[$i]['title']);
				$rows[$i]['items'] = $this->buildJson($rows[$i]['itemId'], $urlField);
				$arr[] = $rows[$i];
				
			}
		}
		return $arr;
	}
	
	public function getHtml($topId = '', $className = '', $parentId = 0, $urlField = 'url') {
		$className .= ' redokes-nav redokes-nav-hidden ';
		$cacheId = 'trackHtml_' . $this->row->trackId . $topId . $parentId . $className . $urlField;
		$cacheId = preg_replace('/[^a-zA-Z0-9_]/', '', $cacheId);
		
		$cache = Redokes_Controller_Front::getInstance()->getCache();
		
		if (($data = $cache->load($cacheId)) === false) {
			$data = $this->buildHtml($topId, $className, $parentId, $urlField);
			$cache->save($data, $cacheId, array('navigationTrack' . $this->row->trackId));
		}
		return $data;
	}
	
	public function getJson($parentId = 0, $urlField = 'url') {
		$cacheId = 'trackJson_' . $this->row->trackId . $parentId . $urlField;
		$cacheId = preg_replace('/[^a-zA-Z0-9_]/', '', $cacheId);

		$cache = Redokes_Controller_Front::getInstance()->getCache();

		if (($data = $cache->load($cacheId)) === false) {
			$data = $this->buildJson($parentId, $urlField);
			$cache->save($data, $cacheId, array('navigationTrack' . $this->row->trackId));
		}
		return $data;
	}
	
	public function clearCache() {
		if ($this->row->trackId) {
			$cache = Redokes_Controller_Front::getInstance()->getCache();
			$cache->clean(
				Zend_Cache::CLEANING_MODE_MATCHING_TAG,
				array('navigationTrack' . $this->row->trackId)
			);
		}
	}
	
	public function setDefault() {
		$db = Redokes_Controller_Front::getInstance()->getDbAdapter();
		$data = array('isDefault' => 0);
		$db->update($this->table, $data, 'isDefault = 1');
		$this->row->isDefault = 1;
		$this->process();
	}
}