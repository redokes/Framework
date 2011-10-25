<?php
class Content_Model_Content extends Redokes_Model_Model {
	
	public $tableClassName = 'Content_Model_Db_Content';
	
	public function afterInsert() {
		if (!$this->row['groupId']) {
			$this->row['groupId'] = $this->row['contentId'];
			$this->save();
		}
	}

	public function getContent() {
		// Need to check if we can assign these in the table definition
		if (!$this->row['contentId']) {
			$this->row['contentId'] = 0;
		}
		if (!$this->row['groupId']) {
			$this->row['groupId'] = 0;
		}

//		$rows = $this->itemTable->fetchAll($select);
		
		$select = $this->table->select()
				->where('ts <= ' . time())
				->where('published = 1')
				->where('groupId = ' . $this->row['groupId'])
				->order('ts DESC LIMIT 1');
		$row = $this->table->fetchRow($select);
		if ($row) {
			return $row->content;
		}
		return false;
	}
	
	public function createVersion($content = '', $ts = 0, $published = 1) {
		if (!$ts) {
			$ts = time();
		}

		// make sure content has actually changed
		$currentContent = $this->getContent();
		if ($currentContent != $content || !$this->row['groupId']) {
			$version = new Content_Model_Content();
			$version->setRow(array(
				'groupId' => $this->row['contentId'],
				'ts' => $ts,
				'published' => $published,
				'content' => $content
			));
			$version->save();

			return $version;
		}
		else {
			return $this;
		}
	}

	public function loadBasedOn($basedOn, $moduleKey, $moduleTable) {
		$db = FrontController::getInstance()->getDbAdapter();
		$query = "SELECT {$this->table}.*
			FROM {$this->table}, content_relation
			WHERE basedOn = ?
			AND {$this->table}.contentId = content_relation.contentId
			AND content_relation.moduleKey = ?
			AND content_relation.moduleTable = ?";
		$data = array($basedOn, $moduleKey, $moduleTable);
		$rows = $db->fetchAll($query, $data);
		$numRows = count($rows);
		if ($numRows) {
			$this->setRow($rows[0]);
		}
	}

	public function loadCurrentRow() {
		$db = FrontController::getInstance()->getDbAdapter();
		$query = "SELECT {$this->table}.*
			FROM {$this->table}
			WHERE groupId = ?
			AND ts <= ?
			ORDER BY ts DESC LIMIT 1";
		$data = array($this->row['groupId'], time());
		$rows = $db->fetchAll($query, $data);
		$numRows = count($rows);
		if ($numRows) {
			$this->setRow($rows[0]);
		}
	}
}