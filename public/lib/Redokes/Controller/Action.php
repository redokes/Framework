<?php

class Redokes_Controller_Action {

	/**
	 * @var Redokes_Controller_Front
	 */
	public $frontController;

	/**
	 * @var string
	 */
	public $action;
	
	/**
	 * @var Redokes_View_Template
	 */
	public $view = false;

	/**
	 * @var bool
	 */
	public $doRender = true;
	
	public $viewPath = false;

	public function __construct($frontController, $action = 'indexAction'){
		$this->frontController = $frontController;
		$this->init();
		$this->action = $action;
		ob_start();
		if (method_exists($this, $this->action)) {
			
			// Run the action
			$this->$action();
			
			// If the action did not set a view path, auto set the view path
			if (!$this->viewPath) {
				$this->setView();
			}
			
			// Render the view if a view file exists
			if (file_exists($this->viewPath)) {
				ob_start();
				include($this->viewPath);
				$this->getView()->setValues(array(
					'body' => ob_get_clean()
				));
				$this->getView()->render();
				$this->getView()->setValues(array(
					'body' => ''
				));
			}
		}
		else if($this->action){
			
			$this->_catch();
		}
		$contents = ob_get_clean();
		
		$this->getView()->setValues(array(
			'body' => $contents
		), true);
		
		// rename send headers to something like output content or send output
		$this->sendHeaders();
	}
	
	public function setView($action = false, $controller = false, $module = false) {
		if (is_file($action)) {
			$this->viewPath = $action;
		}
		else {
			// auto set the body to the view if it exists
			if (!$action) {
				$action = $this->frontController->action;
			}
			if (!$controller) {
				$controller = $this->frontController->controller;
			}
			if (!$module) {
				$module = $this->frontController->module;
			}
			
			$this->viewPath = MODULE_PATH . "$module/view/$controller/$action.php";
		}
	}
	
	public function init() {}

	public function sendHeaders() {
		if ($this->doRender) {
			echo $this->getView()->render();
		}
	}

	// maybe call this showOutput instead of doRender
	public function setRender($doRender = true) {
		$this->doRender = $doRender;
	}

	/**
     * Return an blank html view and create it if it doesn't exist
     * @return Redokes_View_Html
     */
	public function getView() {
		if (!$this->view) {
			$this->view = new Redokes_View_Html();
		}
		return $this->view;
	}

	/**
	 * Catches a call to an undefined action
	 */
	public function _catch(){
		echo "catch in main action controller";
		die();
		return;
		$this->frontController->displayError("caught $this->action default will be to throw error");
	}

	public function _forward($module, $controller, $action){
		echo "forward in main action controller";
		die();
		return;
		$this->frontController->module = $module;
		$this->frontController->controller = $controller;
		$this->frontController->action = $action;
		$this->frontController->run();
	}

}