<?php
class User_Model_Db_User extends Zend_Db_Table_Abstract {
	protected $_name = 'user';
	protected $_primary = 'userId';
	
	public function getPrimary() {
		return $this->_primary[1];
	}
	
	public function getCols() {
		return $this->_cols;
	}
}