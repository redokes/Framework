<?php

class Wes_ProcessController extends Redokes_Controller_Ajax {

	public function indexAction() {
		$this->setParam('testing', 'my value');
	}
	
	public function saveMapAction() {
		$this->setParam('post', $_POST);
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
			chmod($mapPath, 0777);
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
	
}