<?php
if (!defined('ABSPATH')) die('Access denied.');

if (!class_exists('Candy_Uninstall')) :

class Candy_Uninstall {
    function construct()
    {
        register_uninstall_hook(__FILE__, array($this, 'candy_ai_writer_uninstall'));
    }

    public static function actions()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'candy_ai_writer_data';

        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name) {
            $wpdb->query("DROP TABLE $table_name");
        }
    }
}
endif;
