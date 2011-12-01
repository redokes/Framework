<?php
/**
 * Contains an array of psd layers that need to be positioned with respect to
 * each other and contains dimension information based on the items
 *
 * @author wes
 */
class Psd_Class_PsdBox {
	public $layers = array();
    public $numLayers = 0;
	public $parentLayer;
	public $parentBox;
	public $x;
	public $x2;
	public $y;
	public $y2;
	public $width;
	public $height;
	public $domId;
	public $importer;

	public function __construct() {
		$this->layers = array();
	}

	public function addLayers($layers) {
		if (!is_array($layers)) {
			$layers = array($layers);
		}
		for ($i = 0; $i < count($layers); $i++) {
			$this->layers[] = $layers[$i];
		}
		$this->importer = $this->layers[0]->importer;
		$this->parentLayer = $this->layers[0]->parentLayer;
		$this->layers[0]->parentBox = $this;
		$this->numLayers = count($this->layers);
	}

	public function getElement() {
		return $this->importer->getDom()->getElementById($this->domId);
	}

	public function layersOverlap() {
		for ($i = 0; $i < $this->numLayers; $i++) {
			$layer = $this->layers[$i];
			for ($j = $i; $j < $this->numLayers; $j++) {
				if ($i != $j) {
					// check if coords overlap
					$layer2 = $this->layers[$j];

					// check x overlap
					if (($layer->x >= $layer2->x && $layer->x < $layer2->x2) || ($layer2->x >= $layer->x && $layer2->x < $layer->x2)) {
						// check y overlap
						if (($layer->y >= $layer2->y && $layer->y < $layer2->y2) || ($layer2->y >= $layer->y && $layer2->y < $layer->y2)) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}
}