<?php

if (!defined('ABSPATH')) die('No direct access allowed');

require_once plugin_dir_path(__FILE__) . '../admin/db.php';
require_once plugin_dir_path(__FILE__) . '../admin/api.php';


if (!class_exists('CandyAiWriterAdmin')) :

	class Candy_Ai_Writer_Admin
	{
		public function __construct()
		{
			add_action('admin_menu', array($this, 'admin_menu'));
		}

		/**
		 * 싱글톤 객체 반환
		 */
		public static function get_instance()
		{
			static $_instance = null;
			if (empty($_instance)) {
				$_instance = new self();
			}
			return $_instance;
		}

		/**
		 * 어드민 메뉴 생성
		 */
		public function admin_menu()
		{
			$capability_required = Candy_Ai_Writer_Admin::get_instance()->capability_required();

			add_menu_page("Candy AI Writer", "Candy AI Writer", 'manage_options', "Candy AI Writer", array($this, "display_admin_page"), 'dashicons-buddicons-community');
			$sub_menu_items = $this->get_submenu_items();

			foreach ($sub_menu_items as $menu_item) {
				if ($menu_item['create_submenu']) add_submenu_page('Candy AI Writer', $menu_item['page_title'], $menu_item['menu_title'], $capability_required, $menu_item['menu_slug'], $menu_item['function']);
			}
		}

		/**
		 * 서브메뉴 아이템 반환
		 *
		 * @return array
		 */
		public function get_submenu_items()
		{
			$sub_menu_items = array(
				array(
					'page_title' => 'Support & FAQs',
					'menu_title' => 'Help',
					'menu_slug' => 'candy_ai_writer_support',
					'function' => array($this, 'display_support_page'),
					'icon' => 'sos',
					'create_submenu' => true,
				),
				array(
					'page_title' => 'Premium Upgrade',
					'menu_title' => 'Premium Upgrade',
					'menu_slug' => 'candy_ai_writer_premium_upgrade',
					'function' => array($this, 'display_premium_upgrade_page'),
					'icon' => 'admin-plugins',
					'create_submenu' => true,
				),
			);

			$sub_menu_items = apply_filters('candy_ai_writer_sub_menu_items', $sub_menu_items);

			return $sub_menu_items;
		}

		/**
		 * 어드민 페이지 출력
		 */
		public function display_admin_page()
		{
			include plugin_dir_path(__FILE__) . '../src/pages/candy-admin-page.php';
		}

		/**
		 * 지원 페이지 출력
		 */
		public function display_support_page()
		{
			include plugin_dir_path(__FILE__) . '../src/pages/candy-admin-support-page.php';
		}

		public function display_premium_upgrade_page()
		{
			//redirect to premium upgrade page
			wp_redirect('https://edix.studio/');
			exit;
		}

		/**
		 *  
		 *
		 * @return string
		 */
		public function capability_required()
		{
			return 'manage_options';
		}
	}
endif;
