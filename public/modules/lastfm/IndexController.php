<?php

class Lastfm_IndexController extends Redokes_Controller_Action {
	
	public function init() {
		$this->getView()
			->setValues(array(
				'title' => 'File Test'
			))
			->addCss('/js/ext-4.0.2a/resources/css/ext-all.css')
			->addCss('/modules/files/css/files.css')
			->addJs('/js/ext-4.0.2a/ext-all-debug.js')
			->addJs('/js/redokes/redokes.js')
			->addJs('http://localhost:8080/socket.io/socket.io.js');
	}
	
	public function lastfmAction() {
//		$url = 'http://www.last.fm/api/auth/?api_key=15d72c062df2c9442603c77bec944028&cb=http://redokes-framework.wes/lastfm/index/lastfm';
//		echo "<a href=\"$url\">$url</a><br /><br />";
//		$token = $this->frontController->getParam('token');
//		echo "token = $token";
//		if (strlen($token)) {
//			// Make api get session call
//			$apiSig = '';
//			$lastFm = new Lastfm_Model_Lastfm();
//			$response = $lastFm->getSession($token, $apiSig);
//			show_array($response);
//		}
		
		
//		$lastFm = new Lastfm_Model_Lastfm();
//		$response = $lastFm->getEvents('30.2655503', '-97.7383946');
//		$events = $response['events']['event'];
//		for ($i = 0; $i < count($events); $i++) {
//			echo $events[$i]['title'] . ' at ' . $events[$i]['venue']['name'] . '<br>';
//		}
//		die();
		?>

<script>
Ext.onReady(function() {
	console.log('ready');
	navigator.geolocation.getCurrentPosition(function(position) {
		var coords = position.coords;
		var latitude = coords.latitude;
		var longitude = coords.longitude;
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/lastfm/process/get-events',
			params:{
				latitude: latitude,
				longitude: longitude
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				console.log(response);
			}
		});
	})
});

</script>
		<?php
	}
	
}