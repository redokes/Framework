<?php 
class Simon_Redirects_IndexController extends Papercut_Controller {
	
	public function init(){
		Users_Class_User::requireAccess('redirects');
	}
	
	public function indexAction(){
		FrontController::getInstance()->getTemplate()->setContent('title', 'Redirects');
		FrontController::getInstance()->addScript(array(
			'/simon/redirects/js/Form.js',
			'/simon/redirects/js/GridBase.js',
			'/simon/redirects/js/Grid.js',
			'/simon/redirects/js/Interface.js'
		));
		?>
		<div id="redirects-interface"></div>
		<script type="text/javascript">
		Ext.EventManager.on(window, 'load', function(){
			var redirectsInterface = new Simon.redirects.Interface({
				renderTo: 'redirects-interface'
			});
		});
		</script>
		<?php
	}
}