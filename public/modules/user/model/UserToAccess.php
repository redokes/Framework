<?php
class User_Model_UserToAccess extends Redokes_Model_Model {
	
	public $tableClassName = 'User_Model_Db_UserToAccess';

	public function save($doAudit = true) {
		if (!$this->row->relationshipId) {
			$this->loadRow(array(
				'accessId' => $this->row->accessId,
				'userId' => $this->row->userId
			));
		}
		parent::save($doAudit);
	}

	public static function clearAccess($accessId, $primaryKey) {
		$accessId = intval($accessId);
		$primaryKey = intval($primaryKey);
		$db = FrontController::getInstance()->getDbAdapter();
		$db->delete($this->table, "accessId = $accessId AND primaryKey = $primaryKey");
	}

	public static function clearUserAccess($userId) {
		$userId = intval($userId);
		$db = FrontController::getInstance()->getDbAdapter();
		$db->delete('site_users_x_access', "userId = $userId");
	}

	public static function clearGroupAccess($groupId) {
		$groupId = intval($groupId);
		$db = FrontController::getInstance()->getDbAdapter();
		$db->delete('site_users_groups_x_access', "groupId = $groupId");
	}

	public static function getAccessIds($userId) {
		$userId = intval($userId);
		$accessIds = array();

		$db = FrontController::getInstance()->getDbAdapter();
		$query = "SELECT accessId FROM site_users_x_access WHERE userId = $userId";
		$rows = $db->fetchAll($query);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$accessIds[] = $rows[$i]['accessId'];
		}
		return $accessIds;
	}
	
	public function checkPermission($userId, $accessIds, $primaryKey) {
		$primaryKeys = array(0, $primaryKey);
		$select = $this->table->select()
				->from($this->table->getTableName(), 'COUNT(*) num')
				->where('userId = ?', $userId)
				->where('primaryKey IN (?)', $primaryKeys)
				->where('accessId IN (?)', $accessIds);
		return $this->table->fetchRow($select);
	}
}