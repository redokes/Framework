<?php

class Psd_PrivateController extends Redokes_Controller_Ajax {

	public function gridAction() {
		
	}

	public function testAction() {
		$fileName = 'c:/McCright_Home.psd'; // good
		$fileName = 'c:/McCright_Subpage.psd'; // good
//		$fileName = 'c:/CCS_Home_FINAL.psd'; // issues
		$fileName = 'c:/CCS_Subpage_Sidebar.psd'; // good
		$fileName = 'c:/Subpage.psd'; // good
//		$fileName = 'c:/Riverbend_Home.psd'; // psd isn't prepared
		$fileName = 'c:/Artist_Page.psd'; // good
		$fileName = 'c:/BBS_Subpage.psd'; // good
//		$fileName = 'c:/GPSurgery_Home.psd'; // psd isn't prepared
		$fileName = 'c:/GPSurgery_Subpage.psd'; // good
		$fileName = 'c:/GPSurgery_Kidejapa.psd'; // decent after adjusting bg.. some zindex is weird
		$fileName = 'c:/GPSurgery_Bariatric.psd'; // good after adjusting psd
		$fileName = 'c:/Center_Home_Final.psd';

		$importer = new Psd_Class_PsdImporter($fileName);
		$importer->toHtml();
		//echo $importer->getHtml();
		die();
	}

	public function processAction() {
		$psdTemplate = new Psd_Class_PsdTemplate();
		$psdTemplate->loadPost();
		$this->addError($psdTemplate->validate());
		if (!$this->anyErrors()) {
			$psdTemplate->process();
			$this->addMessage('Template has been saved');
		}
		$this->setParam('record', $psdTemplate->row);

		// send headers as plain text
		ob_start();
		$this->sendTextHeaders();
		echo htmlentities(ob_get_clean());
		die();
	}

	public function loadRowAction(){
		$psdTemplate = new Psd_Class_PsdTemplate(getParam('id', 0));
		$this->setParam('record', $psdTemplate->row);
	}

	public function convertToTemplateAction() {
		$selected = getParam('selected', array());
		$psdId = 0;
		if (count($selected)) {
			$psdId = intval($selected[0]);
		}
		
		// get the psd template object
		$psdTemplate = new Psd_Class_PsdTemplate($psdId);
		$psdTemplate->convertToTemplate();
	}

	public function installAction() {
		$m = new Psd_Class_Manager();
		$m->install();
		echo "psd installed";
		$db = $this->frontController->getDbAdapter();
		$query = "CREATE TABLE IF NOT EXISTS `psd_templates` (
			  `psdId` int(11) NOT NULL AUTO_INCREMENT,
			  `title` varchar(200) NOT NULL,
			  `templateStyle` int(2) NOT NULL,
			  `fileName` varchar(100) NOT NULL,
			  PRIMARY KEY (`psdId`),
			  KEY `title` (`title`),
			  KEY `fileName` (`fileName`)
			) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";
		$db->exec($query);
		die();
	}

	public function deleteAction() {
		$selectedIds = $_POST['selected'];
		$titles = array();
		for ($i = 0; $i < count($selectedIds); $i++) {
			$template = new Psd_Class_PsdTemplate(intval($selectedIds[$i]));
			$template->delete();
			if(count($template->errors)){
				$this->addError($template->errors);
			}
			else{
				$titles[] = $template->row['title'];
			}
		}
		if(!$this->anyErrors()){
			$this->addMessage(implode(', ', $titles) . ' <strong>deleted</strong>');
		}
	}
}