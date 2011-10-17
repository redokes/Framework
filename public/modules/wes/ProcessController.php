<?php

class Wes_ProcessController extends Redokes_Controller_Ajax {
	
	public function indexAction() {
		$this->setParam('testing', 'my value');
	}
	
	public function saveMapAction() {
		$this->setParam('post', $_POST);
		$this->setParam('mapData', $_POST['mapData']);
		foreach ($_POST as $key => $value) {
			$this->setParam($key, $value);
		}
		$mapData = $this->frontController->getParam('mapData', false);
		if ($mapData) {
			$mapData = json_decode($mapData, true);
			$mapData['extend'] = 'Redokes.map.MapData';
			foreach($mapData as $key => &$value) {
				if (is_numeric($value)) {
					$value = intval($value);
				}
			}
			
			$mapDir = PUBLIC_PATH . 'js/redokes/src/map/data/';
			$mapPath = $mapDir . $mapData['fileName'] . '.js';
			
			$mapDataTemplate = new Redokes_View_Template();
			$mapDataTemplate->html = "Ext.define('Redokes.map.data.{fileName}',{data})";
			$mapDataTemplate->setValues(array(
				'fileName' => $mapData['fileName'],
				'data' => json_encode($mapData)
			));
			
			$mapDataStr = $mapDataTemplate->render();
			file_put_contents($mapPath, $mapDataStr);
//			chmod($mapPath, 0777);
		}
	}
	
	public function loadMapAction() {
		$this->setParam('post', $_POST);
		$fileName = $this->frontController->getParam('fileName', false);
		$mapDir = PUBLIC_PATH . 'js/redokes/src/map/data/';
		$mapPath = $mapDir . $fileName . '.js';
		if (isset($mapPath)) {
			$contents = file_get_contents($mapPath);
			$this->setParam('contents', $contents);
			$this->setParam('cls', 'Redokes.map.data.' . $fileName);
			$this->setParam('fileName', $fileName);
		}
	}
	
	public function makeMapSheetAction() {
		// Set up config options
		$sourceSize = 16;
		$destinationSize = 32;
		
		$images = array();
		
		$dir = $_SERVER['DOCUMENT_ROOT'] . '/modules/wes/img/sprites/maps/jidoor-tiles';
		$writeDir = $_SERVER['DOCUMENT_ROOT'] . '/modules/wes/img/sprites/maps';
		if ($handle = opendir($dir)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != "..") {
					$images[] = $dir . '/' . $file;
				}
			}
			closedir($handle);
		}
		
		$numTiles = count($images);
		$tileSheet = imagecreatetruecolor($numTiles * $destinationSize, $destinationSize);
		
		for ($i = 0; $i < $numTiles; $i++) {
			$tile = imagecreatefrompng($images[$i]);
			$x = $i * $destinationSize;
			$y = 0;
			imagecopyresized($tileSheet, $tile, $x, $y, 0, 0, $destinationSize, $destinationSize, $sourceSize, $sourceSize);
			imagedestroy($tile);
		}
		
		imagepng($tileSheet, $writeDir . '/sheet.png');
		imagedestroy($tileSheet);
		
		show_array($images);
		die();
	}
	
	public function importMapFileAction() {
		// Set up config options
		$tileSize = 16;
		
		// Get file
//		$uploadedFile = $_FILES['file'];
		
		// This bit is fake for now
		$fileName = $_SERVER['DOCUMENT_ROOT'] . '/modules/wes/img/sprites/maps/jidoor.png';
		$mapName = end(explode('/', $fileName));
		$mapName = reset(explode('.', $mapName));
		$mapDir = $_SERVER['DOCUMENT_ROOT'] . '/modules/wes/img/sprites/maps/' . $mapName;
		if (!is_dir($mapDir)) {
			mkdir($mapDir);
		}
		
		$img = getimagesize($fileName);
		$width = $img[0];
		$height = $img[1];
		
		// calculate the extra pixels on the edges
		$paddingTop = 8;
		$paddingRight = 0;
		$paddingBottom = 10;
		$paddingLeft = 0;
		
		// get the actual dimensions in tile size
		$tilesWidth = ($width - $paddingRight) / $tileSize;
		$tilesHeight = ($height - $paddingBottom) / $tileSize;
		
		$mapImg = imagecreatefrompng($fileName);
		
		$tileHashes = array();
		$totalTiles = 0;
		$totalUniques = 0;
		$tileArray = array();
		
		// loop through each tile and write out the image
		for ($i = 0; $i < $tilesHeight; $i++) {
			for ($j = 0; $j < $tilesWidth; $j++) {
				$x = $paddingLeft + $j * $tileSize;
				$y = $paddingTop + $i * $tileSize;
				
				// make a placeholder to copy the tile to
				$tile = imagecreatetruecolor($tileSize, $tileSize);
				
				// copy the tile from the map to an individual tile image
				imagecopy($tile, $mapImg, 0, 0, $x, $y, $width, $height);
				
				$tileFileName = "$mapDir/$j-$i.png";
				imagepng($tile, $tileFileName);
				imagedestroy($tile);
			}
		}
		
		
		die();
		
		// loop through each tile and store the binary data and a hash of it
		for ($i = 0; $i < $tilesHeight; $i++) {
			for ($j = 0; $j < $tilesWidth; $j++) {
				$x = $j * $tileSize;
				$y = $i * $tileSize;
				
				// make a placeholder to copy the tile to
				$tile = imagecreatetruecolor($tileSize, $tileSize);
				
				// copy the tile from the map to an individual tile image
				imagecopy($tile, $mapImg, 0, 0, $x, $y, $width, $height);
				
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
		imagedestroy($mapImg);
		
		$numTiles = count($tileArray);
		
		// create a single line image to put all unique tiles on
		$tileSheet = imagecreatetruecolor($numTiles * $tileSize, $tileSize);
		
		// loop through each tile and write it to the tile sheet
		for ($i = 0; $i < $numTiles; $i++) {
			$x = $i * $tileSize;
			$y = 0;
			imagecopy($tileSheet, $tileArray[$i], $x, $y, 0, 0, $tileSize, $tileSize);
		}
		
		imagepng($tileSheet, $mapDir . '/' . $mapName . '.png');
		imagedestroy($tileSheet);
		
		echo "total tiles = $totalTiles <br>total unique = " . count($tileHashes) . " and " . count($tileArray);
		
		die();
		
		// Validate that file uploaded
		
		// Detect dimensions
		
		
	}
	
	public function copyTilesAction() {
		$fileNames = json_decode($_POST['fileNames'], true);
		$numFileNames = count($fileNames);
		$fromDir = $_SERVER['DOCUMENT_ROOT'] . '/modules/wes/img/sprites/maps/jidoor/';
		$toDir = $_SERVER['DOCUMENT_ROOT'] . '/modules/wes/img/sprites/maps/jidoor-tiles/';
		for ($i = 0; $i < $numFileNames; $i++) {
			$fromFile = $fromDir . $fileNames[$i];
			$toFile = $toDir . $fileNames[$i];
			copy($fromFile, $toFile);
		}
	}
	
	
	
}