<?php

function plugin_register()
{
    // 스크립트
    $scripts = array(
        'candy-ai-writer-api' => array(
            'src' => plugins_url('src/js/utils/api.js', __FILE__),
        ),
        'candy-ai-writer-class' => array(
            'src' => plugins_url('src/js/utils/class.js', __FILE__),
        ),
        'candy-ai-writer-icon' => array(
            'src' => plugins_url('src/js/utils/icon.js', __FILE__),
            'deps' => array(),
            'in_footer' => true
        ),
        'candy-ai-writer-editor-format' => array(
            'src' => plugins_url('src/js/candy-ai-writer-editor-format.js', __FILE__),
            'deps' => array('wp-components', 'candy-ai-writer-icon')
        ),
        'candy-ai-writer-editor-block' => array(
            'src' => plugins_url('src/js/candy-ai-writer-editor-block.js', __FILE__),
            'deps' => array('wp-blocks', 'wp-element', 'wp-components', 'candy-ai-writer-icon')
        ),
        'candy-ai-writer-sidebar-tab' => array(
            'src' => plugins_url('src/js/candy-ai-writer-sidebar-block.js', __FILE__),
            'deps' => array('wp-plugins', 'wp-editor', 'wp-components', 'wp-element', 'wp-edit-post', 'candy-ai-writer-icon')
        ),
    );

    // 스크립트 등록  
    foreach ($scripts as $handle => $info) {
        if (isset($info['src'])) {
            wp_register_script(
                $handle,
                $info['src'],
                isset($info['deps']) ? $info['deps'] : array(),
                isset($info['ver']) ? $info['ver'] : null,
                isset($info['in_footer']) ? $info['in_footer'] : false
            );
        }
    }

    // 스타일 등록  
    wp_register_style('candy-ai-writer-editor-css', plugins_url('src/css/candy-ai-writer-editor.css', __FILE__));
}
add_action('init', 'plugin_register');

function plugin_script_enqueue()
{
    // ajax url, nonce 로컬라이즈
    wp_localize_script(
        'candy-ai-writer-api',
        'ajax_object',
        array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('candy-ai-writer-nonce')
        )
    );


    $scripts_to_enqueue = array(
        'candy-ai-writer-api',
        'candy-ai-writer-class',
        'candy-ai-writer-icon',
        'candy-ai-writer-editor-format',
        'candy-ai-writer-editor-block',
        'candy-ai-writer-sidebar-tab',
    );

    foreach ($scripts_to_enqueue as $script) {
        wp_enqueue_script($script);
    }

    wp_enqueue_style('candy-ai-writer-editor-css');

}
add_action('enqueue_block_editor_assets', 'plugin_script_enqueue');

function candy_ai_writer_register_block()
{
    register_block_type(
        'candy-ai-writer/candy-ai-writer-editor',
        array(
            'editor_script' => 'candy-ai-writer-editor-block',
            'editor_style' => 'candy-ai-writer-editor-css',
        )
    );

    register_block_type(
        'candy-ai-writer/candy-ai-writer-format',
        array(
            'editor_script' => 'candy-ai-writer-editor-format',
            'editor_style' => 'candy-ai-writer-editor-css',
        )
    );

    register_block_type(
        'candy-ai-writer/candy-ai-writer-sidebar',
        array(
            'editor_script' => 'candy-ai-writer-sidebar-tab',
            'editor_style' => 'candy-ai-writer-editor-css',
        )
    );

}

// 모듈 타입 추가
function add_module_type_to_script($tag, $handle)
{
    $module_scripts = array(
        'candy-ai-writer-icon',
        'candy-ai-writer-class',
        'candy-ai-writer-api',
        'candy-ai-writer-editor-format',
        'candy-ai-writer-editor-block',
        'candy-ai-writer-sidebar-tab',
    );

    // type="module" 추가
    if (in_array($handle, $module_scripts)) {
        return str_replace('src=', 'type="module" src=', $tag);
    }

    return $tag; // 변경 사항이 없을 경우 원래 태그 반환  
}
add_filter('script_loader_tag', 'add_module_type_to_script', 10, 2);
