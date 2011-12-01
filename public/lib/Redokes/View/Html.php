<?php

class Redokes_View_Html extends Redokes_View_Template {
	public $html = '<!DOCTYPE html><html><head><title>{title}</title>{head}</head><body>{body}</body></html>';
	public $values = array(
		'title' => '',
		'head' => '',
		'body' => ''
	);

	public $cssFiles = array();
	public $jsFiles = array();

	public $useMinify = false;

	public function render() {
		$numCssFiles = count($this->cssFiles);
		if ($this->useMinify) {

		}
		else {
			for ($i = 0; $i < $numCssFiles; $i++) {
				$link = new Redokes_View_Link(array(
					'href' => $this->cssFiles[$i]
				));
				$this->values['head'] .= $link->render();
			}
		}

		$numJsFiles = count($this->jsFiles);
		if ($this->useMinify) {

		}
		else {
			for ($i = 0; $i < $numJsFiles; $i++) {
				$js = new Redokes_View_Js(array(
					'src' => $this->jsFiles[$i]
				));
				$this->values['head'] .= $js->render();
			}
		}
		return parent::render();
	}

	/**
     * Adds css file to html template
	 * @param string $url public path to css file
     * @return Redokes_View_Html
     */
	public function addCss($url) {
		if (!is_array($url)) {
			$url = array($url);
		}
		$numUrls = count($url);
		for ($i = 0; $i < $numUrls; $i++) {
			$this->cssFiles[] = $url[$i];
		}
		return $this;
	}

	/**
     * Adds js file to html template
	 * @param string $url public path to js file
     * @return Redokes_View_Html
     */
	public function addJs($url) {
		if (!is_array($url)) {
			$url = array($url);
		}
		$numUrls = count($url);
		for ($i = 0; $i < $numUrls; $i++) {
			$this->jsFiles[] = $url[$i];
		}
		return $this;
	}
}