<?php

class Wes_GameController extends Redokes_Controller_Action {
	
	public function init() {
		$user = new User_Model_User();
		if (!$user->hasAccess('admin')) {
			$this->redirect('/');
		}
	}
	
	public $screensDir = '/modules/wes/img/sprites/maps/screens';
	
	public function indexAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Wes Game'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addCss('/js/redokes/src/game/css/game.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
			->addJs('/modules/wes/js/wesokes.js')
			->addJs('http://localhost:8080/socket.io/socket.io.js');
	}
	
	public function editAction() {
		$this->indexAction();
	}
	
	
	public function viewMapSheetAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Map Sheet'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addCss('/js/redokes/src/game/css/game.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
			->addJs('/modules/wes/js/mapsheet.js');
	}
	
	public function formsAction() {
		$this->getView()
			->setValues(array(
				'title' => 'Processing Forms'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addCss('/js/redokes/src/game/css/game.css')
			->addJs('/js/ext-4.0.2a/ext-all.js')
			->addJs('/modules/wes/js/processing-forms.js');
		
		// this processes sprite sheets from some site
		$dir = __DIR__ . '/img/sprites/players/';
		$records = array();
		if ($handle = opendir($dir)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != ".." && substr($file, 0, 1) != '.') {
					if (preg_match('/_sheet/', $file)) {
						$title = str_replace('.png', '', $file);
						$records[] = array(
							'title' => $title,
							'fileName' => $file
						);
					}
				}
			}
			closedir($handle);
		}
		
		
		// loop through each sheet and make a new sheet file named
		$topPadding = 48;
		$leftPadding = 2;
		
		$sourceHeight = 24;
		$sourceWidth = 16;
		$destinationHeight = 48;
		$destinationWidth = 32;
		
		$horizontalSpacing = 14;
		$verticalSpacing = 6;
		$numColumns = 15;
		$numRows = 3;
		
		for ($i = 0; $i < count($records); $i++) {
			$file = $records[$i];
			$title = $file['title'];
			$fileName = $file['fileName'];
			$characterName = explode('_', $title);
			$characterName = $characterName[1];
			
			// read in other sprite sheet
			$otherSpriteSheet = imagecreatefrompng($dir . $fileName);
			
			// create sprite sheet
			$sheetWidth = $destinationWidth * $numColumns * $numRows;
			$sheetHeight = $destinationHeight;
			$spriteSheet = imagecreatetruecolor($sheetWidth, $sheetHeight);
			
			for ($rowIndex = 0; $rowIndex < $numRows; $rowIndex++) {
				for ($columnIndex = 0; $columnIndex < $numColumns; $columnIndex++) {
					$originX = $leftPadding + ($columnIndex * $sourceWidth + $horizontalSpacing * $columnIndex);
					$originY = $topPadding + ($rowIndex * $sourceHeight + $verticalSpacing * $rowIndex);
					$destinationX = ($rowIndex * $numColumns + $columnIndex) * $destinationWidth;
					imagecopyresized($spriteSheet, $otherSpriteSheet, $destinationX, 0, $originX, $originY, $destinationWidth, $destinationHeight, $sourceWidth, $sourceHeight);
				}
			}
			
			$black = imagecolorallocate($spriteSheet, 0, 0, 0);
			imagecolortransparent($spriteSheet, $black);
			imagepng($spriteSheet, $dir . $characterName . '.png');
//			header('Content-type:image/png');
//			imagepng($spriteSheet);die();
		}
		
	}
	
	public function transparentAction() {
		$screensDir = $_SERVER['DOCUMENT_ROOT'] . $this->screensDir;
		$images = array();
		
		if ($handle = opendir($screensDir)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != "..") {
					$images[] = $screensDir . '/' . $file;
				}
			}
			closedir($handle);
		}
		
		$numImages = count($images);
		
		for ($i = 0; $i < $numImages; $i++) {
			if (strpos($images[$i], 'transparent') == null) {
				$image = imagecreatefrompng($images[$i]);
				$newFileName = str_replace('.png', '-transparent.png', $images[$i]);
				$black = imagecolorallocate($image, 0, 0, 0);
				imagecolortransparent($image, $black);
				imagepng($image, $newFileName);
				imagedestroy($image);
			}
		}
		die('stop');
	}

}