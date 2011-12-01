<?php
class Scrape_Model_Element extends Redokes_Model_Model {
	public $tableClassName = 'Scrape_Model_Db_Element';

	public function import($scrapeDir, $scrapePublicDir) {
		// scheme, host, path
		$urlInfo = parse_url($this->row->absoluteUrl);
		$dirName = strtolower(dirname($urlInfo['path']));
		$dirName = str_replace('\\', '/', $dirName);
		$dirName = str_replace('//', '/', $dirName);
		$dirName = trim($dirName, '/');
		$fileName = end(explode('/', $urlInfo['path']));
		$localPath = $scrapeDir . $dirName;
		if (!is_dir($localPath)) {
//			mkdir($localPath, false, true);
			mkdir($localPath, 0777, true);
		}
		
		$newPath = $localPath . '/' . $fileName;
//		error_log("\nlocalPath = $localPath\nfileName = $fileName\n");
		$fileData = false;
		
		if (strlen($fileName) && !is_dir($newPath)) {
			// fetch resource
			@$fileData = file_get_contents($this->row->absoluteUrl);
			if ($fileData) {
				file_put_contents($newPath, $fileData);
				$this->row->complete = 1;
				$this->save();
			}
		}
		
		if (!$fileData) {
			$this->setRow(array(
				'error' => 1,
				'complete' => 1
			));
			$this->save(false);
			return false;
		}
		
		$this->row->publicPath = $scrapePublicDir . $dirName . '/' . $fileName;
		$this->row->localPath = $newPath;
		$this->save(false);
	}
}