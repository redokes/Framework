<?php
/**
 * Description of PsdBoxManager
 *
 * @author wes
 */
class Psd_Class_PsdBoxManager {
    public static $boxCount = 0;
	
	public $parentLayer;
	public $boxes = array();
	public $layers = array();
    public $numBoxes = 0;
	public $importer;
	public $html;

	public function __construct($layer) {
		if ($layer) {
			$this->setLayer($layer);
		}
	}

	public function setLayer($layer) {
		$this->parentLayer = $layer;
		$this->importer = $layer->importer;
		$this->importer->boxManagers[] = $this;
		$this->process($this->parentLayer->layers);
		$this->analyze();
	}

	public function manage() {
		$this->generateHtml();
		$this->generateLayerHtml();
	}

	public function process($layers = false) {
		
	}

	public function analyze() {

	}

	public function generateHtml() {
		
	}

	public function generateLayerHtml() {
		
	}

	public function addBoxes($boxes) {
		if (!is_array($boxes)) {
			$boxes = array($boxes);
		}
		for ($i = 0; $i < count($boxes); $i++) {
			$this->boxes[] = $boxes[$i];
			$boxes[$i]->parentBox = $this->parentLayer;
		}
		$this->numBoxes = count($this->boxes);
	}

	public function needsBoxLayout() {
		// check if any of the boxes have more than one item
		for ($i = 0;  $i < $this->numBoxes; $i++) {
			if ($this->boxes[$i]->numLayers > 1) {
				return true;
			}
		}
		return false;
	}
}