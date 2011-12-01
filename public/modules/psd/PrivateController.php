<?php

class Psd_PrivateController extends Redokes_Controller_Ajax {

	public function getGridRecordsAction() {
		$psd = new Psd_Model_Template();
		$select = $psd->table->select()->order('psdId');
		$rows = $psd->table->fetchAll($select);
		$records = $rows->toArray();
		$numRecords = count($records);
		
		// Loop through each record and set a fake thumb
		$privateTemplatesDir = $psd->getPrivatePsdDir();
		$publicTemplatesDir = $psd->getPublicPsdDir();
		for ($i = 0; $i < $numRecords; $i++) {
			$psd->row = $rows[$i];
			
			$localThumb = $privateTemplatesDir . $psd->row->hash . '/thumb.png';
			$publicThumb = $publicTemplatesDir . $psd->row->hash . '/thumb.png';
			if (!is_file($localThumb)) {
				// TODO: use default image
				$publicThumb = '/google.png';
			}
			$records[$i]['thumb'] = $publicThumb;
			$records[$i]['url'] = $psd->getPageUrl();
		}
		
		$this->setParam('records', $records);
		$this->setParam('total', count($records));
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

		$importer = new Psd_Model_Importer($fileName);
		$importer->toHtml();
		//echo $importer->getHtml();
		die();
	}

	public function processAction() {
		// Load record if it exists
		$psdId = $this->frontController->getParam('psdId', 0);
		$psdTemplate = new Psd_Model_Template($psdId);
		
		// Set new row data and save
		$psdTemplate->setRow($_POST);
		$psdTemplate->save();
		
		if ($psdTemplate->anyErrors()) {
			$this->addError($psdTemplate->errors);
		}
		else {
			$record = $psdTemplate->row->toArray();
			$this->setParam('record', $record);
		}
	}

	public function loadRowAction(){
		$psdTemplate = new Psd_Model_Template(getParam('id', 0));
		$this->setParam('record', $psdTemplate->row);
	}

	public function convertToTemplateAction() {
		$selected = getParam('selected', array());
		$psdId = 0;
		if (count($selected)) {
			$psdId = intval($selected[0]);
		}
		
		// get the psd template object
		$psdTemplate = new Psd_Model_Template($psdId);
		$psdTemplate->convertToTemplate();
	}

	public function installAction() {
		$m = new Psd_Model_Manager();
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
			$template = new Psd_Model_Template(intval($selectedIds[$i]));
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