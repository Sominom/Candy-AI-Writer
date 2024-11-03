export const ajaxRequest = (action, data = {}) => {
    return new Promise((resolve, reject) => {
        jQuery(document).ready(function ($) {
            $.ajax({
                url: ajax_object.ajax_url,
                type: "POST",
                data: {
                    action: action,
                    _ajax_nonce: ajax_object.nonce,
                    ...data,
                },
                success: resolve,
                error: (jqXHR, textStatus, errorThrown) => {
                    reject(new Error(errorThrown));
                },
            });
        });
    });
};

// 크레딧 데이터 가져오기
export const getCredits = (json = true) => {
    return ajaxRequest("get_credits", { json })
        .then(response => {
            return response["credits"];
        })
        .catch(error => {
            console.error("Error fetching credits:", error);
            throw error;
        });
};

// 사이트 도메인 가져오기
export const getSiteDomain = (json = true) => {
    return ajaxRequest("get_site_domain", { json })
        .then(response => {
            return response["domain"];
        })
        .catch(error => {
            console.error("Error fetching site domain:", error);
            throw error;
        });
};

// API URL 가져오기
export const getApiUrl = (json = true) => {
    return ajaxRequest("get_api_url", { json })
        .then(response => {
            return response["api_url"];
        })
        .catch(error => {
            console.error("Error fetching API URL:", error);
            throw error;
        });
};

// API 키 가져오기
export const getApiKey = (json = true) => {
    return ajaxRequest("get_api_key", { json })
        .then(response => {
            return response["api_key"];
        })
        .catch(error => {
            console.error("Error fetching credits:", error);
            throw error;
        });
};

// 답변에 참조할 데이터 가져오기
export const getReferenceData = () => {
    console.log(jQuery(".candy-ai-reference").val());
    return jQuery(".candy-ai-reference").val() ? jQuery(".candy-ai-reference").val() : "";
};

// 포스트 메타에 참조 데이터 설정
export const setReferenceToPostMeta = async (postId, reference) => {
    return ajaxRequest("set_reference_to_post_meta", { postId, reference })
    .catch(error => {
        console.error("Error setting reference to post meta:", error);
        throw error;
    });
}

// 포스트 메타에서 참조 데이터 가져오기
export const getReferenceFromPostMeta = async (postId) => {
    return ajaxRequest("get_reference_from_post_meta", { postId })
        .then(response => {
            return response["reference"] ? response["reference"] : "";
        })
        .catch(error => {
            console.error("Error getting reference from post meta:", error);
            throw error;
        });
}

export const getPluginUrl = async (json = true) => {
    try {
        const response = await ajaxRequest("get_plugin_url", { json });
        return String(response["plugin_url"]);
    } catch (error) {
        console.error("Error fetching plugin URL:", error);
        throw error;
    }
}

// 스트림 가져오기
export const getCompleteStream = async function* (content) {
    const reference = getReferenceData();
    const url = await getApiUrl() + "/complete";
    const api_key = await getApiKey();

    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': api_key,
    }

    const body = JSON.stringify({
        reference: reference,
        prompt: content,
    })

    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
    })

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8')

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        yield text;
    }
}

// JSON 가져오기
export const getJsonData = async (content, reference = '', route) => {
    const url = await getApiUrl() + "/" + route;
    const api_key = await getApiKey();

    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': api_key,
    }

    const body = JSON.stringify({
        reference: reference,
        prompt: content,
    })

    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
    })

    return response.json().then(data => {
        console.log(data);
        return data.message;
    }
    ).catch(error => {
        console.error("Error fetching JSON data:", error);
        throw error;
    });
};

export const getEnhancedData = async (content) => {
    return getJsonData(content, '', 'enhance');
};

export const getCreatedData = async (content) => {
    return getJsonData(content, getReferenceData(), 'create');
}

