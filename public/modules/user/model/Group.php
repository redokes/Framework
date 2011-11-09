<?php
class User_Model_Group extends Redokes_Model_Model {
	
	public $tableClassName = 'User_Model_Db_Group';
	public $requiredStringFields = array(
		'email' => 'Email'
	);
	public $uniqueFields = array(
		'title' => 'Title'
	);
	
	public $accessIds = array();
	public $userIds = array();

//	public function loadPost($post = false){
//		$post = parent::loadPost($post);
//		$this->accessIds = getParam('accessIds', array(), $post);
//		$this->userIds = getParam('userIds', array(), $post);
//	}

//	public function save($doAudit = true){
//		parent::save($doAudit);
//		$this->processAccess();
//		$this->processUsers();
//	}

	public function getUserIds() {
		$userToGroup = new User_Model_UserToGroup();
		return $userToGroup->getUserIds($this->row->groupId);
	}
	
	public function addUser($userId = 0) {
		if (!is_array($userId)) {
			$userId = array($userId);
		}
		$numUserIds = count($userId);
		for ($i = 0; $i < $numUserIds; $i++) {
			$userToGroup = new User_Model_UserToGroup();
			$userToGroup->setRow(array(
				'userId' => $userId[$i],
				'groupId' => $this->row->groupId
			));
			try {
				$userToGroup->save();
			}
			catch(Exception $e) {
				// Already exists
			}
		}
	}
	
	public function getAccessIds(){
		return User_Model_GroupToAccess::getAccessIds($this->row->groupId);
	}

	public function delete($doAudit = true) {
		// remove access relation
		User_Model_UserToAccess::clearGroupAccess($this->row->groupId);

		// remove user relation
		User_Model_UserToGroup::clearUsers($this->row->groupId);

		parent::delete($doAudit);
	}

	public function processUsers() {
		// delete all user relations
		User_Model_UserToGroup::clearUsers($this->row->groupId);

		// add user relations from post
		$userXGroup = new User_Model_UserToGroup();
		for ($i = 0; $i < count($this->userIds); $i++) {
			if(intval($this->userIds[$i])){
				$userXGroup->setRow(array(
					'relationshipId' => 0,
					'userId' => $this->userIds[$i],
					'groupId' => $this->row->groupId
				));
				$userXGroup->process();
			}
		}
	}

	public function processAccess() {
		// delete all access relations
		User_Model_UserToAccess::clearGroupAccess($this->row->groupId);

		// add access relations from post
		$groupAccess = new User_Model_GroupToAccess();
		for ($i = 0; $i < count($this->accessIds); $i++) {
			if(intval($this->accessIds[$i])){
				$groupAccess->setRow(array(
					'relationshipId' => 0,
					'groupId' => $this->row->groupId,
					'accessId' => $this->accessIds[$i]
				));
				$groupAccess->process();
			}
		}
	}
}