<?php
class Scottandkassi_Model_Rsvp extends Redokes_Model_Model {
	
	public $tableClassName = 'Scottandkassi_Model_Db_Rsvp';
	
	public $requiredStringFields = array(
		'rsvpName' => 'Name',
		'rsvpNumber' => 'Number'
	);
}