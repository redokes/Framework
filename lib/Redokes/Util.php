<?php
class Redokes_Util {
	public static function safeTitle($str) {
		$str = preg_replace('/[^0-9a-z\-]+/si', '-', trim($str));
		$str = preg_replace('/\-+/', '-', $str);
		$str = preg_replace('/^\-/', '', $str);
		$str = preg_replace('/\-$/', '', $str);
		return $str;
	}
}