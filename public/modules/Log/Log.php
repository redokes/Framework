<?php

class Log_Log {
	
	private function getLogFile() {
		$logFile = ini_get('error_log');
		if (is_file($logFile)) {
			return $logFile;
		}
		return false;
	}

	private function getRegEx() {
		$txt = '[23-Nov-2011 15:32:24]';

		$re1 = '(\\[)'; # Any Single Character 1
		$re2 = '((?:(?:[0-2]?\\d{1})|(?:[3][01]{1})))(?![\\d])'; # Day 1
		$re3 = '.*?'; # Non-greedy match on filler
		$re4 = '((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))'; # Month 1
		$re5 = '.*?'; # Non-greedy match on filler
		$re6 = '((?:(?:[1]{1}\\d{1}\\d{1}\\d{1})|(?:[2]{1}\\d{3})))(?![\\d])'; # Year 1
		$re7 = '(\\s+)'; # White Space 1
		$re8 = '((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9])?(?:\\s?(?:am|AM|pm|PM))?)'; # HourMinuteSec 1
		$re9 = '(\\])'; # Any Single Character 2
		return $re1 . $re2 . $re3 . $re4 . $re5 . $re6 . $re7 . $re8 . $re9;
		if ($c = preg_match_all("/" . $re1 . $re2 . $re3 . $re4 . $re5 . $re6 . $re7 . $re8 . $re9 . "/is", $txt, $matches)) {
			$c1 = $matches[1][0];
			$day1 = $matches[2][0];
			$month1 = $matches[3][0];
			$year1 = $matches[4][0];
			$ws1 = $matches[5][0];
			$time1 = $matches[6][0];
			$c2 = $matches[7][0];
			print "($c1) ($day1) ($month1) ($year1) ($ws1) ($time1) ($c2) \n";
		}
	}

	public function hasNewEntries() {
		$logFile = $this->getLogFile();
		if ($logFile) {
			$fileSize = filesize($logFile);
			if ($fileSize > 0) {
				return true;
			}
		}
		return false;
	}

	public function getEntries() {
		$entries = array();
		if ($this->hasNewEntries()) {
			$contents = file_get_contents($this->getLogFile());
			$lines = preg_split('/\n/', $contents);
			$errors = $this->parseLines($lines);
			$numErrors = count($errors);
			for ($i = 0; $i < $numErrors; $i++) {
				$entry = $this->parseEntry($errors[$i]);
				if ($entry) {
					$entries[] = $entry;
				}
			}
		}
		
		$this->clearLog();
		
		return $entries;
	}
	
	private function clearLog() {
		$logFile = $this->getLogFile();
		if ($logFile) {
			file_put_contents($logFile, '');
		}
	}
	
	private function parseLines($lines) {
		$numLines = count($lines);
		$errors = array();
		$regex = $this->getRegEx();
		$errorStr = '';
		for ($i = 0; $i < $numLines; $i++) {
			if (preg_match('/^'.$regex.'/si', $lines[$i])) {
				if (strlen($errorStr)) {
					$errors[] = $errorStr;
					$errorStr = '';
				}
			}
			$errorStr .= $lines[$i] . "\n";
		}
		if (strlen($errorStr)) {
			$errors[] = $errorStr;
		}
		
		return $errors;
	}
	
	private function parseEntry($error) {
		
		$entry = new Log_Entry();
		
		// Parse out date
		$regex = $this->getRegEx();
		preg_match('/^('.$regex.')(.*)/s', $error, $matches);
		if (!count($matches)) {
			return false;
		}
		
		$ts = strtotime(trim($matches[1], '[]'));
		$message = trim(end($matches));
		$entry->set('ts', $ts);

		// PHP Notice
		if (preg_match('/^PHP Notice:/', $message)) {
			$entry->set(array(
				'title' => 'Notice',
				'module' => 'PHP',
				'message' => $message,
				'type' => 'error'
			));
		}
		else if (preg_match('/^JSON:/', $message)) {
			$jsonString = trim(substr($message, 5));
			$json = json_decode($jsonString, true);
			$entry->set($json);
		}
		else if (preg_match('/^PHP Warning:/', $message)) {
			$entry->set(array(
				'title' => 'Warning',
				'module' => 'PHP',
				'message' => $message,
				'type' => 'error',
				'ts' => $ts
			));
		}
		else {
			$entry->set(array(
				'title' => 'Information',
				'module' => 'PHP',
				'message' => $message,
				'type' => 'info',
				'ts' => $ts
			));
		}
		return $entry->toArray();
	}
}