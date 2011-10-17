{body}

<div id="primary" class="mercury-region" data-type="editable">
	default content
</div>

<a class="button blue" href="#" onclick="if (window.Mercury) { Mercury.trigger('toggle:interface') } else { alert('Sorry, but Mercury Editor isn\'t supported by your current browser.  Try Chrome, Firefox, or Safari.'); }">Test it out</a>

<script>
Ext.onReady(function() {
	console.log('trigger');
	Mercury.trigger('initialize:frame');
});
</script>