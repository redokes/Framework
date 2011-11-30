<?php

class Log_Entry {
	
	public $title = '';
	public $message = '';
	public $ts;
	public $type;
	public $module;
	
	public function __construct($title = '', $message = '', $type = 'info', $module = 'Application') {
		$this->ts = $_SERVER['REQUEST_TIME'];
		$this->title = $title;
		$this->message = $message;
		$this->type = $type;
		$this->module = $module;
		return $this;
	}
	
	public function set($key, $value = ""){
		if(is_string($key) && property_exists($this, $key)){
			$this->$key = $value;
		}
		if(is_array($key)){
			foreach ($key as $dataKey => $value){
				$this->set($dataKey, $value);
			}
		}
	}
	
	public static function getLog($value){
		if(!is_string($value)){
			ob_start();
			krumo($value);
			$value = ob_get_clean();
		}
		else{
			$value = self::toHtml($value);
		}
		return $value;
	}
	
	public function log() {
		$this->message = $this->getLog($this->message);
		error_log('JSON:' . json_encode($this->toArray()));
	}
	
	public function toArray(){
		$returnArray = array();
		$reflection = new ReflectionClass($this);
		$properties = $reflection->getProperties();
		foreach ($properties as $property){
			$name = $property->getName();
			$returnArray[$name] = $this->$name;
		}
		return $returnArray;
	}
	
	public static function toHtml($message) {
		//$message = preg_replace('/[\n]/', '<br />', $message);
		//$message = preg_replace('/  /', '&nbsp;&nbsp;', $message);
		return "<div>$message</div>";
	}
}