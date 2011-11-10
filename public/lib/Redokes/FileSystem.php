<?php
class Redokes_FileSystem {
	public static $sitePath = false;
	public static $localSitePath = false;
	private static $_sitePrefix = false;
	private static $key = 'AKIAJT7DVANTCU4PLV6A';
	private static $secret = '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';
	private static $bucket = 'echobear';
	private static $storage = false;
	private static $url = 'https://s3.amazonaws.com/';
	
	public static function getStorage(){
		if(!self::$storage){
			self::$storage = Zend_Cloud_StorageService_Factory::getAdapter(array(
			    Zend_Cloud_StorageService_Factory::STORAGE_ADAPTER_KEY => 'Zend_Cloud_StorageService_Adapter_S3',
			    Zend_Cloud_StorageService_Adapter_S3::AWS_ACCESS_KEY   => self::$key,
			    Zend_Cloud_StorageService_Adapter_S3::AWS_SECRET_KEY   => self::$secret,
			    "bucket_name" => self::$bucket
			));
		}
		return self::$storage;
	}
	
	public static function getSitePrefix() {
		if (!self::$_sitePrefix) {
			$pathInfo = pathinfo($_SERVER['HTTP_HOST']);
			$parts = explode('.', strtolower($pathInfo['filename']));
			if (count($parts) == 2 && $parts[0] != 'www' && $parts[0] != 'api') {
				self::$_sitePrefix = $parts[0];
			}
		}
		return self::$_sitePrefix;
	}

	public static function setSitePrefix($prefix) {
		self::$_sitePrefix = $prefix;
		self::$localSitePath = false;
	}

	public static function getSitePath() {
		if (!self::$sitePath) {
			self::$sitePath = self::$url . self::$bucket . '/' . self::getSitePrefix() . '/';
		}

		return self::$sitePath;
	}
	
	public static function getLocalSitePath() {
		if (!self::$localSitePath) {
			self::$localSitePath = RESOURCE_PATH . self::getSitePrefix() . '/';
		}
		if (!is_dir(self::$localSitePath)) {
			mkdir(self::$localSitePath);
		}
		return self::$localSitePath;
	}

	public static function makeDirectories($dirsToMake) {
		if (!is_array($dirsToMake)) {
			$dirsToMake = str_replace('\\', '/', $dirsToMake);
			$dirsToMake = explode('/', $dirsToMake);
		}
		
		$currentPath = $dirsToMake[0] . '/';
		$numDirectories = count($dirsToMake);
		for ($i = 1; $i < $numDirectories; $i++) {
			$currentPath .= $dirsToMake[$i] . '/';
			if (strlen($currentPath) && !is_dir($currentPath)) {
				mkdir($currentPath);
			}
		}
		return implode('/', $dirsToMake) . '/';
	}
	
	public static function readResourceFile($path, $remote = true){
		if($remote){
			$path = self::getSitePrefix() . '/' . $path;
			$storage = self::getStorage();
			return $storage->fetchItem($path);
		}
		
		//Local file
		if(self::fileExists($path)){
			$path = self::getLocalSitePath() . $path;
			return file_get_contents($path);
		}
		else{
			return false;
		}
	}

	public static function writeResourceFile($path, $contents, $remote = true) {
		if($remote){
			$path = self::getSitePrefix() . '/' . $path;
			$storage = self::getStorage();
			$storage->storeItem($path, $contents, array(
				Zend_Cloud_StorageService_Adapter_S3::METADATA => array(
            		Zend_Service_Amazon_S3::S3_ACL_HEADER => Zend_Service_Amazon_S3::S3_ACL_PUBLIC_READ
        		)
			));
			return true;
		}
		
		//Build local path
		$localSitePath = self::getLocalSitePath();
		$path = $localSitePath . str_replace($localSitePath, '', $path);
		
		//Ensure the path exists
		$pathArray = explode("/", $path);

		// pop off the file at the end
		array_pop($pathArray);

		self::makeDirectories($pathArray);

		//Save the file
		file_put_contents($path, $contents);
		
		return true;
	}
	
	public static function writeDirectory($path){ 
		$fullPath = self::getLocalSitePath() . $path;
	    $ignore = array('.', '..' ); 
	    $dh = @opendir($fullPath); 
	    while(false !== ($file = readdir($dh))){ 
	        if(!in_array($file, $ignore)){ 
	            if(is_dir("$fullPath/$file")){ 
	                self::writeDirectory("$path{$file}/"); 
	            }
	            else { 
	            	self::writeResourceFile("$path{$file}", file_get_contents("$fullPath/$file"));
	            } 
	        } 
	    } 
	    closedir($dh);
	} 
	
	public static function fileExists($path){
		$path = self::getLocalSitePath() . $path;
		return is_file($path);
	}
	
	public static function getFullLocalPath($path){
		return self::getLocalSitePath() . $path;
	}
	
	public static function removeResourceFile($path, $remote = true){
		if($remote){
			$path = self::getSitePrefix() . '/' . $path;
			$storage = self::getStorage();
			$storage->deleteItem($path);
			return true;
		}
		
		$path = self::getLocalSitePath() . $path;
		@unlink($path);
		return true;
	}

	public static function unlinkRecursive($dir, $deleteRootToo = true) {
		$dir = rtrim($dir, '/');
		if (!$dh = @opendir($dir)) {
			return;
		}
		while (false !== ($obj = readdir($dh))) {
			if($obj == '.' || $obj == '..') {
				continue;
			}
			if (!@unlink($dir . '/' . $obj)) {
				self::unlinkRecursive($dir.'/'.$obj, true);
			}
		}
		closedir($dh);
		if ($deleteRootToo) {
			@rmdir($dir);
		}
		return;
	}
}