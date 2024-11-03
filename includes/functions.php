<?php

//API키가 등록되지 않았으면 알림을 띄웁니다.
function check_api_key()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'candy_ai_writer_data';
    $api_key = $wpdb->get_var("SELECT api_key FROM $table_name LIMIT 1");
    if (!$api_key) {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error is-dismissible">
                    <p>Candy AI Writer 플러그인을 사용하려면 API 키를 등록해야 합니다. <a href="' . admin_url('admin.php?page=candy-ai-writer') . '">여기</a>를 클릭하여 API 키를 등록하세요.</p>
                </div>';
        });
    }
}
