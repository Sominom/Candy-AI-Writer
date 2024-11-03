<?php
if (!defined('ABSPATH')) die('Access denied.');

if (!class_exists('Candy_Activation')) :
class Candy_Activation {

	/**
	 * Activation hook
	 */
    function __construct()
    {
        register_activation_hook(__FILE__, array($this, 'candy_ai_writer_activate'));
    }

    public static function actions()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'candy_ai_writer_data';

        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            $charset_collate = $wpdb->get_charset_collate();

            $sql = "CREATE TABLE $table_name (
                id mediumint(9) NOT NULL AUTO_INCREMENT,
                api_key varchar(255) NULL,
                PRIMARY KEY (id)
            ) $charset_collate;";

            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql);
        }
    }
	
}
endif;