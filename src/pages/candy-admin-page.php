<?php
    
    $api_key = get_api_key();

    $expiration_date = get_expiration_date();
    $credits = get_credits();


    $is_expired = $expiration_date ? strtotime($expiration_date) < time() : true;

    if (!$is_expired) {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error is-dismissible">
                <p>라이센스가 만료되었습니다. 연장하시려면 <a href="' . admin_url('admin.php?page=candy-ai-writer') . '">여기</a>를 클릭하세요.</p>
            </div>';
        });
    }
    if (isset($_POST['submit'])) {
        $api_key = sanitize_text_field($_POST['candyApiKey']);

        $data = array(
            'api_key' => $api_key,
        );

        save_candy_ai_writer_data($data);
    }

?>

<html lang="ko">

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
    <div class="container">
        <div class="header">
            <div class="header-left">
                <div class="logo">
                    <img src="<?php echo plugins_url('../../assets/candy_logo_circle.png', __FILE__); ?>" alt="candy-logo" class="logo-img">
                </div>
                <span class="title">Candy AI Writer</span>
            </div>
            <div class="header-right">
                <span class="status">FREE</span>
                <div class="counter">
                    <span class="count"><?php echo $credits ?></span>
                    <div class="candy-icon">🍬</div>
                </div>
            </div>
        </div>

        <div class="services">
            <div class="service">
                <div class="service-img">
                    <img src="<?php echo plugins_url('../../assets/thumbnail-creator.png', __FILE__); ?>" alt="thumbnail-creator" class="service-img-content">
                </div>
                <h3 class="service-title">Thumbnail Creator</h3>
                <p class="service-desc">
                    눈에 띄는 썸네일을 만드는 데 도움을 드립니다.<br>
                    배경을 선택하고 제목을 삽입할 수 있습니다.
                </p>
            </div>

            <div class="service">
                <div class="service-img">
                    <img src="<?php echo plugins_url('../../assets/ai-writer.png', __FILE__); ?>" alt="ai-writer" class="service-img-content">
                </div>
                <h3 class="service-title">AI Writer</h3>
                <p class="service-desc">
                    클릭만으로 글을 작성할 수 있습니다.<br>
                    크롤링 기반의 글 생성기능을 제공합니다.
                </p>
            </div>

            <div class="service">
                <div class="service-img">
                    <img src="<?php echo plugins_url('../../assets/trendy-keyword.png', __FILE__); ?>" alt="trendy-keyword" class="service-img-content">
                </div>
                <h3 class="service-title">Trendy Keyword</h3>
                <p class="service-desc">
                    실시간 인기 키워드를 제공하여 클릭만으로 관련 정보를 검색하고 글을 작성할 수 있습니다.
                </p>
            </div>
        </div>

        <div class="settings">
            <h3 class="settings-title">Settings</h3>
            <form action="" method="post">
                <div class="input-group">
                    <label for="candyApiKey" class="input-label">Candy AI API Key</label>
                    <input type="text" id="candyApiKey" name="candyApiKey" class="input-field" value="<?php echo $api_key; ?>">
                </div>
                <div class="input-group">
                    <label for="expiredDate" class="input-label">Expired Date</label>
                    <input readonly type="text" id="expiredDate" name="expiredDate" class="input-field" value="<?php echo $expiration_date; ?>">
                </div>
                <div class="button-container">
                    <button class="save-button" type="submit" name="submit">
                        Save
                    </button>
                </div>
            </form>
        </div>
    </div>
</body>

</html>