<?php
class User_Model_UserToGroup extends Redokes_Model_Model {
	
	public $tableClassName = 'User_Model_Db_UserToGroup';

	public function clearUsers($groupId) {
		$groupId = intval($groupId);
		$db = FrontController::getInstance()->getDbAdapter();
		$db->delete('site_users_x_groups', "groupId = $groupId");
	}

	public function clearGroups($userId) {
		$userId = intval($userId);
		$db = FrontController::getInstance()->getDbAdapter();
		$db->delete('site_users_x_groups', "userId = $userId");
	}

	public function getGroupIds($userId) {
		$userId = intval($userId);
		$groupIds = array();
		$select = $this->table->select()
				->from($this->table->getTableName(), 'groupId')
				->where('userId = ?', $userId);
		$rows = $this->table->fetchAll($select);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$groupIds[] = $rows[$i]['groupId'];
		}
		return $groupIds;
	}

	public function getUserIds($groupId) {
		$userIds = array();
		$select = $this->table->select()
				->from($this->table->getTableName(), 'userId')
				->where('groupId = ?', $groupId);
		$rows = $this->table->fetchAll($select);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$userIds[] = $rows[$i]['userId'];
		}
		return $userIds;
	}
}