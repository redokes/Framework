<?php

class Scottandkassi_ProcessController extends Redokes_Controller_Ajax {

	public function formAction() {
		$name = $_POST['name'];
		$number = $_POST['number'];
		
		$subject = "Scott and Kassi Wedding RSVP";
		$message = "$name - $number";
		
		$mail = new Zend_Mail();
		$mail->setBodyText($message);
		$mail->setBodyHtml($message);
		$mail->setFrom('somewes@gmail.com', 'Wes Okes');
		$mail->addTo('somewes@gmail.com', 'Wes Okes');
		$mail->setSubject($subject);
		$mail->send();
		
		mail('somewes@gmail.com', $subject, $message);
		
		if ($name && $number) {
			$db = Redokes_Controller_Front::getInstance()->getDbAdapter();
			$rsvp = new Scottandkassi_Model_Rsvp();
			$rsvp->setRow(array(
				'rsvpName' => $name,
				'rsvpNumber' => $number,
				'ts' => time()
			));
			
			if ($rsvp->save()) {
				$this->addMessage('Success');
			}
			else {
				$this->addError('There was an error saving your rsvp');
			}
			
		}
		else {
			$this->addError('Please fill complete both fields');
		}
	}

}