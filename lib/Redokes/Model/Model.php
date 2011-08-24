<?php

class Redokes_Model_Model {

	/**
	 * The class name of the Zend_Db_Table_Abstract
	 * @var string
	 */
	public $tableClassName;
	
	
	/**
	 * This will be an instance of Zend_Db_Table_Abstract for the table
	 * @var Zend_Db_Table_Abstract
	 */
	public $table;
	
	/**
	 * This will be an instance of Zend_Db_Table_Row
	 * @var Zend_Db_Table_Row
	 */
	public $row;
	
	/**
	 * This is the salt that will be used when generating hashes for this class
	 * @var string
	 */
	private $_salt = 'kizzamakeitup';
	
//	private $cleanRow = array();
	
	/**
	 * Errors that are generated during validation
	 * @var array
	 */
	
	public $errors = array();
	/**
	 * Wes can you doument how this works?
	 *
	 * @var array
	 */
	
	public $requiredStringFields = array();
	/**
	 * Wes can you doument how this works?
	 *
	 * @var array
	 */
	
	public $requiredNumberFields = array();
	/**
	 * Fields to use with the search harvester.
	 * @var array
	 * @example fieldName => num --- 'title' => 20
	 */
	
	public $harvestFields = array();
	
	/**
	 * Boolean to harvest this module or not
	 * @var Boolean
	 */
	public $harvestOnProcess = false;
	
	/**
	 * Boolean of whether or not this module shows up in the audit
	 * @var Boolean
	 */
	public $auditOnProcess = false;
	
	/**
	 * Wes can you document this.
	 * @var unknown_type
	 */
	public $oldPageUrl;
	
	/**
	 * Keyword is used in audit as the display name in the filter
	 * @var String
	 */
	public $keyword = false;
	
	/**
	 * An array of field names that are represented by checkboxes in the add/edit form
	 * @var array
	 */
	public $checkboxes = array();
	
	/**
	 * Set to true in the validation method so it can be checked
	 * by other processing in the isValidated function
	 * @var array
	 */
	private $_validated = false;
	
	/** An array of events associated with this module
	 * @var array
	 */
	public $events = array();
	/**
	 * An array of listeners to be used with this module
	 * @var array
	 */
	public $listeners = array();
	/**
	 * just until all forms use ext errors by default
	 * @var Boolean
	 */
	public $isExt = false;

	public function __construct($id = false) {
		$this->table = new $this->tableClassName;
		if ($id) {
			$this->loadRow($id);
		}
		else {
			$this->row = $this->table->createRow();
		}
	}
	
	public function loadRow($value, $field = false) {
		$select = $this->table->select();
		//$this->table->getAdapter()->quote($v)
		// Check if value is an array
		if (is_array($value)) {
			foreach ($value as $k => $v) {
				$select->where("`$k` = ?", $v);
			}
		}
		else {
			if (!$field) {
				$field = $this->table->getPrimary();
			}
			$select->where("`$field` = ?", $value);
		}
		$this->row = $this->table->fetchRow($select);
	}

	public function loadPost($post = false) {
		// we need to load it from the db first to be sure to only change the changed fields
		// also, so we can set the old url used for the harvester
		if (!$post) {
			$post = $_POST;
		}
		$field = $this->table->getPrimary();
		if (isset($post[$field])) {
			$this->loadRow($field);
		}
		
		$this->setRow($post);
		
		// look for checkboxes
		for ($i = 0; $i < count($this->checkboxes); $i++) {
			$this->row[$this->checkboxes[$i]] = 0;
			if (isset($post[$this->checkboxes[$i]])) {
				$this->row->{$this->checkboxes[$i]} = 1;
			}
		}

		return $post;
	}
	
	public function getRow() {
		$cols = $this->table->getCols();
		$numCols = count($cols);
		$row = array();
		for ($i = 0; $i < $numCols; $i++) {
			$row[$cols[$i]] = $this->row->{$cols[$i]};
		}
		return $row;
	}

	public function setRow($row) {
		foreach ($row as $key => $value) {
			try {
				$this->row->$key = $value;
			}
			catch(Exception $e) {
				
			}
		}
	}

	public function getCleanRow() {
		return $this->cleanRow;
	}

	public function getAbsoluteUrl() {
		return 'http://' . $_SERVER['HTTP_HOST'] . $this->getPageUrl();
	}

	public function getPageUrl() {
		return '';
	}

	public function getEditUrl() {
		return '';
	}

	public function getAll($where = '1', $order = '') {
		$orderString = '';
		if (strlen($order)) {
			$orderString = "ORDER BY $order";
		}

		$query = "SELECT * FROM $this->table WHERE $where $orderString";
		$items = array();
		$className = get_class($this);

		$db = $this->_getDbAdapter();
		$result = $db->fetchAll($query);

		for ($i = 0; $i < count($result); $i++) {
			$item = new $className();
			$item->setRow($result[$i]);
			$items[] = $item;
		}

		return $items;
	}

	public function query($request = array()) {
		$request['table'] = $this->table;
		$request['primaryKey'] = $this->primaryKey;
		$query = new Papercut_Query($request);
		return $query->getRecords();
	}

	/*
	 * Backwards Compat
	 */

	public function load_post($post) {
		$this->loadPost($post);
	}

	public function load_db($id) {
		$this->loadRow($id);
	}

	public function generateHash() {
		try {
			$this->row->hash = sha1(uniqid(rand(), true));
		}
		catch (Exception $e) {
			echo "tried and failed";
		}
	}

	public function save($doAudit = true) {
		$field = $this->table->getPrimary();
		
		// make sure data is valid
		if (!$this->_validated) {
			$this->validate();
		}
		if ($this->isValidated()) {
			if ($this->row->$field) {
				$this->beforeUpdate();
				$this->row->save();
				$this->afterUpdate();
			}
			else {
				$this->beforeInsert();
				$this->generateHash();
				$this->row->save();
				$this->afterInsert();
			}
			return true;
		}
		else {
			return false;
		}
			
	}

	public function getSetData() {
		$data = array();
		$ignoreArray = array($this->primaryKey);
		$db = $this->_getDbAdapter();

		foreach ($this->row as $key => $value) {
			if (!in_array($key, $ignoreArray)) {
				$data[$key] = $value;
			}
		}
		return $data;
	}

	public function insert($doAudit = true) {
		//Fire the before delete function
		if ($this->beforeInsert() === false) {
			return false;
		}

		//Run the insert Code
		$db = $this->_getDbAdapter();
		$db->insert($this->table, $this->getSetData());
		$this->row[$this->primaryKey] = $db->lastInsertId();

		if ($doAudit) {
			$this->audit('Add');
		}

		//Fire the after insert function
		$this->afterInsert();

		return true;
	}

	public function beforeInsert() {

	}

	public function afterInsert() {
		
	}

	public function update($doAudit = true) {
		//Fire the before delete function
		if ($this->beforeUpdate() === false) {
			return false;
		}

		//Run the update code
		$db = $this->_getDbAdapter();
		$db->update($this->table, $this->getSetData(), "$this->primaryKey = " . $db->quote($this->row[$this->primaryKey]));
		if ($doAudit) {
			$this->audit('Update');
		}

		//Fire the after update function
		$this->afterUpdate();

		return true;
	}

	public function beforeUpdate() {

	}

	public function afterUpdate() {
		
	}

	public function delete($doAudit = true) {
		//Fire the before delete function
		if ($this->beforeDelete() === false) {
			return false;
		}

		$db = $this->_getDbAdapter();
		$db->delete($this->table, "$this->primaryKey = " . $db->quote($this->row[$this->primaryKey]));

		// only unharvest if this item is harvested
		if ($this->harvestOnProcess) {
			$this->unharvest();
		}

		if ($doAudit) {
			$this->audit('Delete');
		}

		//Fire the after delete function
		$this->afterDelete();

		return true;
	}

	public function beforeDelete() {

	}

	public function afterDelete() {
		
	}

	public function validate() {
		$this->errors = array();

		foreach ($this->requiredStringFields as $key => $value) {
			if (isset($this->row[$key])) {
				if (!strlen($this->row[$key])) {
					if (!$this->isExt) {
						$this->errors[] = "$value is required";
					}
					else {
						$this->errors[] = array(
							'id' => $key,
							'msg' => "$value is required"
						);
					}
				}
			}
			else if (isset($this->$key)) {
				if (!strlen($this->$key)) {
					if (!$this->isExt) {
						$this->errors[] = "$value is required";
					}
					else {
						$this->errors[] = array(
							'id' => $key,
							'msg' => "$value is required"
						);
					}
				}
			}
		}
		foreach ($this->requiredNumberFields as $key => $value) {
			if (!$this->row[$key]) {
				if (!$this->isExt) {
					$this->errors[] = "$value is required";
				}
				else {
					$this->errors[] = array(
						'id' => $key,
						'msg' => "$value is required"
					);
				}
			}
		}
		$this->_validated = true;
		return $this->errors;
	}

	public function setFromArray(&$to, $from) {
		foreach ($from as $key => $value) {
			$to[$key] = $value;
		}
	}

	public function getHarvestContent() {
		$str = '';
		foreach ($this->harvestFields as $fieldName => $count) {
			for ($i = 0; $i < $count; $i++) {
				$str .= ' ' . $this->row[$fieldName] . ' ';
			}
		}
		return $str;
	}

	public function getHarvestInfo() {
		$title = '';
		if (isset($this->row['title'])) {
			$title = $this->row['title'];
		}
		return array(
			'title' => $title,
			'content' => $this->getHarvestContent(),
			'oldUrl' => $this->oldPageUrl,
			'newUrl' => $this->getPageUrl(),
			'sticky' => 0
		);
	}

	public function harvest() {
		$harvestInfo = $this->getHarvestInfo();
		$harvester = new Search_Harvester($harvestInfo['title'], $harvestInfo['content'], $harvestInfo['oldUrl'], $harvestInfo['newUrl'], $harvestInfo['sticky']);
		$harvester->harvest();
	}

	public function unharvest() {
		$harvestInfo = $this->getHarvestInfo();
		$harvester = new Search_Harvester($harvestInfo['title'], $harvestInfo['content'], $harvestInfo['oldUrl'], $harvestInfo['newUrl'], $harvestInfo['sticky']);
		$harvester->remove();
	}

	public function audit($description) {
		if (!$this->auditOnProcess) {
			return false;
		}

		if (!$this->keyword) {
			$this->keyword = $this->table;
		}

		$audit = new Audit_Class_Audit();
		$audit->setRow(array(
			'userId' => User_Class_User::getMyId(),
			'keyword' => $this->keyword,
			'description' => $description,
			'dbTable' => $this->table,
			'primaryField' => $this->primaryKey,
			'primaryKey' => $this->row[$this->primaryKey]
		));
		$audit->process(false);
	}

	public function addError($e) {
		if (is_array($e)) {
			for ($i = 0; $i < count($e); $i++) {
				$this->addError($e[$i]);
			}
		}
		else if (is_string($e) && strlen($e)) {
			$this->errors[] = $e;
		}
	}

	public function noErrors() {
		if (count($this->errors)) {
			return 0;
		}
		else {
			return 1;
		}
	}

	public function anyErrors() {
		if (count($this->errors)) {
			return 1;
		}
		else {
			return 0;
		}
	}

	public function isValidated() {
		return ($this->_validated && !count($this->errors));
	}

	public function getSalt() {
		return sha1($this->_salt);
	}

	public function getHash() {
		return sha1($this->_salt . $this->row[$this->primaryKey]);
	}

	public function salt($str) {
		return sha1($this->getSalt() . $str . $this->getSalt());
	}

}