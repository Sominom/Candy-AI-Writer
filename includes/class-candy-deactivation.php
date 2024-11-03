<?php
if (!defined('ABSPATH')) die('Access denied.');

if (!class_exists('Candy_Deactivation')) :

class Candy_Deactivation {

	/**
	 * Deactivation hook
	 */
	function __construct()
	{
		register_deactivation_hook(__FILE__, array($this, 'candy_ai_writer_deactivate'));
	}

	public static function actions()
	{
		return;
	}

}

endif;
