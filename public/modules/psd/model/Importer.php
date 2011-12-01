<?php
class Psd_Model_Importer {
	public $file;
	public $im;
	public $saveDir;
	public $layers;
	public $boxManagers = array();
	public $numLayers;
	public $bgColor;
	public $leftBoundary;
	public $rightBoundary;
	public $dom = false;
	public $layoutType;
	public $cssRules = array();
	public $psdTemplate;
	
	/**
	 *
	 * @param Psd_Model_Template $psdTemplate 
	 */
	public function  __construct($psdTemplate) {
		$this->psdTemplate = $psdTemplate;
		$this->saveDir = $psdTemplate->getPrivateDir();
		$this->setFile($psdTemplate->getPsdPath());
		//$this->layoutType = $layoutType;
	}

	public function setFile($file) {
		$this->file = false;
		if (is_file($file)) {
			$this->file = $file;
			$this->im = new Imagick($this->file);
			$this->im->setImageFormat('png');
			$this->layers = array();
			$this->numLayers = $this->im->getNumberImages();
		}
	}

	public function getDom() {
		return $this->dom;
	}

	public function rebuildDom() {
		$this->dom = new Redokes_Dom_SimpleHtmlDom($this->dom->save());
	}

	public function toHtml() {
		$this->buildDom();
		$this->extract();
		$this->setBgColor();
		$this->findContainers();
		$this->findBoundaries();
		$this->setParents();
		$this->buildHtml();
		$this->adjustLayout();
		$this->moveStyleToCss();
	}

	private function extract() {
		// save the screenshot
		$this->im->setIteratorIndex(0);
		$this->im->writeImage($this->saveDir . 'thumb.png');

		// loop through each layer
		for($i = 1; $i < $this->numLayers; $i++){

			// set next with iterator
			$this->im->setIteratorIndex($i);
			
			$properties = $this->im->getImagePage();

			$label = $this->im->getImageProperty('label');
			$fileName = Redokes_Util::getSlug($label) . '.png';
			$filePrivatePath = $this->saveDir . 'img/' . $fileName;
			$filePublicPath = 'img/' . $fileName;

			$properties['label'] = $label;
			$properties['fileName'] = $fileName;
			$properties['filePrivatePath'] = $filePrivatePath;
			$properties['filePublicPath'] = $filePublicPath;
			
			$this->im->writeImage($filePrivatePath);
			$layer = new Psd_Model_Layer($properties);

			// set the layer index as the count before adding to the layer array
			$layer->importer = $this;
			$layer->setId(count($this->layers));
			$this->layers[] = $layer;
		}
		
		// count the layers array of this object instead of the image magick object
		$this->numLayers = count($this->layers);
	}

	private function setBgColor() {
		// get bg color
		$this->im->setIteratorIndex(1);
		$pixel = $this->im->getImagePixelColor(0, $this->layers[0]->height-1);
		$colorInfo = $pixel->getColor();
		$colorInfo['r'] = dechex($colorInfo['r']);
		$colorInfo['g'] = dechex($colorInfo['g']);
		$colorInfo['b'] = dechex($colorInfo['b']);
		if (strlen($colorInfo['r']) == 1) {
			$colorInfo['r'] = '0' . $colorInfo['r'];
		}
		if (strlen($colorInfo['g']) == 1) {
			$colorInfo['g'] = '0' . $colorInfo['g'];
		}
		if (strlen($colorInfo['b']) == 1) {
			$colorInfo['b'] = '0' . $colorInfo['b'];
		}

		$this->bgColor = $colorInfo['r'] . $colorInfo['g'] . $colorInfo['b'];
		$this->layers[0]->bgColor = $this->bgColor;
	}

	private function findContainers() {
		// loop through each image backwards to find the closest parent container
		for ($i = count($this->layers) - 1; $i >= 0; $i--) {
			$parentIndex = 0;

			// loop backwards through items down to this item and check if it is inside
			for ($j = $i-1; $j >= 0; $j--) {

				// check if the x,y of the inner loop item is in the outer loop item's bounding box
				if ($i != $j && $this->layers[$i]->x >= $this->layers[$j]->x && $this->layers[$i]->y >= $this->layers[$j]->y && $this->layers[$i]->x + $this->layers[$i]->width <= $this->layers[$j]->x + $this->layers[$j]->width && $this->layers[$i]->y + $this->layers[$i]->height <= $this->layers[$j]->y + $this->layers[$j]->height) {
					$parentIndex = $j;
					break;
				}
			}

			// if there is a parent add it to the parent's item array
			if ($parentIndex) {
				$this->layers[$parentIndex]->layers[] = $this->layers[$i];
			}
			else if ($i) {
				// did not find a parent so add to the top layer if not the first item
				$this->layers[$parentIndex]->layers[] = $this->layers[$i];
			}
		}
	}

	private function getBoundaryWidth() {
		return ($this->rightBoundary - $this->leftBoundary);
	}

	private function findBoundaries() {
		// find left boundary by getting the first item not at 0
		$sortedLayers = $this->layers;
		usort($sortedLayers, 'Psd_Model_Importer::sortByX');
		$leftBoundary = 0;
		for ($i = 0; $i < count($sortedLayers); $i++) {
			if ($sortedLayers[$i]->x) {
				$leftBoundary = $sortedLayers[$i]->x;
				break;
			}
		}

		// find right boundary by getting the first item less than full width
		usort($sortedLayers, 'Psd_Model_Importer::sortByX2');
		$rightBoundary = 0;
		for ($i = count($sortedLayers)-1; $i >= 0; $i--) {
			if ($sortedLayers[$i]->x2 < $this->layers[0]->width) {
				$rightBoundary = $sortedLayers[$i]->x2;
				break;
			}
		}

		$this->leftBoundary = $leftBoundary;
		$this->rightBoundary = $rightBoundary;

		// add a css rule for the boundary div
		$styles = array(
			'margin' => '0 auto',
			'width' => $this->getBoundaryWidth() . 'px'
		);
		$css = self::arrayToCss($styles);
		$this->addCssRule('.contentWrap', $css);
	}

	private function addCssRule($rule, $css) {
		if (is_array($css)) {
			$css = self::arrayToCss($css);
		}
		$this->cssRules[] = $rule . '{' . $css . '}';
	}

	public static function cssToArray($str) {
		$styleArray = array();
		if (is_string($str)) {
			$styles = explode(';', $str);
			$numStyles = count($styles);
			for ($i = 0; $i < $numStyles; $i++) {
				// find first ':' character
				$firstColon = strpos($styles[$i], ':');
				if ($firstColon !== false) {
					$property = substr($styles[$i], 0, $firstColon);
					$value = substr($styles[$i], $firstColon + 1);
					$styleArray[$property] = $value;
				}
			}
		}
		return $styleArray;
	}

	public static function arrayToCss($array) {
		$css = '';
		foreach ($array as $property => $value) {
			$css .= $property . ':' . $value . ';';
		}
		return $css;
	}

	private function setParents() {
		// set the background layer as no parent boolean false
		$this->layers[0]->parentIndex = false;
		$this->layers[0]->isFullWidth = true;

		// loop through each layer to look at child items
		for ($i = 0; $i < $this->numLayers; $i++) {
			$layer = $this->layers[$i];

			// keep track of whether or not the children are inside the page bounds
			$wrapChildren = false;

			// loop through child items to set their parent index as the outer loop item
			$numChildren = count($layer->layers);
			for ($j = 0; $j < $numChildren; $j++) {
				$childLayer = $layer->layers[$j];
				$childLayer->parentIndex = $i;
				$childLayer->parentLayer = $layer;

				// check if the children are full width
				if ($childLayer->width == $layer->width) {
					$childLayer->isFullWidth = true;
				}
			}

			$layer->wrapChildren = $wrapChildren;
		}
	}

	private function buildHtml() {
		$this->dom->find('body', 0)->innertext = $this->layers[0]->createElement();
		$this->dom = new Redokes_Dom_SimpleHtmlDom($this->dom->save());
		$this->layers[0]->buildHtml();
	}

	private function buildDom() {
		$this->dom = new Redokes_Dom_SimpleHtmlDom('<html><head></head><body></body></html>');
		
		// set defaults on html and body
		$styles = array(
			'margin' => 0,
			'padding' => 0,
			'min-height' => '100%'
		);
		self::setStyles($this->dom->find('html', 0), $styles, true);
		self::setStyles($this->dom->find('body', 0), $styles, true);

		// add some css rules
		$css = array(
			'clear' => 'both',
			'height' => '1px',
			'font-size' => '1px',
			'overflow' => 'hidden'
		);
		$this->addCssRule('.clear', $css);
	}

	private function moveStyleToCss() {
		// get the html and body elements
		$html = $this->dom->find('html', 0);
		$body = $this->dom->find('body', 0);
		$this->addCssRule('html', $html->style);
		$this->addCssRule('body', $body->style);
		$html->style = '';
		$body->style = '';
		
		// loop through every page element and move the style attribute
		// to this object's css rules
		$elements = $this->dom->find('div');
		for ($i = 0; $i < count($elements); $i++) {
			$element = $elements[$i];
			if ($element->style && $element->id) {
				$this->addCssRule('#' . $element->id, $element->style);
				$element->style = '';
			}
		}

		// loop through css rules and replace background references to be ../img
		$numCssRules = count($this->cssRules);
		for ($i = 0; $i < $numCssRules; $i++) {
			$this->cssRules[$i] = str_replace('url(\'img/', 'url(\'../img/', $this->cssRules[$i]);
		}

		// write out css rules to a stylesheet
		$this->psdTemplate->createCssFile(implode(' ', $this->cssRules));

		// link to stylesheet
		$this->dom->find('head', 0)->innertext .= '<link rel="stylesheet" type="text/css" href="'.$this->psdTemplate->getPublicCssPath().'" />';

		// remove all style=""
		$html = $this->dom->save();
		$html = str_replace('style=""', '', $html);
		$this->dom = new Redokes_Dom_SimpleHtmlDom($html);
	}

	public function getHtml() {
		if ($this->dom) {
			return $this->dom->save();
		}
	}

	public function adjustLayout() {
		// get the boundary width
		$boundaryWidth = $this->getBoundaryWidth();

		// attempt to determine which divs should have auto margins
		// loop through box managers to find vertical boxes
		for ($i = 0; $i < count($this->boxManagers); $i++) {
			$boxManager = $this->boxManagers[$i];

			// loop through this manager's boxes
			for ($j = 0; $j < $boxManager->numBoxes; $j++) {
				$box = $boxManager->boxes[$j];
				$pos = strpos($box->getElement()->class, 'vertical');
				if ($pos !== false) {
					//echo $box->domId . ' = ' . $box->width . ' of parent ' . $box->parentLayer->domId . ' = ' . $box->parentLayer->width . ' '  . '<br>';
					// get the styles of the box div
					$styles = self::getStyles($box->getElement());
					$parentStyles = self::getStyles($box->getElement()->parent());
					$parentWidth = 0;
					if (isset($parentStyles['width'])) {
						$parentWidth = intval($parentStyles['width']);
					}

					// if the box's parent width is the same as the background width
					if ($box->parentLayer->width == $this->layers[0]->width) {

						// if the box's width is <= the page boundary width
						if ($box->width <= $boundaryWidth) {

							// check if this box's parent already has a width set. if so, then we don't need to center this
							if ($parentWidth == $this->layers[0]->width || $parentWidth == $boundaryWidth || !$parentWidth) {
								// set a width and auto margins to center this box
								$paddingLeft = (1 * ($box->x - $this->leftBoundary));
								$width = $boundaryWidth - $paddingLeft;
								$newStyles = array(
									'margin-left' => 'auto',
									'margin-right' => 'auto',
									'width' => $width . 'px',
									'padding-left' =>  $paddingLeft . 'px'
								);
								//echo "center " . $box->domId . '<br>';
								//echo "should we center " . $box->x . ' of ' . $this->leftBoundary . '<br>';
								self::setStyles($box->getElement(), $newStyles);
							}
						}
					}
				}
			}
		}
		
		// add in a fake 0 height div above boxes that have a top margin if they are the first element
		// need to loop backwards otherwise we have to rebuild the dom and find the elements after every
		// dom modification
		$this->addCssRule('.boxSpace', 'height:0px;overflow:hidden;');
		$elements = $this->dom->find('div[class=psdBoxWrap]');
		$numElements = count($elements);
		for ($i = $numElements - 1; $i >= 0; $i--) {
			$element = $elements[$i];
			if ($element->prev_sibling() == null) {
				// get the css styles
				$styles = self::getStyles($element);
				if (isset($styles['margin-top'])) {
					$marginTop = intval($styles['margin-top']);
					if ($marginTop) {
						// add fake div
						$element->outertext = '<div class="boxSpace">&nbsp;</div>' . $element->outertext;
					}
				}
			}
		}

		// detect which items should not have a width or height set
		// go through every item recursively so we end up adjusting the deepest
		// layers first and going backwards up to the body
		$this->adjustWidth($this->getBody());

		// rebuild the dom for the next step
		$this->rebuildDom();

		return;
		
		$elements = $this->dom->find('div');
		$numElements = count($elements);
		for ($i = 0; $i < $numElements; $i++) {
			$element = $elements[$i];
			$elementStyles = self::getStyles($element);
			$parentStyles = self::getStyles($element->parent());
			show_array($elementStyles);
			show_array($parentStyles);
		}
	}

	public function adjustWidth($element) {
		// get children of the node
		$children = $element->children();
		$numChildren = count($children);
		if ($numChildren) {

			// loop through children and adjust them first
			for ($i = 0; $i < $numChildren; $i++) {
				$this->adjustWidth($children[$i]);
			}

			// compare the node's width to the parent width
			$elementStyles = self::getStyles($element);
			$parentStyles = self::getStyles($element->parent());
			
			if (isset($elementStyles['width']) && isset($parentStyles['width'])) {
				// check if the element's width is the same as the parent's width
				if ($elementStyles['width'] == $parentStyles['width']) {
					
				}
			}
			else if (isset($elementStyles['width'])) {
				// check if the element's width is the full page width
				if ($elementStyles['width'] == $this->layers[0]->width . 'px') {
					// if absolute position,  set 100%, otherwise remove width
					$newStyles = array('width' => 'auto');
					if (isset($elementStyles['position']) && $elementStyles['position'] == 'absolute') {
						$newStyles['width'] = '100%';
					}
					self::setStyles($element, $newStyles);
				}
			}
		}
	}

	public function getBody() {
		return $this->getDom()->find('body', 0);
	}

	public static function getStyles($node) {
		$styleArray = self::cssToArray($node->style);
		return $styleArray;
	}

	public static function setStyles($node, $newStyles, $clearStyles = false) {
		$currentStyles = array();

		// if we are keeping the current styles, get them
		if (!$clearStyles) {
			$currentStyles = self::getStyles($node);
		}

		$currentStyles = array_merge($currentStyles, $newStyles);
		$node->style = self::arrayToCss($currentStyles);
	}

	public static function sortByX($a, $b) {
		if ($a->x == $b->x) {
			return 0;
		}
		return ($a->x < $b->x) ? -1 : 1;
	}
	
	public static function sortByY($a, $b) {
		if ($a->y == $b->y) {
			return 0;
		}
		return ($a->y < $b->y) ? -1 : 1;
	}

	public static function sortByX2($a, $b) {
		if ($a->x2 == $b->x2) {
			return 0;
		}
		return ($a->x2 < $b->x2) ? -1 : 1;
	}

	public static function sortByLayerIndex($a, $b) {
		if ($a->layerIndex == $b->layerIndex) {
			return 0;
		}
		return ($a->layerIndex < $b->layerIndex) ? -1 : 1;
	}
}