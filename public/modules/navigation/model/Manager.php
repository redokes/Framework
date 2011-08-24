<?php
class Navigation_Class_Manager extends Papercut_ModuleManager {
	public $title = 'Navigation';
	public $accessName = 'Navigation';
	
	public static $defaultMenuConfig = array(
		"fullWidth" => false,
		"tree" => false,
		"pageUrl" => false,
		"currentPageClass" => 'currentPage',
		"currentPageItem" => false,
		"removeTopLevel" => false,
		"topLevelTextContainer" => false,
		"navClass" => false,
		"numPopups" => -1,
		"name" => '',
		"divider" => false,
		"dividerHTML" => '',
	);
	
	public $listeners = array(
		'Simon_Application.init' => 'Navigation_Class_Manager::initApplication',
		'Template_Class_Template.process' => 'Navigation_Class_Manager::parseTemplate',
		'Papercut_Template.render' => 'Navigation_Class_Manager::showMenu',
		'Content_Render.navigationPlugin' => 'Navigation_Class_Manager::renderNavigation'
	);
	
	public static function renderNavigation($event, $renderer){
		$record = $renderer->getRecord();
		$trackId = $record['trackId'];
		$track = new Navigation_Class_Track($trackId);

		// load default if no track set
		if (!$track->row['trackId']) {
			$track->loadRow('1', 'isDefault');
		}

		if ($track->row['trackId']) {
			$navId = "nav-" . md5(microtime());
			$html = $track->getHtml($navId);
			?>
			<script type="text/javascript">
				new Ext.ux.PapercutMenu('<?php echo $navId; ?>');
			</script>
			<?php
			$html .= ob_get_clean();
			$renderer->setHtml($html);
		}
	}

	public static function initApplication(){
		FrontController::getInstance()->addScript('/modules/navigation/js/Interface.js');
	}

	public static function parseTemplate($event, $template){
		
	}
	
	public static function showMenu($e, $view){
		preg_match_all("/<div[^>]*>\[menu=(.*?)\/\]<\/div>/si", $view->html, $matches);
		$menus = array();
		$replaceStrings = array();
		if(count($matches) > 1){
			$replaceStrings = $matches[0];
			$menus = $matches[1];
		}
		for ($i = 0; $i < count($menus); $i++){
			$data = json_decode($menus[$i], true);
			$track = new Navigation_Class_Track();
			$track->setRow($data);
			$options = getParam('options', Navigation_Class_Manager::$defaultMenuConfig, $data);
			$replaceString = $replaceStrings[$i];
			$menuId = $options['name'];
			if(!strlen($menuId)){
				$menuId = 'menu-' . md5(microtime());
			}
			
			//Replace the content
			$html = $track->getHtml($menuId, $options['navClass']);
			ob_start();
			?>
			<script type="text/javascript">
				Ext.EventManager.on(window, 'load',function(){
					var options = Ext.decode('<?php echo json_encode($options); ?>');
					new Ext.ux.PapercutMenu('<?php echo $menuId; ?>', options);
				});
			</script>
			<?php
			$html .= ob_get_clean();
			$view->html = str_replace($replaceString, $html, $view->html);
		}	
	}
	
	public function install(){
		parent::install();
		
		//Add a main nav
		$track = new Navigation_Class_Track();
		$track->loadRow(array(
			'isDefault' => 1
			,'title' => 'main'
		));
		
		//if no main track create it
		if(!$track->row[$track->primaryKey]){
			$track->row['title'] = 'Main';
			$track->process(false);
			$track->setDefault();
		}
	}
}