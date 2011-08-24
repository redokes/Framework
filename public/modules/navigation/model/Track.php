<?php
class Navigation_Model_Track extends Redokes_Model_Model {
	
	public $tableClassName = 'Navigation_Model_Db_Track';
	
	public $requiredStringFields = array(
		'title' => 'Title'
	);
	
	public $keyword = 'Navigation Track';
	public $auditOnProcess = true;
	
	public function delete($doAudit = true) {
		return;
		$db = Redokes_Controller_Front::getInstance()->getDbAdapter();
		
		// get top level items and delete them, which will delete all children
		$query = "SELECT * FROM navigation_items WHERE trackId = {$this->row->trackId} AND parentId = 0";
		$rows = $db->fetchAll($query);
		$numRows = count($rows);
		if ($numRows) {
			for ($i = 0; $i < $numRows; $i++) {
				$item = new Navigation_Class_NavigationItem();
				$item->setRow($rows[$i]);
				$item->delete($doAudit);
			}
		}
		parent::delete($doAudit);
	}
	
	private function buildHtml($topId = '', $className = '', $parentId = 0, $urlField = 'url') {
		$str = '';
		
		$select = $this->table->select()
				->where('trackId = ?', $this->row->trackId)
				->where('parentId = ?', $parentId)
				->order('sortOrder');
		$rows = $this->table->fetchAll($select);
		
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
				$safeTitle = Redokes_Util::safeTitle($rows[$i]['title']);
				$str .= "<li name=\"item_{$this->row->trackId}-{$rows[$i]['itemId']}\" class=\"$safeTitle\"><a href=\"{$rows[$i][$urlField]}\" $target class=\"$safeTitle\">{$rows[$i]['title']}</a>";
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
				$rows[$i]['safeTitle'] = Redokes_Util::safeTitle($rows[$i]['title']);
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