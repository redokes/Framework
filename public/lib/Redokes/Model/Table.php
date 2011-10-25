<?php

class Redokes_Model_Table extends Zend_Db_Table_Abstract {

	public function getPrimary() {
		return $this->_primary[1];
	}
	
	public function getCols() {
		return $this->_cols;
	}

}