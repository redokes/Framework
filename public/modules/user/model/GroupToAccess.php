<?php
class User_Model_GroupToAccess extends Redokes_Model_Model {
	
	public $tableClassName = 'User_Model_Db_GroupToAccess';

	public function save($doAudit = true) {
		if (!$this->row->relationshipId) {
			$this->loadRow(array(
				'accessId' => $this->row->accessId,
				'groupId' => $this->row->groupId
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

	public static function getAccessIds($groupId) {
		$groupId = intval($groupId);
		$accessIds = array();
		$db = FrontController::getInstance()->getDbAdapter();
		$query = "SELECT accessId FROM site_users_groups_x_access WHERE groupId = $groupId";
		$rows = $db->fetchAll($query);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$accessIds[] = $rows[$i]['accessId'];
		}
		return $accessIds;
	}
	
	public function checkPermission($groupId, $accessIds, $primaryKey) {
		$primaryKeys = array(0, $primaryKey);
		$select = $this->table->select()
				->from($this->table->getTableName(), 'COUNT(*) num')
				->where('groupId = ?', $groupId)
				->where('primaryKey IN (?)', $primaryKeys)
				->where('accessId IN (?)', $accessIds);
		return $this->table->fetchRow($select);
	}
}