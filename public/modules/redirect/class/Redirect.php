<?php
class Redirect_Class_Redirect extends Redokes_Model_Model {
	public $table = 'redirect';
	public $accessName = 'Redirect';
	public $primaryKey = 'redirectId';
	public $row = array(
		'redirectId' => 0,
		'requestString' => '',
		'redirectUrl' => ''
	);
	
	public $requiredStringFields = array(
		'requestString' => 'Request String',
		'redirectUrl' => 'Redirect URL'
	);
}