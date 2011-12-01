<?php

class Redokes_Zip extends ZipArchive {

	public function addDir($dir, $zipdir = '', $topAreMade = false) {
		if (!$topAreMade && strlen($zipdir)) {
			// make top directories
			$topDirectories = explode('/', $zipdir);
			$topDirectory = '';
			for ($i = 0; $i < count($topDirectories); $i++) {
				if (strlen($topDirectories[$i])) {
					$topDirectory .= $topDirectories[$i] . '/';
					$this->addEmptyDir($topDirectory);
				}
			}
		}
		$dir = rtrim($dir, '/');
		$zipdir = rtrim($zipdir, '/');
		if (strlen($zipdir)) {
			$this->addEmptyDir($zipdir);
		}
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					if (is_file($dir . '/' . $file)) {
						$fileLocation = trim($dir . '/' . $file, '/');
						$zipLocation = trim($zipdir . '/' . $file, '/');
						$this->addFile($fileLocation, $zipLocation);
					}
					else {
						if (($file !== '.') && ($file !== '..') && $file != '.svn') {
							$fileLocation = trim($dir . '/' . $file, '/');
							$zipLocation = trim($zipdir . '/' . $file, '/');
							$this->addDir($fileLocation, $zipLocation, true);
						}
					}
				}
			}
		}
	}

	public function addFilesOnly($dir, $zipdir = '', $topAreMade = false) {
		if (!$topAreMade && strlen($zipdir)) {
			// make top directories
			$topDirectories = explode('/', $zipdir);
			$topDirectory = '';
			for ($i = 0; $i < count($topDirectories); $i++) {
				if (strlen($topDirectories[$i])) {
					$topDirectory .= $topDirectories[$i] . '/';
					$this->addEmptyDir($topDirectory);
				}
			}
		}
		$dir = rtrim($dir, '/');
		$zipdir = rtrim($zipdir, '/');
		if (strlen($zipdir)) {
			$this->addEmptyDir($zipdir);
		}
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					if (is_file($dir . '/' . $file)) {
						$this->addFile($dir . '/' . $file, $zipdir . '/' . $file);
					}
				}
			}
		}
	}

	public function addDirStructure($dir, $zipdir = '', $topAreMade = false) {
		if (!$topAreMade && strlen($zipdir)) {
			// make top directories
			$topDirectories = explode('/', $zipdir);
			$topDirectory = '';
			for ($i = 0; $i < count($topDirectories); $i++) {
				if (strlen($topDirectories[$i])) {
					$topDirectory .= $topDirectories[$i] . '/';
					$this->addEmptyDir($topDirectory);
				}
			}
		}
		$dir = rtrim($dir, '/');
		$zipdir = rtrim($zipdir, '/');
		if (strlen($zipdir)) {
			$this->addEmptyDir($zipdir);
		}
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					if (is_file($dir . '/' . $file)) {

					}
					else {
						if (($file !== '.') && ($file !== '..') && $file != '.svn') {
							$this->addDir($dir . '/' . $file, $zipdir . '/' . $file, true);
						}
					}
				}
			}
		}
	}

	public function extractDirTo($destination, $dirsToExtract = array()) {
		$numToExtract = count($dirsToExtract);
		$numFiles = $this->numFiles;
		$filesToExtract = array();

		for ($i = 0; $i < $numToExtract; $i++) {
			$dirName = $dirsToExtract[$i];
			$dirNameLength = strlen($dirName);
				
			for ($j = 0; $j < $numFiles; $j++) {
				if (substr($this->getNameIndex($j), 0, $dirNameLength) == $dirName) {
					$filesToExtract[] = $this->getNameIndex($j);
				}
			}
		}
		$this->extractTo($destination, $filesToExtract);
	}

	public function deleteDir($dir) {
		$dir = rtrim($dir, '/') . '/';
		$numFiles = $this->numFiles;
		$dirNameLength = strlen($dir);

		for ($j = 0; $j < $numFiles; $j++) {
			if (substr($this->getNameIndex($j), 0, $dirNameLength) == $dir) {
				$this->deleteIndex($j);
			}
		}
	}
	

	public function deleteDirs($dirs = array()) {
		for ($i = 0; $i < count($dirs); $i++) {
			$this->deleteDir($dirs[$i]);
		}
	}
}