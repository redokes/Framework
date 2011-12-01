<?php

class Psd_Class_PsdLayer {
	public $label;
	public $x;
	public $x2;
	public $y;
	public $y2;
	public $width;
	public $height;
	public $privatePath;
	public $publicPath;
	public $layers = array();
	public $parentIndex;
	public $parentLayer;
	public $parentBox;
	public $layerIndex;
	public $isFullWidth = false;
	public $domId = false;
	public $importer;
	public $div;
	public $wrapChildren = false;
	public $isBody = false;
	public $bgColor;

	public function  __construct($properties) {
		$label = $properties['label'];
		$this->label = $label;
		$this->x = $properties['x'];
		$this->x2 = $properties['x'] + $properties['width'];
		$this->y = $properties['y'];
		$this->y2 = $properties['y'] + $properties['height'];
		$this->width = $properties['width'];
		$this->height = $properties['height'];
		$this->privatePath = $properties['filePrivatePath'];
		$this->publicPath = $properties['filePublicPath'];
		$this->layers = array();
	}

	public function setId($id) {
		$this->layerIndex = $id;
		$this->domId = 'psd-gen-' . $id;
	}

	public function getElement() {
		return $this->importer->getDom()->getElementById($this->domId);
	}

	public function createElement() {
		$html = $this->createChildElements();
		if ($this->parentIndex === false) {
			$this->isBody = true;
			$this->importer->getDom()->find('body', 0)->id = $this->domId;
		}
		else {
			$safeLabel = htmlentities($this->label);
			$html = '<div id="'.$this->domId.'" _label="'.$safeLabel.'" class="boxLayer" _x="'.$this->x.'" _y="'.$this->y.'">' . $html . '</div>';
		}
		return $html;
	}

	public function createChildElements() {
		$html = '';
		for ($i = 0; $i < count($this->layers); $i++) {
			$html .= $this->layers[$i]->createElement();
		}
		return $html;
	}

	public function buildHtml() {

		if ($this->isBody) {
			// set the background properties
			$style = array(
				'background' => "#{$this->bgColor} url('{$this->publicPath}')"
			);
			Psd_Class_PsdImporter::setStyles($this->getElement(), $style);

			$this->buildChildrenHtml();
		}
		else {
			return;
			$newStyles = array(
				'width' => $this->width . 'px',
				'height' => $this->height . 'px',
				'position' => 'relative',
				'margin' => ($this->y - $this->parentLayer->y) . 'px 0 0 ' . ($this->x - $this->parentLayer->x) . 'px'
			);

			// if item has children, use image as background
			if (count($this->layers)) {
				$newStyles['background'] = "transparent url('{$this->publicPath}') repeat center";
			}
			else {
				// item does not have children
				// set content as an image
				$this->getElement()->innertext = '<img src="'.$this->publicPath.'" />';
			}

			// apply the styles to the div
			Psd_Class_PsdImporter::setStyles($this->getElement(), $newStyles);

			// update the parent html
			$this->parentLayer->getElement()->innertext .= $this->getElement()->outertext;

			// remove element
			$this->getElement()->outertext = '';

			// rebuild dom
			$this->importer->rebuildDom();

			$this->buildChildrenHtml();
		}
	}

	public function buildChildrenHtml() {
		if (count($this->layers)) {
			$boxManager = new Psd_Class_PsdVerticalBoxManager($this);
			if (true || $boxManager->needsBoxLayout()) {
				$boxManager->manage();
			}
			else {
				for ($i = 0; $i < count($this->layers); $i++) {
					$this->layers[$i]->setStyles();
				}
			}
		}
	}

	public function setStyles() {
		$newStyles = array(
			'width' => $this->width . 'px',
			'height' => $this->height . 'px',
			'position' => 'relative',
			'margin' => ($this->y - $this->parentLayer->y) . 'px 0 0 ' . ($this->x - $this->parentLayer->x) . 'px'
		);

		// if item has children, use image as background
		if (count($this->layers)) {
			$newStyles['background'] = "transparent url('{$this->publicPath}') no-repeat";
		}
		else {
			// item does not have children
			// set content as an image
			$this->getElement()->innertext = '<img src="'.$this->publicPath.'" />';
		}

		// apply the styles to the div
		Psd_Class_PsdImporter::setStyles($this->getElement(), $newStyles);

		$this->buildChildrenHtml();
	}
}