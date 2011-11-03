<?php
class Redokes_Controller_Router {
	public $routes = array();
	public $routeList = array();

	/*
	 * returns an assoc array of route => new route
	 * example: 'index/index/index' => array('module' => 'pages')
	 */

	public function getRoutes() {
		$cacheId = 'routes';
		$cache = Redokes_Controller_Front::getInstance()->getCache();
		$cache->remove($cacheId);
		
		if (($data = $cache->load($cacheId)) === false) {
			$routes = array();
			$rows = $this->fetchRoutes();
			$numRows = count($rows);
			for ($i = 0; $i < $numRows; $i++) {
				$parts = explode('/', $rows[$i]['source']);
				$numParts = count($parts);
				if ($numParts < 2) {
					$parts[1] = 'index';
				}
				if ($numParts < 3) {
					$parts[2] = 'index';
				}
				$source = implode('/', $parts);
				
				$destination = array();
				$parts = explode('/', $rows[$i]['destination']);
				$numParts = count($parts);
				if ($numParts >= 1) {
					$destination['module'] = $parts[0];
					if ($numParts >= 2) {
						$destination['controller'] = $parts[1];
						if ($numParts >= 3) {
							$destination['action'] = $parts[2];
						}
					}
				}
				$routes[$source] = $destination;
			}
			$data = json_encode($routes);
			$cache->save($data, $cacheId);
		}
		$data = json_decode($data, true);
		$this->routes = $data;
		return $this->routes;
	}

	/*
	 * read from the route list file to generate the route cache
	 * writes to route cache file
	 */
	
	public function fetchRoutes() {
		try {
			$db = Redokes_Controller_Front::getInstance()->getDbAdapter();
			$query = "SELECT * FROM routes";
			$rows = $db->fetchAll($query);
			return $rows;
		}
		catch(Zend_Db_Adapter_Exception $e) {
			return array();
		}
	}
	
	private function buildRoutes() {
		foreach ($this->routeList as $moduleName => $routes) {
			foreach ($routes as $route => $newRoute) {
				$this->routes[$route] = $newRoute;
			}
		}
		FileSystem::writeResourceFile($this->routeCache, json_encode($this->routes), false);
	}

	public function addRoutes($moduleName, $routes) {
		$this->getRouteList();
		$this->routeList[$moduleName] = $routes;
		$this->writeRouteListFile();
		$this->buildRoutes();
	}

	public function removeRoutes($moduleName) {
		$this->getRouteList();
		if (isset($this->routeList[$moduleName])) {
			unset($this->routeList[$moduleName]);
		}
		$this->buildRoutes();
	}

	public function getRouteList() {
		if (is_file($this->routeListFile)) {
			$this->routeList = json_decode(FileSystem::readResourceFile($this->routeCache, false), true);
		}
		return $this->routeList;
	}

	public function writeRouteListFile() {
		FileSystem::writeResourceFile($this->routeListFile, json_encode($this->routeList), false);
	}
}