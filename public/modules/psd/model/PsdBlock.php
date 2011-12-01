<?php
/**
 * Contains an array of psd layers that need to be positioned with respect to
 * each other and contains dimension information based on the items
 *
 * @author wes
 */
class Psd_Class_PsdBlock {
    public $parentLayer;
	public $layers = array();
    public $numLayers = 0;
	public $x;
	public $x2;
	public $y;
	public $y2;
	public $width;
	public $height;

	public function __construct($parentLayer) {
		$this->parentLayer = $parentLayer;
		$this->analyze();
		$this->layers = array();
	}

	public function addLayers($layers) {
		if (!is_array($layers)) {
			$layers = array($layers);
		}
		for ($i = 0; $i < count($layers); $i++) {
			$this->layers[] = $layers[$i];
		}
		$this->numLayers = count($this->layers);
		$this->analyze();
	}

	private function analyze() {
		if ($this->parentLayer->isBody) {
			$this->x = $this->y = $this->x2 = $this->y2 = $this->width = $this->height = false;

			// loop through layers and set the block's properties
			for ($i = 0; $i < $this->numLayers; $i++) {
				// set the x, y, x2, y2
				if ($this->x === false || $this->layers[$i]->x < $this->x) {
					$this->x = $this->layers[$i]->x;
				}
				if ($this->x2 === false || $this->layers[$i]->x2 > $this->x2) {
					$this->x2 = $this->layers[$i]->x2;
				}
				if ($this->y === false || $this->layers[$i]->y < $this->y) {
					$this->y = $this->layers[$i]->y;
				}
				if ($this->y2 === false || $this->layers[$i]->y2 > $this->y2) {
					$this->y2 = $this->layers[$i]->y2;
				}
			}

			// calculate the width and height based on x2-x and y2-y
			$this->width = $this->x2 - $this->x;
			$this->height = $this->y2 - $this->y;
		}
		else {
			// set the values to the items parent containers values
			$this->x = $this->parentLayer->x;
			$this->y = $this->parentLayer->y;
			$this->x2 = $this->parentLayer->x2;
			$this->y2 = $this->parentLayer->y2;
			$this->width = $this->parentLayer->width;
			$this->height = $this->parentLayer->height;
		}
	}
}