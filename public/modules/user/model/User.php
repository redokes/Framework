<?php
class User_Model_User extends Redokes_Model_Model {
	
	public $tableClassName = 'User_Model_Db_User';
	public $requiredStringFields = array(
		'email' => 'Email'
	);
	
	public function remember() {
		if ($this->row->userId == self::getMyId()) {
			// make sure whole row is loaded
			if (!strlen($this->row->password)) {
				$this->loadRow($this->row->userId);
			}
			// password is now triple salted. it is stored as a salt and we are double salting it
			$tripleSalt = $this->salt($this->salt($this->row->password));
			setcookie(md5('rememberEmail'), $this->row->email, time() + 60 * 60 * 24 * 7, '/');
			setcookie(md5('rememberPassword'), $tripleSalt, time() + 60 * 60 * 24 * 7, '/');
		}
	}

	public function loginFromCookie() {
		if (isset($_COOKIE[md5('rememberEmail')]) && isset($_COOKIE[md5('rememberPassword')])) {
			$email = $_COOKIE[md5('rememberEmail')];
			$select = $this->table->select()->where('email = ?', $email);
			$row = $this->table->fetchRow($select);
			if ($row) {
				// value in cookie is triple salted password
				// value in db is single salted. need to double salt
				if ($_COOKIE[md5('rememberPassword')] == $this->salt($this->salt($row->password))) {
					$this->row->email = $_COOKIE[md5('rememberEmail')];
					$this->row->password = $row->password;
					return $this->login(false);
				}
			}
		}
		return false;
	}

	public function loadSessionUser() {
		if (isset($_SESSION['user']) && isset($_SESSION['user']['userId'])) {
			$this->loadRow($_SESSION['user']['userId']);
		}
	}

	public function login($needToSalt = true) {
		// check if the password needs to be salted or if it is an unsalted password
		if ($needToSalt) {
			$this->row->password = $this->salt($this->row->password);
		}

		// try to load the user row with these credentials
		$this->loadRow(array(
			'email' => $this->row->email,
			'password' => $this->row->password
		));

		// check if this was a successful user/pw combo
		if ($this->row) {

			$_SESSION['user'] = array(
				'userId' => $this->row->userId,
				'email' => $this->row->email
			);
			return true;
		}
		return false;
	}

	public function logout() {
		if (!$this->row->userId) {
			$this->loadSessionUser();
		}
		$_SESSION['user'] = array();
		setcookie(md5('rememberEmail'), false, time() - 60, '/');
		setcookie(md5('rememberPassword'), false, time() - 60, '/');
	}
	
	public function validate() {
		// make sure email is unique
		$query = "SELECT COUNT(*) total FROM user WHERE email = '{$this->row->email}' AND userId <> '{$this->row->userId}'";
		$row = $this->table->fetchRow($query);
		if ($row['total']) {
			$this->addError("Please choose a different email address. Email is already in use");
		}

//		if (!valid_email($this->row->email)) {
//			$this->addError("Please enter a valid email address");
//		}

		if (strlen($this->row->password) < 5) {
			$this->addError("Password must be 5 characters or longer");
		}
		
		$confirmPassword = Redokes_Controller_Front::getInstance()->getParam('confirmPassword');
		
		if ($this->row->password != $confirmPassword) {
			$this->addError("Passwords don't match. Please confirm your password.");
		}
		
		parent::validate();
		return $this->errors;
		
		// don't let a non papercut user edit a papercut user
//		if ($this->row->userId) {
//
//			// check if edited user has papercut access
//			if (User_Class_User::hasAccess('papercut', 0, $this->row->userId)) {
//
//				// check if the user doing the editing has papercut access
//				if (!User_Class_User::hasAccess('papercut')) {
//					$this->addError('You do not have access to edit a Papercut user account');
//				}
//			}
//		}

		// make sure email is unique
		$query = "SELECT COUNT(*) total FROM user WHERE email = '{$this->row->email}' AND userId <> '{$this->row->userId}'";
		$rows = $db->fetchAll($query);
		$numRows = count($rows);
		if ($numRows) {
			if ($rows[0]['total']) {
				$this->addError("Please choose a different email address. Email is already in use");
			}
		}
		
		// check length
		if (!valid_email($this->row->email)) {
			$this->addError("Please enter a valid email address");
		}

		if (!$this->row->userId) {
			// make sure passwords match
			if ($this->row->password != $this->cpassword) {
				$this->addError("Please retype your password.");
			}

			if (strlen($this->row->password) < 5) {
				$this->addError("Password must be atleast 5 characters.");
			}
		}

		// clean access ids
		$accessIds = array();
		for ($i = 0; $i < count($this->accessIds); $i++) {
			if (intval($this->accessIds[$i])) {
				$accessIds[] = intval($this->accessIds[$i]);
			}
		}
		$this->accessIds = $accessIds;

		// clean group ids
		$groupIds = array();
		for ($i = 0; $i < count($this->groupIds); $i++) {
			if (intval($this->groupIds[$i])) {
				$groupIds[] = intval($this->groupIds[$i]);
			}
		}
		$this->groupIds = $groupIds;

		return $this->errors;
	}

	public function beforeInsert() {
		$this->row->password = $this->salt($this->row->password);
	}
	
	function delete($doAudit = true) {
		return;
		$db = FrontController::getInstance()->getDbAdapter('sharedb');

		// remove access relation
		User_Class_UserAccess::clearUserAccess($this->row->userId);

		// remove group relation
		User_Class_UserXGroup::clearGroups($this->row->userId);

		// remove addresses
		$db->delete('user_address', 'userId = ' . $db->quote($this->row->userId));

		parent::delete($doAudit);
	}

	public function hasAccess($title, $primaryKey = 0, $userId = 0) {
		if (!$userId) {
			$userId = self::getMyId();
		}
		
		// get all access ids
		$accessToCheck = array(
			'admin',
			$title
		);

		// add admin title to list (adding "herp" if looking for "herp.derp")
		$adminTitle = reset(explode('.', $title));
		if (strtolower($adminTitle) != strtolower($title)) {
			$accessToCheck[] = $adminTitle;
		}


		// if checking for admin access
		if ($title == 'admin') {
			$accessToCheck = array(
				'admin'
			);
		}
		
		$access = new User_Model_Access();
		$rows = $access->findAccess($accessToCheck);
		$numRows = count($rows);
		$accessIds = array();
		
		
		for ($i = 0; $i < $numRows; $i++) {
			$accessIds[] = $rows[$i]['accessId'];
		}
		
		if (count($accessIds)) {
			$userToAccess = new \User_Model_UserToAccess();
			$row = $userToAccess->checkPermission($userId, $accessIds, $primaryKey);
			if ($row->num) {
				return true;
			}
		}
		
		return false;
		
		// look up users groups and permissions for the groups
		// get group ids
		$query = "SELECT groupId FROM site_users_x_groups WHERE userId = $userId";
		$rows = $db->fetchAll($query);
		$numRows = count($rows);
		if ($numRows) {
			$groupIds = array();
			for ($i = 0; $i < $numRows; $i++) {
				$groupIds[] = $rows[$i]['groupId'];
			}
			$groupIdsSql = implode(',', $groupIds);

			// check group permissions
			$query = "SELECT COUNT(*) num FROM site_users_groups_x_access WHERE groupId IN($groupIdsSql) AND primaryKey IN(0, $primaryKey) AND accessId IN ($accessIdsSql)";
			$rows = $db->fetchAll($query);
			$numRows = count($rows);
			if ($numRows) {
				if ($rows[0]['num']) {
					return true;
				}
			}
		}

		return false;
	}

	public function compareNewPassword($pw) {
		if ($this->salt($pw) == $this->row->password) {
			return true;
		}
		return false;
	}

	public function setNewPassword($pw) {
		$this->row->password = $this->salt($pw);
		$this->row->save();
	}

	public static function getMyId() {
		$userId = 0;
		if (isset($_SESSION['user'])) {
			if (isset($_SESSION['user']['userId'])) {
				$userId = $_SESSION['user']['userId'];
			}
		}
		return $userId;
	}

	public static function isLoggedIn() {
		if (self::getMyId()) {
			return true;
		}
		else {
			return false;
		}
	}

	public static function getMyEmail() {
		if (User_Model_User::getMyId()) {
			return $_SESSION['user']['email'];
		}
	}

	public static function notAuthorized() {
		return;
		redirect_to('/simon/index/unauthorized');
	}

	public static function requireAccess($title, $primaryKey = 0) {
		return;
		if (!self::hasAccess($title, $primaryKey)) {
			self::notAuthorized();
		}
	}

	public function authenticate($needToSalt = true) {
		if ($needToSalt) {
			$this->row->password = $this->salt($this->row->password);
		}
		$this->loadRow(array(
			'email' => $this->row->email,
			'password' => $this->row->password,
			'confirmed' => 1
		));
		if ($this->row->userId) {
			return true;
		}
		return false;
	}

	public function confirm($hash) {
		return;
		$userInvite = new Site_Class_UserInvite();
		$site = FrontController::getInstance()->getSite();
		$userInvite->loadRow(array(
			'confirmationHash' => $hash,
			'siteId' => $site->row['siteId']
		));

		// if this is a valid invite for this site
		if ($userInvite->row['userInviteId'] && $userInvite->row['tsExpire'] >= time()) {
			$this->loadRow($userInvite->row['email'], 'email');
			
			$this->row->confirmed = 1;
			$this->update(false);

			// add site access
			$userSite = new Site_Class_UserSite();
			$userSite->setRow(array(
				'userId' => $this->row->userId,
				'siteId' => $site->row['siteId']
			));
			$userSite->process();

			$userInvite->delete();

			return true;
		}

		return false;
	}

	public function sendSignupEmail($hash) {
		return;
		// send the email
		$email = new Papercut_Email();
		$subject = 'Echo Bear site registration request';
		$siteUrl = 'http://' . $_SERVER['HTTP_HOST'];
		$inviteUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/user/index/confirm/' . $hash;
		$content = 'You have request to create an account on ' . $siteUrl . '<br />';
		$content .= '<a href="'.$inviteUrl.'">Click here to set up your account</a>';
		$email->sendEmailTemplate($this->row->email, $subject, $content);
	}

	public function sendInvite($isInvite = true) {
		if ($this->row->email) {
			return;
			$site = FrontController::getInstance()->getSite();
			$userInvite = new Site_Class_UserInvite();
			$userInvite->sendTo($this->row->email, $isInvite);
		}
	}
}