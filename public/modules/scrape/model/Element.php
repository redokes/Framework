<?php
class Scrape_Model_Element extends Redokes_Model_Model {
	public $table = 'scrape_elements';
	public $primaryKey = 'elementId';
	public $row = array(
		'elementId' => 0,
		'absoluteUrl' => '',
		'pageId' => 0,
		'tag' => '',
		'tagIndex' => 0,
		'complete' => 0,
		'error' => 0,
		'publicPath' => '',
		'localPath' => '',
		'scrapeId' => 0
	);

	public function import($scrapeDir, $scrapePublicDir) {
		// scheme, host, path
		$urlInfo = parse_url($this->row['absoluteUrl']);
		$dirName = strtolower(dirname($urlInfo['path']));
		$dirName = str_replace('\\', '/', $dirName);
		$dirName = str_replace('//', '/', $dirName);
		$dirName = trim($dirName, '/');
		$fileName = end(explode('/', $urlInfo['path']));
		$localPath = $scrapeDir . $dirName;
		
		if (!is_dir($localPath)) {
			mkdir($localPath, false, true);
		}
		
		$newPath = $localPath . '/' . $fileName;
		
		// fetch resource
		@$fileData = file_get_contents($this->row['absoluteUrl']);
		
		if ($fileData) {
			file_put_contents($newPath, $fileData);
			$this->row['complete'] = 1;
			$this->update();
		}
		else {
			$this->setRow(array(
				'error' => 1,
				'complete' => 1
			));
			$this->process(false);
			return false;
		}
		
		$this->row['publicPath'] = $scrapePublicDir . $dirName . '/' . $fileName;
		$this->row['localPath'] = $newPath;
		$this->process(false);
	}
}