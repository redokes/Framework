<?php
class Redokes_Phantom {
	
	public static function createThumb($url, $thumbFile) {
		$rasterizeFile = MODULE_PATH . 'template/js/rasterize.js';
		$command = "/opt/local/bin/phantomjs \"$rasterizeFile\" \"$url\" \"$thumbFile\" 2>&1";
		exec($command, $output, $return);
	}
	
}