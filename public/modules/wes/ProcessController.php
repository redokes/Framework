<?php

class Wes_ProcessController extends Redokes_Controller_Ajax {

	public function indexAction() {
		$this->setParam('testing', 'my value');
	}
	
	public function loadMapAction() {
		$mapId = $this->frontController->getParam('mapId', 0);
		if ($mapId) {
			// check map file
			
		}
	}
	
	public function saveMapAction() {
		$this->setParam('post', $_POST);
		$mapData = $this->frontController->getParam('mapData', false);
		if ($mapData) {
			$mapData = json_decode($mapData, true);
			$mapData['extend'] = 'Redokes.map.MapData';
			
			$mapDir = PUBLIC_PATH . 'js/redokes/src/map/data/';
			$mapPath = $mapDir . $mapData['file'] . '.js';
			
			$mapDataTemplate = new Redokes_View_Template();
			$mapDataTemplate->html = "Ext.define('Redokes.map.data.{file}',{data})";
			$mapDataTemplate->setValues(array(
				'file' => $mapData['file'],
				'data' => json_encode($mapData)
			));
			
			$mapDataStr = $mapDataTemplate->render();
			file_put_contents($mapPath, $mapDataStr);
			chmod($mapPath, 0777);
		}
	}

}