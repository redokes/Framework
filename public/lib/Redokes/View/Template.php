<?php

class Redokes_View_Template {

	public $html = '';
	public $values = array();

	public function  __construct($values = array()) {
		$this->setValues($values);
	}

	public function setHtml($html) {
		$this->html = $html;
	}

	/**
     * Sets template variables from an array
	 * @param array $values key => value sets of template variables
	 * @param boolean $append if true, all string data passed in $values will append instead of overwrite
     * @return Redokes_View_Template
     */
	public function setValues($values = array(), $append = false) {
		if ($append) {
			foreach ($values as $key => $value) {
				if (isset($this->values[$key]) && is_string($this->values[$key])) {
					$this->values[$key] .= $value;
				}
				else {
					$this->values[$key] = $value;
				}
			}
		}
		else {
			$this->values = array_merge($this->values, $values);
		}
		return $this;
	}

	public function render() {
		$this->process();
		$this->replace();
		return $this->html;
	}

	public function process() {
		ob_start();
		eval('?>' . $this->html . '<?');
		$this->html = ob_get_clean();
	}

	public function replace() {
		foreach ($this->values as $key => $value) {
			$this->html = str_replace('{' . $key . '}', $value, $this->html);
		}
	}

}