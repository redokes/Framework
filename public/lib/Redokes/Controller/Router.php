<?php
class Redokes_Controller_Router {
	public $routeCache = 'routeCache.txt';
	public $routeListFile = 'routeList.txt';
	public $routes = array();
	public $routeList = array();

	public function __construct() {
		$this->routeCache = 'router/' . $this->routeCache;
		$this->routeListFile = 'router/' . $this->routeListFile;
	}

	/*
	 * returns an assoc array of route => new route
	 * example: 'index/index/index' => array('module' => 'pages')
	 */

	public function getRoutes() {
//		$this->routes = json_decode(FileSystem::readResourceFile($this->routeCache, false), true);
		$this->routes = array(
			'index/index/index' => array(
				'module' => 'scottandkassi'
			)
		);
		return $this->routes;
	}

	/*
	 * read from the route list file to generate the route cache
	 * writes to route cache file
	 */

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