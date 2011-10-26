<?php

class Lastfm_Model_Lastfm {
	
	public $url = 'http://ws.audioscrobbler.com/2.0/';
	public $apiKey = '15d72c062df2c9442603c77bec944028';
	
	private function sendRequest($params) {
		$defaultParams = array(
			'api_key' => $this->apiKey,
			'format' => 'json'
		);
		$params = array_merge($defaultParams, $params);
		$response = Redokes_Util::curlRequest($this->url, $params, 'get');
		return json_decode($response, true);
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
	
}