<?php

class Redokes_Config_Config {
	
	public $title = false;
	public $defaultConfig = array();
	public $config = false;
	
	public function setConfig($config) {
		if ($this->config === false) {
			$this->getConfig();
		}
		$this->config = array_merge($this->config, $config);
		$path = $this->getCachePath();
		$contents = $this->wrap(json_encode($this->config));
		file_put_contents($path, $contents);
	}
	
	public function getConfig() {
		if ($this->config === false) {
			
			// Read config from saved file
			$path = $this->getCachePath();
			if (is_file($path)) {
				$contents = $this->unwrap(file_get_contents($path));
				$this->config = json_decode($contents, true);
			}
			else {
				$this->config = array();
			}
			
			$this->config = array_merge($this->defaultConfig, $this->config);
		}
		
		return $this->config;
	}
	
	public function restoreDefault() {
		$this->setConfig($this->defaultConfig);
	}

	public function wrap($str) {
		return '<?php //' . $str;
	}
	
	public function unwrap($str) {
		return str_replace('<?php //', '', $str);
	}
	
	public function getCachePath() {
		return CACHE_PATH . 'config-' . md5($this->title) . '.php';
	}

}