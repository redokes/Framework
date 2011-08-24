<?php
class User_Model_User extends Redokes_Model_Model {
	
	public $tableClassName = 'User_Model_Db_User';
	
	public $requiredStringFields = array(
		'email' => 'Email'
	);
	
}