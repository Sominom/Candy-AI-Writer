<?php  

/**  
 * Plugin Name:       Candy AI Writer
 * Description:       Candy AI Writer는 AI 기술을 활용하여 사용자가 편하게 글을 작성할 수 있도록 도와주는 플러그인입니다.
 * Version:           0.1.0
 * Requires at least: 5.0
 * Requires PHP:      7.1  
 * Author:            EDIX Studio
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       candy-ai-writer
 *  
 * @package           create-block
 */  


require_once plugin_dir_path(__FILE__) . 'includes/class-candy-ai-writer-admin.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-candy-activation.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-candy-deactivation.php';
require_once plugin_dir_path(__FILE__) . 'includes/functions.php';
require_once plugin_dir_path(__FILE__) . 'register.php';


// Initialize the singleton class
Candy_Ai_Writer_Admin::get_instance();

// Register activation hook  
register_activation_hook(__FILE__, array('Candy_Activation', 'actions'));

// Register deactivation hook
register_deactivation_hook(__FILE__, array('Candy_Deactivation', 'actions'));

// Register block  
add_action('init', 'candy_ai_writer_register_block');