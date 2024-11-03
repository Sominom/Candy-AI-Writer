import { icon, create_icon, confirm_icon, loading_icon, undo_icon, organization_icon } from './icon.js';
const {
  registerBlockType
} = wp.blocks;

const {
  dispatch
} = wp.data;
const {
  registerFormatType
} = wp.richText;
const {
  BlockControls
} = wp.editor;
const {
  Toolbar,
  ToolbarButton,
  ToolbarGroup
} = wp.components;
const {
  toggleFormat
} = wp.richText;

const {
  createBlock,
  parse
} = wp.blocks;

const {
  RichText
} = wp.blockEditor


const API_URL = 'https://api.candebugger.net/';


const get_user_data = () => {
  return new Promise((resolve, reject) => {
    jQuery(document).ready(function ($) {
      $.ajax({
        url: ajax_object.ajax_url,
        type: "POST",
        data: {
          action: "get_api_key_and_email",
        },
        success: function (response) {
          //console.log("success :", response);
          resolve(response);
        },
        error: function (error) {
          //console.error("error :", error);
          reject(error);
        },
      });
    });
  });
};

const get_site_domain = () => {
  return new Promise((resolve, reject) => {
    jQuery(document).ready(function ($) {
      $.ajax({
        url: ajax_object.ajax_url,
        type: "POST",
        data: {
          action: "get_site_domain",
        },
        success: function (response) {
          console.log("success :", response);
          resolve(response);
        },
        error: function (error) {
          console.error("error :", error);
          reject(error);
        },
      });
    });
  });
};

const get_credits_data = async (api_key, email) => {
  try {
    const response = await fetch(API_URL + 'get_credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: api_key,
        email: email
      }),
    });

    const data = await response.json();
    console.log(data);
    return data.credits;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

const get_json_data = async (api_key, email, text, endpoint) => {
  try {
    const reference = get_reference_data();
    const response = await Promise.race([
      fetch(API_URL + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: api_key,
          email: email,
          prompt: text,
          reference: reference,
        }),
      }),
      new Promise((resolve, reject) => setTimeout(() => reject('Timeout'), 60000))
    ]);

    const data = await response.json();
    console.log(data);
    return data.response;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

const get_stream_response = async (api_key, email, text, endpoint) => {
  const reference = get_reference_data();
  const response = fetch(API_URL + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: api_key,
      email: email,
      prompt: text,
      reference: reference,
    }),
  });
  return response;
};

const get_reference_data = () => {
  const reference_text_control_container = document.getElementsByClassName('reference-text-control-container')[0];
  if (reference_text_control_container) {
    const textarea = reference_text_control_container.getElementsByTagName('textarea')[0];
    if (textarea) {
      return textarea.value;
    }
  }
  return "";
}

registerFormatType('candy-ai-writer/candy-ai-auto-complete', {
  title: 'Candy AI Auto Complete',
  tagName: 'span',
  className: 'candy-ai-auto-complete',
  edit: ({
    isActive,
    value,
    onChange
  }) => {
    const onToggle = async () => {
      const auto_start = true;
      const pointing_tag = "[Pointing]"
      let is_running = false;
      let is_get_content = false;
      let popup_content = document.createElement('div');
      popup_content.classList.add('candy-popup-content');

      const overlay = document.createElement('div');
      overlay.classList.add('candy-overlay');

      const popup = document.createElement('div');
      popup.classList.add('candy-popup');

      const popup_header = document.createElement('div');
      popup_header.classList.add('candy-popup-header');

      const popup_body = document.createElement('div');
      popup_body.classList.add('candy-popup-body');
      popup_body.style.overflow = 'auto';
      popup_body.style.scrollBehavior = 'smooth';

      const popup_footer = document.createElement('div');
      popup_footer.classList.add('candy-popup-footer');

      const closeButton = document.createElement('button');
      closeButton.classList.add('candy-button', 'close-button');
      closeButton.textContent = '닫기';

      const completeButton = document.createElement('button');
      completeButton.classList.add('candy-button', 'complete-button');
      completeButton.textContent = '완료';

      const undoButton = document.createElement('button');
      undoButton.classList.add('candy-undo-button');

      const continueButton = document.createElement('button');
      continueButton.classList.add('candy-continue-button');

      const loading_icon = document.createElement('div');

      const candy_icon = document.createElement('div');
      candy_icon.classList.add('candy-icon');

      const my_credits = document.createElement('div');
      my_credits.classList.add('candy-my-credits');
      my_credits.innerText = 0;
      //팝업에 제목 추가
      const title = document.createElement('h2');
      title.classList.add('popup-title');
      title.textContent = 'Candy AI Writer';

      popup_header.appendChild(title);
      popup_header.appendChild(continueButton);
      popup_header.appendChild(undoButton);
      popup_header.appendChild(candy_icon);
      popup_header.appendChild(my_credits);

      popup_body.appendChild(popup_content);
      popup_footer.appendChild(completeButton);
      popup_footer.appendChild(closeButton);

      popup.appendChild(loading_icon);
      popup.appendChild(popup_header);
      popup.appendChild(popup_body);
      popup.appendChild(popup_footer);

      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      async function get_previous_contents(str, limit = 4) {
        const contents = [];
        const blocks = wp.data.select('core/block-editor').getBlocks();
        console.log(blocks);
        let FirstBlockStrIndex = -1;
        let SecondBlockStrIndex = -1;
        let content_type = "";
        // 블록 찾기
        blocks.forEach((block, i) => {
          if ((block.name === "core/list" || block.name === "core/quote")) {
            if (block.attributes.citation === str) {
              FirstBlockStrIndex = i + 1;
              content_type = block.name;
            }
            block.innerBlocks.forEach((innerBlock, j) => {
              if (innerBlock.attributes.content === str) {
                FirstBlockStrIndex = i;
                SecondBlockStrIndex = j;
                content_type = block.name;
              }
            });
          } else if (block.attributes.content === str && !block.attributes.content.startsWith("<img")) {
            FirstBlockStrIndex = i;
            content_type = block.name;
          }
        });

        if (FirstBlockStrIndex === -1) return ""; // 찾는 블록이 없으면 빈 문자열 반환
        else SecondBlockStrIndex = SecondBlockStrIndex + 1;
        let count = 0;

        for (let i = FirstBlockStrIndex; i >= 0 && count < limit; i--) {
          const block = blocks[i];
          if (block.name === "core/list" || block.name === "core/quote") {
            let innerContent = block.innerBlocks;
            let inner_content_text = "";
            for (let j = 0; j < innerContent.length; j++) {
              if (i === FirstBlockStrIndex && j === SecondBlockStrIndex) break;
              else if (block.name === "core/list") {
                if (innerContent[j].attributes.content == pointing_tag) inner_content_text += j + 1 + '. ';
                else inner_content_text += (j + 1 + ". " + innerContent[j].attributes.content) + "<br>";
              } else if (block.name === "core/quote") {
                if (innerContent[j].attributes.content == pointing_tag) inner_content_text += '"';
                else inner_content_text += ('"' + innerContent[j].attributes.content + '"') + "<br>";
              }
            }
            if (block.attributes.citation) {
              if (block.attributes.citation == pointing_tag) inner_content_text += '<br>';
              else inner_content_text += ('- ' + block.attributes.citation);
            }
            contents.push(inner_content_text);
          } else if (block.attributes.content && !block.attributes.content.startsWith("<")) {
            contents.push(block.attributes.content);
            count++;
          }
        }
        if (contents.length === 0) return value.text, "core/paragraph";
        return [contents.reverse().join("<br>"), content_type];
      }

      async function get_content(str, limit) {
        let is_get_content = true;
        let response = [];
        let last_content = "";
        let content_type = "";

        if (!str) {
          console.log('value:', value)
          // formats: Array(0)
          let updatedValue = {
            ...value,
            text: pointing_tag,
            formats: Array(pointing_tag.length),
            replacements: Array(pointing_tag.length)
          };
          console.log('str:', str);
          console.log('updatedValue1:', value);
          onChange(updatedValue);
          console.log('updatedValue2:', value);
          response = await get_previous_contents(pointing_tag, limit);
          last_content = response[0];
          content_type = response[1];
          onChange({
            ...value,
            text: ""
          });
          console.log('updatedValue3:', value);
        } else {
          // 문자열이 있는 경우 처리
          response = await get_previous_contents(str, limit);
          last_content = response[0];
          content_type = response[1];
        }
        is_get_content = false;
        return [last_content ? last_content : "", content_type];
      }

      popup_content.innerHTML = '<span style="color:black;">Loading...</span>';
      const user_data = await get_user_data();
      const api_key = user_data['api_key'];
      const email = user_data['email'];
      const site_domain = await get_site_domain();

      let response = await get_content(value.text, 4);
      let content = response[0];
      let content_type = response[1];
      let undo_temp = [];
      let content_temp = content;

      console.log('content:', content);
      console.log('site_domain:', site_domain);
      console.log('email:', email);
      console.log('api_key:', api_key);

      popup_content.innerHTML = "<span style='color:black'>" + content + "</span>";

      my_credits.innerText = await get_credits_data(api_key, email);

      // StreamingResponse: get_response_data();
      const get_response_data = async () => {
        while (is_get_content) {
          await new Promise(r => setTimeout(r, 100));
        }
        is_running = true;
        let full_text = "";
        try {
          const response = await get_stream_response(api_key, email, content, 'complete');
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let result = '';
          loading_icon.classList.add('candy-loading-icon');
          while (true) {
            const {
              done,
              value
            } = await reader.read();
            if (done) {
              break;
            }
            let decodedValue = decoder.decode(value);

            if (decodedValue.includes('message')) {
              let json = JSON.parse(decodedValue);
              popup_content.innerHTML = `Error: ${json['message']}`;
              break;
            }
            popup_content.innerHTML += decodedValue;
            full_text += decodedValue;
          }
          loading_icon.classList.remove('candy-loading-icon');
          my_credits.innerText = await get_credits_data(api_key, email);
          undo_temp.push(full_text)
          is_running = false;
          return result;
        } catch (error) {
          console.log(error);
          loading_icon.classList.remove('candy-loading-icon');
          is_running = false;
        }
      };

      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        undo_temp = [];
      });

      completeButton.addEventListener('click', () => {
        if (is_running) return;
        let complete_content = value.text;
        for (let i = 0; i < undo_temp.length; i++) {
          complete_content += undo_temp[i]
        }
        complete_content = complete_content.replace(/<br>/g, '\n');
        const updatedValue = {
          ...value,
          text: complete_content
        };
        updatedValue.formats.length = complete_content.length
        dispatch('core/editor').editPost({
          content: complete_content
        });
        onChange(updatedValue);
        document.body.removeChild(overlay);
        undo_temp = [];
      });

      undoButton.addEventListener('click', () => {
        if (is_running) return;
        if (undo_temp.length > 0) {
          let undo_text = content_temp;
          for (let i = 0; i < undo_temp.length - 1; i++) {
            undo_text += undo_temp[i]
          }
          undo_temp.pop();
          content = undo_text
          popup_content.innerHTML = "<span style='color:black'>" + undo_text + "</span>";
          console.log(undo_temp);
        }
      });


      continueButton.addEventListener('click', () => {
        if (is_running) return;
        let continue_text = content_temp;
        for (let i = 0; i < undo_temp.length; i++) {
          continue_text += undo_temp[i];
        }
        content = continue_text;
        popup_content.innerHTML = "<span style='color:black'>" + continue_text + "</span>";
        loading_icon.classList.add('candy-loading-icon');
        get_response_data();
        console.log(undo_temp);
      });

      if (auto_start) await get_response_data();

    };


    return el(BlockControls, null,
      el(Toolbar, {
          isCollapsed: false
        },
        el(ToolbarGroup, null,
          el(ToolbarButton, {
            icon: icon,
            title: 'Candy AI Button',
            onClick: onToggle,
            isActive: isActive,
          })
        ),
      )
    );
  }
});

registerFormatType('candy-ai-writer/candy-ai-organization', {
  title: 'Candy AI Organization',
  tagName: 'span',
  className: 'candy-ai-organization',
  edit: ({
    isActive,
    value,
    onChange
  }) => {
    const onToggle2 = async () => {
      const auto_start = true;
      let content = value.text;

      const overlay = document.createElement('div');
      overlay.classList.add('candy-overlay');

      const popup = document.createElement('div');
      popup.classList.add('candy-popup');

      const popup_header = document.createElement('div');
      popup_header.classList.add('candy-popup-header');

      const popup_body = document.createElement('div');
      popup_body.classList.add('candy-popup-body');
      popup_body.style.textAlign = 'center';
      popup_body.style.justifyContent = 'center';

      const popup_footer = document.createElement('div');
      popup_footer.classList.add('candy-popup-footer');

      const promptForm = document.createElement('form');
      promptForm.classList.add('candy-prompt-form');

      const beforeDiv = document.createElement('div');
      beforeDiv.classList.add('candy-div');
      beforeDiv.style.marginRight = '15px';
      const arrow_icon = document.createElement('div');
      arrow_icon.classList.add('arrow-icon');

      const afterDiv = document.createElement('div');
      afterDiv.classList.add('candy-div');
      afterDiv.style.marginLeft = '15px';
      const closeButton = document.createElement('button');
      closeButton.classList.add('candy-button', 'close-button');
      closeButton.textContent = '닫기';

      const completeButton = document.createElement('button');
      completeButton.classList.add('candy-button', 'complete-button');
      completeButton.textContent = '완료';

      const generateButton = document.createElement('button');
      generateButton.classList.add('candy-undo-button');

      const loading_icon = document.createElement('div');

      const candy_icon = document.createElement('div');
      candy_icon.classList.add('candy-icon');

      const my_credits = document.createElement('div');
      my_credits.classList.add('candy-my-credits');
      my_credits.innerText = 0;

      //팝업에 제목 추가
      const title = document.createElement('h2');
      title.classList.add('popup-title');
      title.textContent = 'Candy AI Organization Tool';

      popup_header.appendChild(title);
      popup_header.appendChild(generateButton);
      popup_header.appendChild(candy_icon);
      popup_header.appendChild(my_credits);

      popup_body.appendChild(beforeDiv);
      popup_body.appendChild(arrow_icon);
      popup_body.appendChild(afterDiv);

      popup_footer.appendChild(completeButton);
      popup_footer.appendChild(closeButton);
      popup_footer.appendChild(loading_icon)

      popup.appendChild(loading_icon);
      popup.appendChild(popup_header);
      popup.appendChild(popup_body);
      popup.appendChild(popup_footer);

      overlay.appendChild(popup);
      document.body.appendChild(overlay);
      beforeDiv.innerHTML = 'Loading...';
      const user_data = await get_user_data();
      const api_key = user_data['api_key'];
      const email = user_data['email'];
      const site_domain = await get_site_domain();
      let organizationData = "";
      console.log('content:', content);
      console.log('site_domain:', site_domain);
      console.log('email:', email);
      console.log('api_key:', api_key);



      beforeDiv.innerHTML = content;

      my_credits.innerText = await get_credits_data(api_key, email);

      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });

      completeButton.addEventListener('click', () => {
        organizationData = organizationData.replace(/<br>/g, '\n');
        const updatedValue = {
          ...value,
          text: organizationData,
          formats: Array(organizationData.length),
        };
        onChange(updatedValue);

        document.body.removeChild(overlay);
      });

      generateButton.addEventListener('click', async () => {
        loading_icon.classList.add('candy-loading-icon');
        afterDiv.innerHTML = "";
        try {
          organizationData = await get_json_data(api_key, email, content, 'organization');
          if (organizationData !== "") {
            afterDiv.innerHTML = organizationData;
            console.log(organizationData);
          }
        } catch (error) {
          console.error(error);
          afterDiv.innerHTML = "Error occurred while generating organization data.";
        }
        loading_icon.classList.remove('candy-loading-icon');
      });

    };

    return el(BlockControls, null,
      el(Toolbar, {
          isCollapsed: false
        },
        el(ToolbarGroup, null,
          el(ToolbarButton, {
            icon: organization_icon,
            title: 'Candy AI Button 2',
            onClick: onToggle2,
            isActive: isActive,
          })
        ),
      )
    );
  }
});

registerBlockType('candy-ai-writer/candy-ai-creater', {
  title: 'Candy AI Create',
  tagName: 'span',
  className: 'candy-ai-create',
  keywords: ['candy', 'ai', 'creater', 'create', '캔디', '생성'],
  attributes: {
    content: {
      type: 'string',
      default: ''
    }
  },
  edit: ({
    attributes,
    setAttributes,
    isActive
  }) => {
    const [isLoading, setIsLoading] = useState(false);

    const createBlock = async () => {
      console.log('isLoading', isLoading)
      await setIsLoading(true);
      console.log('isLoading', isLoading)
      const user_data = await get_user_data();
      const api_key = user_data['api_key'];
      const email = user_data['email'];
      const site_domain = await get_site_domain();
      let prompt = attributes.content || "";

      try {
        if (prompt !== "") {
          const createdData = await get_json_data(api_key, email, prompt, 'create');
          setAttributes({
            content: createdData
          });
        }
      } catch (error) {
        console.error(error);
        setAttributes({
          content: "Error occurred while generating create data."
        });
      }
      setIsLoading(false);
    };

    const undoBlock = () => {
      setAttributes({
        content: ""
      });
    };

    const confirmBlock = () => {
      const {
        content
      } = attributes;
      const blocks = wp.blocks.rawHandler({
        HTML: content
      });
      const {
        replaceBlocks
      } = wp.data.dispatch('core/block-editor');
      replaceBlocks(wp.data.select('core/block-editor').getSelectedBlockClientId(), blocks);
    };

    return (
      el(React.Fragment, null,
        el(RichText, {
          tagName: 'span',
          className: 'candy-ai-create',
          value: attributes.content,
          onChange: (newContent) => setAttributes({
            content: newContent
          }),
          placeholder: 'Enter prompt here'
        }),
        el(BlockControls, null,
          el(Toolbar, {
              isCollapsed: false
            },
            el(ToolbarGroup, null,
              el(ToolbarButton, {
                icon: isLoading ? loading_icon : create_icon,
                title: 'Create',
                onClick: createBlock,
                isActive: isActive,
              }),
              el(ToolbarButton, {
                icon: undo_icon,
                title: 'Undo',
                onClick: undoBlock,
                isActive: isActive,
              }),
              el(ToolbarButton, {
                icon: confirm_icon,
                title: 'Confirm',
                onClick: confirmBlock,
                isActive: isActive,
              })
            )
          )
        )
      )
    );
  }
});