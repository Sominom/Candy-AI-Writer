<?php

?>

<hmtl lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candy AI Writer</title>
    <?php
        $cssContent = file_get_contents(plugin_dir_path(__FILE__) . '../css/candy-ai-writer-admin.css');
        echo '<style>' . $cssContent . '</style>';
    ?>
</head>
<body class="base">
</body>
</html>