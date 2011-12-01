<?php
/**
 * Description of PsdAbsoluteBoxManager
 *
 * @author wes
 */
class Psd_Model_AbsoluteBoxManager extends Psd_Model_BoxManager {

	public function process($layers) {
		// sort by original layer index
		usort($layers, 'Psd_Model_Importer::sortByLayerIndex');
		
		// loop over each layer item
		$numLayers = count($layers);
		for ($i = 0; $i < $numLayers; $i++) {
			$layer = $layers[$i];
			
			// make one box for all items since it is absolutely positioned stuff
			if ($this->numBoxes) {
				$this->boxes[0]->addLayers($layer);
			}
			else {
				$box = new Psd_Model_Box();
				$box->addLayers($layer);
				$this->addBoxes($box);
			}
		}
	}

	public function analyze() {
		// loop through each box (only one box on absolute box managers)
		for ($i = 0; $i < $this->numBoxes; $i++) {
			$box = $this->boxes[$i];
			$box->x = $this->parentLayer->x;
			$box->x2 = $this->parentLayer->x2;
			$box->y = $this->parentLayer->y;
			$box->y2 = $this->parentLayer->y2;
			$box->width = $this->parentLayer->width;
			$box->height = $this->parentLayer->height;
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
			$this->boxes[$i]->domId = 'psd-box-'.Psd_Model_BoxManager::$boxCount++;
			$html .= '<div id="'.$this->boxes[$i]->domId.'" class="psdBoxWrap absoluteBoxWrap" _x="'.$this->boxes[$i]->x.'" _y="'.$this->boxes[$i]->y.'"></div>';
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

			$newStyles = array(
				'height' => $box->height . 'px',
				'width' => $box->width . 'px',
				'position' => 'relative'
			);
			Psd_Model_Importer::setStyles($box->getElement(), $newStyles);
		}
		$this->importer->rebuildDom();
	}

	public function generateLayerHtml() {
		$childrenToBuild = array();
		
		// loop through each box
		for ($i = 0; $i < $this->numBoxes; $i++) {
			$box = $this->boxes[$i];
			
			// loop through each layer of the box to calculate positioning
			for ($j = 0; $j < $box->numLayers; $j++) {
				$layer = $box->layers[$j];

				$newStyles = array(
					'width' => $layer->width . 'px',
					'height' => $layer->height . 'px',
					'position' => 'absolute',
					'left' => ($layer->x - $box->x) . 'px',
					'top' => ($layer->y - $box->y) . 'px'
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

				Psd_Model_Importer::setStyles($layer->getElement(), $newStyles);

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