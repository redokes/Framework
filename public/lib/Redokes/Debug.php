<?php
/**
 * @package Redokes
 */
class Redokes_Debug {
	
	public static function getStackTrace($data, $showCallStack = false, $backtrace) {
		$lines = array();
		$num = count($backtrace);
		for ($i = 0; $i < $num; $i++) {
			$item = $backtrace[$i];
			if (isset($item['file'])) {
//				$lines[] = $item['file'] . ':' . $item['line'];
			}
			if (isset($item['class'])) {
				$lines[] = $item['class'] . $item['type'] . $item['function'];
			}
		}
		$str = "\n\n***** Error Message *****";
		if (isset($backtrace[0]['args'])) {
//			$numArgs = count($backtrace[0]['args']);
//			for ($i = 0; $i < $numArgs; $i++) {
//				$str .= "\n";
//				$str .= print_r($backtrace[0]['args'][$i], 1);
//			}
			$str .= "\n";
			$str .= print_r($backtrace[0]['args'][0], 1);
		}
		
		$str .= "\n" . 'Called from ' . $backtrace[0]['file'] . ':' . $backtrace[0]['line'];
		
		
		if ($showCallStack) {
			$str .= "\n\n***** Callstack *****\n";
			$str .= implode("\n", $lines);
		}
		$str .= "\n";
		return $str;
	}
	
	public static function output($data, $showCallStack = false) {
		echo '<pre>' . self::getStackTrace($data, $showCallStack, debug_backtrace()) . '</pre>';
	}
	
	public static function log($data, $showCallStack = false) {
		error_log(self::getStackTrace($data, $showCallStack, debug_backtrace()));
	}

}