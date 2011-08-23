<?php

class Wes_MapProcessController extends Redokes_Controller_Ajax {

	public $mapsDir = '/js/redokes/src/map/data/';
	public $characterDir = '/modules/wes/img/sprites/players/';
	public $musicDir = '/modules/wes/music/';

	public function getMapsDir() {
		return $_SERVER['DOCUMENT_ROOT'] . $this->mapsDir;
	}
	
	public function getCharacterDir() {
		return $_SERVER['DOCUMENT_ROOT'] . $this->characterDir;
	}
	
	public function getMusicDir() {
		return $_SERVER['DOCUMENT_ROOT'] . $this->musicDir;
	}
	
	
	public function getMapListAction() {
		$dir = $this->getMapsDir();
		$records = array();
		if ($handle = opendir($dir)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != ".." && substr($file, 0, 1) != '.') {
					$file = str_replace('.js', '', $file);
					$records[] = array(
						'title' => $file,
						'fileName' => $file
					);
				}
			}
			closedir($handle);
		}
		$this->setParam('records', $records);
		
	}
	
	public function getCharacterListAction() {
		$dir = $this->getCharacterDir();
		$publicDir = '/modules/wes/img/sprites/players/';
		$records = array();
		if ($handle = opendir($dir)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != ".." && substr($file, 0, 1) != '.') {
					$title = str_replace('.png', '', $file);
					if (count(explode('_', $title)) == 1) {
						$records[] = array(
							'title' => $title,
							'fileName' => $publicDir . $file
						);
					}
				}
			}
			closedir($handle);
		}
		$this->setParam('records', $records);
		
	}
	
	public function getMusicListAction() {
		$dir = $this->getMusicDir();
		$records = array();
		if ($handle = opendir($dir)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != ".." && substr($file, 0, 1) != '.') {
					$file = str_replace('.js', '', $file);
					$records[] = array(
						'title' => $file,
						'fileName' => $file
					);
				}
			}
			closedir($handle);
		}
		$this->setParam('records', $records);
		
	}
	
	public function createAction() {
		$this->setParam('post', $_POST);
		$title = $this->frontController->getParam('title', false);
		if ($title) {
			$safeTitle = preg_replace('/[^a-z\d]/i', '', $title);
			$mapFile = $this->getMapsDir() . $safeTitle . '.js';
			if (is_file($mapFile)) {
				$this->addError('Map already exists');
			}
			else {
				// Build map object
				$mapData = array(
					'title' => $title,
					'fileName' => $safeTitle,
					'numLayers' => 3,
					'width' => 1,
					'height' => 1,
					'tileSize' => 32,
					'tileData' => false,
					'tileSheet' => '/modules/wes/img/sprites/maps/jidoor/sheet.png',
					'spawnX' => 0,
					'spawnY' => 0,
					'spawnLayer' => 0,
					'music' => false,
					'extend' => 'Redokes.map.MapData'
				);

				$mapDataTemplate = new Redokes_View_Template();
				$mapDataTemplate->html = "Ext.define('Redokes.map.data.{fileName}',{data})";
				$mapDataTemplate->setValues(array(
					'fileName' => $mapData['fileName'],
					'data' => json_encode($mapData)
				));

				$mapDataStr = $mapDataTemplate->render();
				file_put_contents($mapFile, $mapDataStr);
			}


			$this->setParam('safeTitle', $safeTitle);
		}
	}

}