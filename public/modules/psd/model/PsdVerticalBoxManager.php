<?php
/**
 * Description of PsdVerticalBoxManager
 *
 * @author wes
 */
class Psd_Class_PsdVerticalBoxManager extends Psd_Class_PsdBoxManager {
	

	public function process($layers) {
		// sort by y value
		usort($layers, 'Psd_Class_PsdImporter::sortByY');

		// loop over each layer item
		$numLayers = count($layers);
		for ($i = 0; $i < $numLayers; $i++) {
			$layer = $layers[$i];
			$foundBox = false;

			// loop through each box and check each box item to know which box
			// to insert this item into
			for ($j = 0; $j < $this->numBoxes && $foundBox === false; $j++) {

				// get psd box object
				$box = $this->boxes[$j];

				// check each box items's y2 value to know if this item is positioned after it
				for ($k = 0; $k < $box->numLayers; $k++) {
					$boxItem = $box->layers[$k];
					if ($layer->y >= $boxItem->y && $layer->y < $boxItem->y2) {
						$foundBox = $j;
						break;
					}
				}
			}

			// if we didn't find a box
			if ($foundBox === false) {
				// make a new box and add the current layer to it
				$box = new Psd_Class_PsdBox();
				$box->addLayers($layer);
				$this->addBoxes($box);
			}
			else {
				// found a box so add this layer to the box
				$this->boxes[$foundBox]->addLayers($layer);
			}
		}
	}

	public function analyze() {
		// loop through each box
		for ($i = 0; $i < $this->numBoxes; $i++) {
			$box = $this->boxes[$i];

			// need to calculate the height of the box based on the box's layers
			$box->x = $box->y = $box->x2 = $box->y2 = $box->width = $box->height = false;

			// loop through layers and set the box's properties
			for ($j = 0; $j < $box->numLayers; $j++) {
				$layer = $box->layers[$j];
				// set the x, y, x2, y2
				if ($box->x === false || $layer->x < $box->x) {
					$box->x = $layer->x;
				}
				if ($box->x2 === false || $layer->x2 > $box->x2) {
					$box->x2 = $layer->x2;
				}
				if ($box->y === false || $layer->y < $box->y) {
					$box->y = $layer->y;
				}
				if ($box->y2 === false || $layer->y2 > $box->y2) {
					$box->y2 = $layer->y2;
				}
			}

			// calculate the width and height based on x2-x and y2-y
			$box->width = $box->x2 - $box->x;
			$box->height = $box->y2 - $box->y;
		}
	}

	public function generateHtml() {
		// only make box divs if there is more than one item
		if ($this->numBoxes == 1 && $this->boxes[0]->numLayers == 1) {
			// we do not need a box wrap
			
		}

		// make html for each box
		$html = '';
		for ($i = 0; $i < $this->numBoxes; $i++) {
			$this->boxes[$i]->domId = 'psd-box-'.Psd_Class_PsdBoxManager::$boxCount++;
			$html .= '<div id="'.$this->boxes[$i]->domId.'" class="psdBoxWrap verticalBoxWrap" _x="'.$this->boxes[$i]->x.'" _y="'.$this->boxes[$i]->y.'"></div>';
		}

		// append to parent
		$this->parentLayer->getElement()->innertext .= $html;
		$this->importer->rebuildDom();
		
		// add each element to it's box
		for ($i = 0; $i < $this->numBoxes; $i++) {
			$box = $this->boxes[$i];
			$html = '';
			for ($j = 0; $j < $box->numLayers; $j++) {
				// get element html
				$html .= $box->layers[$j]->getElement()->outertext;

				// remove element
				$box->layers[$j]->getElement()->outertext = '';
			}

			// update box div with box items
			$this->boxes[$i]->getElement()->innertext = $html;
		}

		$this->importer->rebuildDom();

		// loop through each box
		for ($i = 0; $i < $this->numBoxes; $i++) {
			$box = $this->boxes[$i];

			// calculate the spacing between blocks
			$marginTop = '0';
			$marginBottom = '0';
			$marginLeft = '0';

			// if this is the first item
			if ($i == 0) {
				$marginTop = ($box->y - $this->parentLayer->y) . 'px';
				if ($this->numBoxes >= 2) {
					$marginBottom = ($this->boxes[$i+1]->y - $box->y2) . 'px';
				}
			}
			else if ($i == ($this->numBoxes-1)) {
				// this is the last item
				$marginBottom = ($this->parentLayer->y2 - $box->y2) . 'px';
			}
			else {
				// middle items
				$marginTop = ($box->y - $this->boxes[$i-1]->y2) . 'px';
				$marginBottom = ($this->boxes[$i+1]->y - $box->y2) . 'px';
			}

			$marginLeft = ($box->x - $this->parentLayer->x) . 'px';

			// set the block wrap div styles
			$newStyles = array(
				'height' => $box->height . 'px',
				'position' => 'relative',
				'margin-top' => $marginTop,
				'margin-bottom' => $marginBottom,
				'margin-left' => $marginLeft
			);

			Psd_Class_PsdImporter::setStyles($box->getElement(), $newStyles);
		}
		$this->importer->rebuildDom();
	}

	public function generateLayerHtml() {
		$childrenToBuild = array();
		
		// loop through each box
		for ($i = 0; $i < $this->numBoxes; $i++) {
			$box = $this->boxes[$i];

			if ($box->numLayers > 1) {
				// create a layout manager for this box's items
				$boxManager = false;
				if ($box->layersOverlap()) {
					$boxManager = new Psd_Class_PsdAbsoluteBoxManager($box);
				}
				else {
					$boxManager = new Psd_Class_PsdHorizontalBoxManager($box);
				}
				$boxManager->manage();
			}
			else {
				// loop through each layer of the box to calculate positioning
				$layer = $box->layers[0];
				$newStyles = array(
					'width' => $layer->width . 'px',
					'height' => $layer->height . 'px',
					'position' => 'relative',
					'margin-left' => ($layer->x - $box->x) . 'px',
					'margin-top' => ($layer->y - $box->y) . 'px'
				);

				// if item has children, use image as background
				if (count($layer->layers)) {
					$newStyles['background'] = "transparent url('{$layer->publicPath}') repeat center";
				}
				else {
					// item does not have children
					// set content as an image
					$layer->getElement()->innertext = '<img src="'.$layer->publicPath.'" />';
				}

				Psd_Class_PsdImporter::setStyles($layer->getElement(), $newStyles);

				$childrenToBuild[] = $layer;
			}
		}

		// rebuild dom now that we can access new children
		$this->importer->rebuildDom();

		// loop through all children that need to have html built
		for ($i = 0; $i < count($childrenToBuild); $i++) {
			$childrenToBuild[$i]->buildChildrenHtml();
		}
	}
}