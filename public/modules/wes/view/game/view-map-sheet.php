{body}
<style>
.selected {
	border:1px solid red;
}
</style>
<div id="save">Save</div>
<textarea id="output"></textarea>
<div id="update">update</div>
<div id="wrap" style="position:relative;">
	<?php
	$numX = 30;
	$numY = 59;
//	$numX = 3;
//	$numY = 5;
	$dir = '/modules/wes/img/sprites/maps/jidoor/';
	for ($i = 0; $i <= $numY; $i++) {
		for ($j = 0; $j <= $numX; $j++) {
			$fileName = "$j-$i.png";
			$x = $j * 32;
			$y = $i * 32;
			echo '<img id="tile-'.$j.'-'.$i.'.png" class="tile" src="'.$dir.$fileName.'" style="position:absolute; width:32px; height:32px; left:'.$x.'px; top:'.$y.'px;" />';
		}
	}
	?>
</div>