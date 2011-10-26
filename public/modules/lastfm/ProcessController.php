<?php

class Lastfm_ProcessController extends Redokes_Controller_Ajax {
	
	public function getArtistInfoAction() {
		$artistName = $this->frontController->getParam('artistName');
		$lastFm = new Lastfm_Model_Lastfm();
		$response = $lastFm->getArtistInfo($artistName);
		$this->setParam('response', $response);
	}
	
	public function getAlbumInfoAction() {
		$artistName = $this->frontController->getParam('artistName');
		$albumName = $this->frontController->getParam('albumName');
		$lastFm = new Lastfm_Model_Lastfm();
		$response = $lastFm->getAlbumInfo($artistName, $albumName);
		$this->setParam('response', $response);
	}
	
	public function getEventsAction() {
		$latitude = $this->frontController->getParam('latitude');
		$longitude = $this->frontController->getParam('longitude');
		$lastFm = new Lastfm_Model_Lastfm();
		$response = $lastFm->getEvents($latitude, $longitude);
		$this->setParam('response', $response);
	}
	
}