<?php

class Lastfm_Model_Lastfm {
	
	public $url = 'http://ws.audioscrobbler.com/2.0/';
	public $apiKey = '15d72c062df2c9442603c77bec944028';
	private $secret = 'a8d021529ea3e3a721d7f4ee243bcdb5';
	
	private function sendRequest($params) {
		$defaultParams = array(
			'api_key' => $this->apiKey,
			'format' => 'json'
		);
		$params = array_merge($defaultParams, $params);
		$apiSig = $this->getSignature($params);
		$params['api_sig'] = $apiSig;
		$response = Redokes_Util::curlRequest($this->url, $params, 'get');
		return json_decode($response, true);
	}
	
	/**
	 * Construct your api method signatures by first ordering all 
	 * the parameters sent in your call alphabetically by parameter 
	 * name and concatenating them into one 
	 * string using a <name><value> scheme.
	 * Ensure your parameters are utf8 encoded. 
	 * Now append your secret to this string. 
	 * Finally, generate an md5 hash of the resulting string.
	 */
	private function getSignature($params) {
		ksort($params);
		$str = '';
		foreach($params as $key => $value) {
			$str .= $key . $value;
		}
		$str = utf8_encode($str);
		$str .= $this->secret;
		$str = md5($str);
		return $str;
	}
	
	public function getSession($token, $apiSig) {
		$params = array(
			'method' => 'auth.getSession',
			'token' => $token,
			'api_sig' => $apiSig
		);
		return $this->sendRequest($params);
	}
	
	public function getArtistInfo($artistName) {
		$params = array(
			'method' => 'artist.getinfo',
			'artist' => $artistName
		);
		return $this->sendRequest($params);
	}
	
	public function getAlbumInfo($artistName, $albumName) {
		$params = array(
			'method' => 'album.getinfo',
			'artist' => $artistName,
			'album' => $albumName
		);
		return $this->sendRequest($params);
	}
	
	public function getEvents($latitude, $longitude, $distance = 50) {
		$params = array(
			'method' => 'geo.getevents',
			'lat' => $latitude,
			'long' => $longitude,
			'distance' => $distance
		);
		return $this->sendRequest($params);
	}
	
}