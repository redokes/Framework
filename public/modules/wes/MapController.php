<?php

class Wes_MapController extends Redokes_Controller_Action {

	public $mapsDir = '/modules/wes/img/sprites/maps/';
	public $mapDir = false;
	public $screenDir = false;
	public $tileDir = false;
	public $sourceTileSize = 16;
	public $destinationTileSize = 32;
	public $numColumns = 0;
	public $numRows = 0;

	public function getMapsDir() {
		return $_SERVER['DOCUMENT_ROOT'] . $this->mapsDir;
	}

	public function indexAction() {
		echo 'index';
	}

	public function processScreensAction() {
		$title = $this->frontController->getParam('title', false);
		if ($title) {

			// Get a list of all the layer screenshots
			$this->mapDir = $this->getMapsDir() . $title . '/';
			$this->screenDir = $this->mapDir . 'screens';
			$this->tileDir = $this->mapDir . 'tiles';
			$combinedImageFile = $this->mapDir . 'combined.png';

			$files = array();
			if ($handle = opendir($this->screenDir)) {
				while (false !== ($file = readdir($handle))) {
					if ($file != "." && $file != ".." && substr($file, 0, 1) != '.') {
						$files[] = $this->screenDir . '/' . $file;
					}
				}
				closedir($handle);
			}

			// Create one image of all the screens
			$numScreens = count($files);
			if ($numScreens) {
				// Get the size of the screen
				// znes will make them as 256x224 with 7 8 8 9 padding
				// Calculate the extra pixels on the edges
				$paddingTop = 15;
				$paddingRight = 8;
				$paddingBottom = 17;
				$paddingLeft = 8;

				$size = getimagesize($files[0]);
				$screenWidth = $size[0] - $paddingLeft - $paddingRight;
				$screenHeight = $size[1] - $paddingTop - $paddingBottom;
				$this->numColumns = $screenWidth / $this->sourceTileSize;
				$this->numRows = $screenHeight / $this->sourceTileSize;

				// Calculate the size of the combined image
				$allScreensWidth = $screenWidth * $numScreens;
				$allScreensHeight = $screenHeight;

				// Create the combined image
				$combinedImage = imagecreatetruecolor($allScreensWidth, $allScreensHeight);

				// Add all the screens to the combined image
				for ($i = 0; $i < $numScreens; $i++) {

					// Read in the screen image
					$screenImage = imagecreatefrompng($files[$i]);

					// Calculate the x offset to put into the combined image
					$x = $screenWidth * $i;

					// Copy the screen image to the combined image
					imagecopy($combinedImage, $screenImage, $x, 0, $paddingLeft, $paddingTop, $screenWidth, $screenHeight);

					// Delete the screen image from memory
					imagedestroy($screenImage);
				}

				// Save the combined image to disk
				imagepng($combinedImage, $combinedImageFile);

				// Delete the combined image
				imagedestroy($combinedImage);

				$this->makeTiles($combinedImageFile);
			}
		}
		else {
			echo 'no title';
		}
	}

	public function makeTiles($combinedImageFile) {
		
		// loop through 16x14 tile blocks so when new screens are added, it won't mess up the indicies
		
		$tileHashes = array();
		$totalTiles = 0;
		$totalUniques = 0;
		$tileArray = array();

		// Read in the combined image file
		$combinedImage = imagecreatefrompng($combinedImageFile);

		$size = getimagesize($combinedImageFile);
		$width = $size[0];
		$height = $size[1];

		// Get the dimensions in tile size
		$numScreens = $width / $this->numColumns;
		
		// Loop through each screen
		for ($screenIndex = 0; $screenIndex < $numScreens; $screenIndex++) {
			// Loop through each tile and store the binary data and a hash of it
			for ($rowIndex = 0; $rowIndex < $this->numRows; $rowIndex++) {
				for ($columnIndex = 0; $columnIndex < $this->numColumns; $columnIndex++) {
					$x = $screenIndex * $columnIndex * $this->sourceTileSize;
					$y = $rowIndex * $this->sourceTileSize;

					// make a placeholder to copy the tile to
					$tile = imagecreatetruecolor($this->sourceTileSize, $this->sourceTileSize);

					// copy the tile from the map to an individual tile image
					imagecopy($tile, $combinedImage, 0, 0, $x, $y, $this->sourceTileSize, $this->sourceTileSize);

					// get the tile data as a string
					ob_start();
					imagepng($tile);
					$stringdata = ob_get_contents();
					ob_end_clean();
					$zdata = gzdeflate($stringdata);

					// make a hash of the tile data
					$hash = md5($zdata);

					if (isset($tileHashes[$hash])) {

					}
					else {
						$tileHashes[$hash] = true;
						$totalUniques = count($tileHashes);
						$tileArray[] = $tile;
					}

					$totalTiles++;
				}
			}
		}
		
		imagedestroy($combinedImage);

		$numTiles = count($tileArray);

		// create a single line image to put all unique tiles on
		$tileSheet = imagecreatetruecolor($numTiles * $this->destinationTileSize, $this->destinationTileSize);

		// loop through each tile and write it to the tile sheet
		for ($i = 0; $i < $numTiles; $i++) {
			$x = $i * $this->destinationTileSize;
			$y = 0;
			imagecopyresized($tileSheet, $tileArray[$i], $x, $y, 0, 0, $this->destinationTileSize, $this->destinationTileSize, $this->sourceTileSize, $this->sourceTileSize);
		}

		$black = imagecolorallocate($tileSheet, 0, 0, 0);
		imagecolortransparent($tileSheet, $black);

		imagepng($tileSheet, $this->mapDir . '/sheet.png');
		imagedestroy($tileSheet);

		echo "total tiles = $totalTiles <br>total unique = " . count($tileHashes) . " and " . count($tileArray);
	}

}