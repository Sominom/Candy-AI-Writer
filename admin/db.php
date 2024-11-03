<?php  
function get_candy_ai_writer_data() {  
    global $wpdb;
    $table_name = $wpdb->prefix . 'candy_ai_writer_data';  
    return $wpdb->get_row("SELECT * FROM $table_name LIMIT 1", ARRAY_A);  
}  

function save_candy_ai_writer_data($data) {  
    global $wpdb;
    $table_name = $wpdb->prefix . 'candy_ai_writer_data';  
    $existing_id = $wpdb->get_var("SELECT id FROM $table_name LIMIT 1");  

    if ($existing_id !== null) {  
        $wpdb->update($table_name, $data, array('id' => $existing_id));  
        return "updated";  
    } else {  
        $wpdb->insert($table_name, $data);  
        return "inserted";  
    }  
}  