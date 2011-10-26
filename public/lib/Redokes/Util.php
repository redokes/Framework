<?php
class Redokes_Util {
	public static function safeTitle($str) {
		$str = preg_replace('/[^0-9a-z\-]+/si', '-', trim($str));
		$str = preg_replace('/\-+/', '-', $str);
		$str = preg_replace('/^\-/', '', $str);
		$str = preg_replace('/\-$/', '', $str);
		return $str;
	}
	
	public static function curlRequest($url, $params = array(), $method = 'post') {
		$method = strtolower($method);
		$keyValues = array();
		foreach($params as $key => $value) {
			$keyValues[] = $key . '=' . urlencode($value);
		}
		$params = implode('&', $keyValues);
		
		if ($method == 'get') {
			$url .= '?' . $params;
			
		}
		$ch = curl_init($url);
		
		if ($method == 'post') {
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		}
		
		curl_setopt($ch, CURLOPT_VERBOSE, 1);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 20);
		$response = curl_exec($ch);
		curl_close($ch);
		return $response;
	}
	
}