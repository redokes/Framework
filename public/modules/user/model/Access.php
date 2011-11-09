<?php
class User_Model_Access extends Redokes_Model_Model {
	
	public $tableClassName = 'User_Model_Db_Access';
	public $requiredStringFields = array(
		'title' => 'Title'
	);
	public $uniqueFields = array(
		'title' => 'Title'
	);

	public function clearUsers($primaryKey = 0) {
		User_Model_UserToAccess::clearAccess($this->row->accessId, $primaryKey);
	}
	
	public function checkRow() {
		if (!intval($this->row->accessId) && strlen($this->row->title)) {
			$this->save();
		}
	}
	
	public function addUsers($userIds = array(), $primaryKey = 0) {
		$this->checkRow();
		
		if(!is_array($userIds)){
			$userIds = array($userIds);
		}
		$numUserIds = count($userIds);
		for ($i = 0; $i < $numUserIds; $i++) {
			$userId = intval($userIds[$i]);
			if ($userId) {
				$userAccess = new User_Model_UserToAccess();
				$userAccess->setRow(array(
					'accessId' => $this->row->accessId,
					'userId' => $userId,
					'primaryKey' => $primaryKey
				));
				$userAccess->save();
			}
		}
	}

	public function setUsers($userIds = array(), $primaryKey = 0) {
		if ($this->row->accessId) {

			// clear out the current user list
			$this->clearUsers($primaryKey);

			// add new users
			$this->addUsers($userIds, $primaryKey);
		}
	}

	public function getUsers($primaryKey = 0) {
		$db = FrontController::getInstance()->getDbAdapter();
		$userIds = array();
		if ($this->row->accessId) {
			$primaryKey = intval($primaryKey);
			$query = "SELECT userId FROM site_users_x_access WHERE accessId = {$this->row->accessId} AND primaryKey = $primaryKey";
			$rows = $db->fetchAll($query);
			$numRows = count($rows);
			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$userIds[] = $rows[$i]['userId'];
				}
			}
		}
		return $userIds;
	}

	public function clearGroups($primaryKey) {
		User_Model_GroupAccess::clearAccess($this->row->accessId, $primaryKey);
	}

	public function addGroups($groupIds = array(), $primaryKey = 0) {
		$groupAccess = new User_Model_GroupAccess();
		for ($i = 0; $i < count($groupIds); $i++) {
			$groupId = intval($groupIds[$i]);
			if ($groupId) {
				$groupAccess->setRow(array(
					'relationshipId' => 0,
					'accessId' => $this->row->accessId,
					'groupId' => $groupId,
					'primaryKey' => $primaryKey
				));
				$groupAccess->save();
			}
		}
	}

	public function setGroups($groupIds = array(), $primaryKey = 0) {
		if ($this->row->accessId) {

			// clear out the current user list
			$this->clearGroups($primaryKey);

			// add new users
			$this->addGroups($groupIds, $primaryKey);
		}
	}

	public function getGroups($primaryKey = 0) {
		$db = FrontController::getInstance()->getDbAdapter();
		$groupIds = array();
		if ($this->row->accessId) {
			$primaryKey = intval($primaryKey);
			$query = "SELECT groupId FROM site_users_groups_x_access WHERE accessId = {$this->row->accessId} AND primaryKey = $primaryKey";
			$rows = $db->fetchAll($query);
			$numRows = count($rows);
			if ($numRows) {
				for ($i = 0; $i < $numRows; $i++) {
					$groupIds[] = $rows[$i]['groupId'];
				}
			}
		}
		return $groupIds;
	}
	
	public function findAccess($accessToCheck = array()) {
		$select = $this->table->select()->where('title IN (?)', $accessToCheck);
		return $this->table->fetchAll($select);
	}
}