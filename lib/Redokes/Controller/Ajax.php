<?php

class Redokes_Controller_Ajax extends Redokes_Controller_Action {

	private $_returnCode = array();
	private $_errors = array();
	private $_messages = array();
	private $_redirect = '';
	private $_sendPlainText = false;

//	public function __construct($frontController, $action = 'index') {
//		parent::__construct($frontController, $action);
//		$this->frontController->setNoRender();
//		$this->frontController->useAjaxTemplate();
//		$this->sendHeaders();
//	}

	public function sendPlainText() {
		$this->_sendPlainText = true;
	}

	public function setRedirect($redirect) {
		$this->_redirect = $redirect;
	}

	public function paramExists($key) {
		return isset($this->_returnCode[$key]);
	}

	public function setParam($key, $value = '') {
		$this->_returnCode[$key] = $value;
	}

	public function pushParam($key, $value) {
		$this->_returnCode[$key][] = $value;
	}

	public function addError($error) {
		if (is_array($error)) {
			$this->_errors = array_merge($this->_errors, $error);
		}
		else if (strlen($error)) {
			$this->_errors[] = $error;
		}
	}

	public function addMessage($message) {
		if (is_array($message)) {
			$this->_messages = array_merge($this->_messages, $message);
		}
		else if (strlen($message)) {
			$this->_messages[] = $message;
		}
	}

	public function getReturnCode() {
		return $this->_returnCode;
	}

	public function anyErrors() {
		if (count($this->_errors)) {
			return 1;
		}
		else {
			return 0;
		}
	}

	public function sendHeaders() {
		if (count($this->_errors)) {
			$this->_returnCode['success'] = false;
		}
		else {
			$this->_returnCode['success'] = true;
		}

		$this->_returnCode['errors'] = $this->_errors;
		$this->_returnCode['msg'] = $this->_messages;;
		$this->_returnCode['redirect'] = $this->_redirect;

		if (!headers_sent()) {
			if ($this->_sendPlainText) {
				echo $this->getView()->values['body'];
			}
			else {
				header('Content-type: application/json');
				echo json_encode($this->_returnCode);
			}
		}
	}

	public function setReturnCode($value) {
		$this->_returnCode = $value;
	}

	public function getErrors() {
		return $this->_errors;
	}

	public function sendTextHeaders() {
		if (count($this->_errors)) {
			$this->_returnCode['good'] = false;
		}
		else {
			$this->_returnCode['good'] = true;
		}

		//Add in "success" param for ext forms
		$this->_returnCode['success'] = $this->_returnCode['good'];

		$this->_returnCode['errors'] = array_to_ul($this->_errors);
		$this->_returnCode['_errors'] = $this->_errors;
		$this->_returnCode['messages'] = array_to_ul($this->_messages);
		$this->_returnCode['redirect'] = $this->_redirect;

		//Add in "msg" param for ext forms
		$this->_returnCode['msg'] = $this->_returnCode['messages'];

		echo json_encode($this->_returnCode);
	}

}