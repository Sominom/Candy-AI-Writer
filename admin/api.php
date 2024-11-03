<?php

$API_URL = 'https://api.edix.studio';

function _get_api_key($json = false)
{
    $row = get_candy_ai_writer_data();
    $api_key = $row ? $row['api_key'] : null;

    if ($json) {
        wp_send_json(array('api_key' => $api_key));
    } else {
        return $api_key;
    }

    wp_die();
}

function get_api_key()
{
    $json = isset($_POST['json']) ? (bool)$_POST['json'] : false;
    return _get_api_key($json);
}
add_action('wp_ajax_get_api_key', 'get_api_key');

function get_expiration_date()
{
    global $API_URL;
    $url = "{$API_URL}/get_expiration_date";
    $json = isset($_POST['json']) ? (bool)$_POST['json'] : false;
    $api_key = _get_api_key();

    $response = wp_remote_get($url, array(
        'timeout' => 120,
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-API-Key' => $api_key
        ),
    ));

    if (is_wp_error($response)) {
        if ($json) {
            wp_send_json_error('Failed to retrieve expiration date.', 400);
        } else {
            return null;
        }
    }

    $data = json_decode($response['body'], true);
    $expiration_date = isset($data['expiration_date']) ? $data['expiration_date'] : null;

    if ($json) {
        wp_send_json(array('expiration_date' => $expiration_date));
    }

    return $expiration_date;

    wp_die();
}
add_action('wp_ajax_get_expiration_date', 'get_expiration_date');


function get_api_url()
{
    global $API_URL;
    $json = isset($_POST['json']) ? wp_send_json(array('api_url' => $API_URL)) : false;

    if ($json) {
        wp_send_json(array('api_url' => $API_URL));
    }

    return $API_URL;
}
add_action('wp_ajax_get_api_url', 'get_api_url');

function get_site_domain()
{
    $domain = get_site_url();
    $json = isset($_POST['json']) ? wp_send_json(array('domain' => $domain)) : false;

    if ($json) {
        wp_send_json(array('domain' => $domain));
    }

    return $domain;
}
add_action('wp_ajax_get_site_domain', 'get_site_domain');

function get_plugin_url()
{
    $url = plugin_dir_url(dirname(__FILE__));
    $json = isset($_POST['json']) ? wp_send_json(array('plugin_url' => $url)) : false;

    if ($json) {
        wp_send_json(array('plugin_url' => $url));
    }

    return $url;
}
add_action('wp_ajax_get_plugin_url', 'get_plugin_url');


function get_credits()
{
    global $API_URL;
    $url = "{$API_URL}/get_credits";
    $json = isset($_POST['json']) ? (bool)$_POST['json'] : false;
    $api_key = _get_api_key();

    $response = wp_remote_get($url, array(
        'timeout' => 120,
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-API-Key' => $api_key
        ),
    ));

    if (is_wp_error($response)) {
        if ($json) {
            wp_send_json_error('Failed to retrieve credits.', 400);
        } else {
            return null;
        }
    }

    $response_code = wp_remote_retrieve_response_code($response);
    if ($response_code !== 200) {
        if ($json) {
            wp_send_json_error('Invalid response code.', 400);
        } else {
            return null;
        }
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    $credits = isset($data['credits']) ? $data['credits'] : null;

    if ($json) {
        wp_send_json(array('credits' => $credits));
    } else {
        return $credits;
    }

    wp_die();
}
add_action('wp_ajax_get_credits', 'get_credits');

function set_reference_to_post_meta()
{

    $reference = isset($_POST['reference']) ? $_POST['reference'] : false;
    $post_id = isset($_POST['postId']) ? $_POST['postId'] : false;

    // 권한 확인
    if (! current_user_can('edit_post', $post_id)) {
        return;
    }

    if ($reference && $post_id) {
        error_log("update_post_meta: " . $reference);
        $result = update_post_meta($post_id, 'candy_ai_reference', $reference);
        if ($result) {
            error_log("Post meta updated successfully for post ID: $post_id with reference: $reference");
        } else {
            error_log("Failed to update post meta for post ID: $post_id with reference: $reference");
        }
    }
}
add_action('wp_ajax_set_reference_to_post_meta', 'set_reference_to_post_meta');

function get_reference_from_post_meta() {
    error_log("get_reference_from_post_meta called");
    error_log("POST data: " . print_r($_POST, true));

    $post_id = isset($_POST['postId']) ? $_POST['postId'] : false;

    if ($post_id) {
        $reference = get_post_meta($post_id, 'candy_ai_reference', true);
        error_log("Retrieved reference for post ID $post_id: $reference");
        wp_send_json(array('reference' => $reference));
    } else {
        error_log("No post ID provided");
        wp_send_json(array('error' => 'No post ID provided'));
    }
}
add_action('wp_ajax_get_reference_from_post_meta', 'get_reference_from_post_meta');