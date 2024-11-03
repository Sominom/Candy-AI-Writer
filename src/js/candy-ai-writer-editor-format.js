/*
  * 에디터 포맷 등록
  */

import { icon, enhance_icon } from './utils/icon.js';
import { getCompleteStream, getCredits, getEnhancedData } from './utils/api.js';
import { createPopup } from './utils/popup.js';
import { UndoTemp, BodyContent } from './utils/class.js';
const { Toolbar, ToolbarButton, ToolbarGroup } = wp.components;
const { BlockControls } = wp.blockEditor;
const { registerFormatType } = wp.richText;

const el = wp.element.createElement;


// 자동 완성  
registerFormatType('candy-ai-writer/candy-ai-auto-complete', {
  title: 'Candy AI Auto Complete',
  tagName: 'span',
  className: 'candy-ai-auto-complete',
  edit: ({ isActive, value, onChange }) => {
    const content = new BodyContent(value.text);
    const undoTemp = new UndoTemp(content.getHtml());
    const originalText = value.text;

    let isRunning = false;

    const onToggle = async () => {
      const popup = createPopup({
        titleText: 'Candy AI Writer',
        onClose: () => popup.closePopup(),
        onComplete: async () => {
          const updatedValue = {
            ...value,
            text: popup.popupContent.innerText,
            formats: new Array(popup.popupContent.innerText.length),
            replacements: new Array(popup.popupContent.innerText.length),
            end: popup.popupContent.innerText.length,
          };

          onChange(updatedValue);
          popup.closePopup();
        },
        onContinue: async () => {
          try {
            isRunning = true;
            popup.popupContent.innerHTML = content.getHtml();

            popup.loadingIcon.classList.add('candy-loading-icon');
            for await (const chunk of getCompleteStream(content.get())) {
              popup.popupContent.innerHTML += chunk;
              content.append(chunk);
            }


          } catch (error) {
            popup.popupContent.innerHTML = `<span style='color:red'>Error: ${error.message}</span>`;
          } finally {
            popup.loadingIcon.classList.remove('candy-loading-icon');
            undoTemp.push(content.getHtml());
            popup.myCredits.innerText = await getCredits();
            isRunning = false;

          }
        },
        onUndo: () => {
          if (isRunning) return;

          undoTemp.pop();
          if (undoTemp.get()) {
            content.set(undoTemp.get());
            popup.popupContent.innerHTML = content.getHtml();
          }
          else {
            content.set(originalText);
            popup.popupContent.innerHTML = content.getHtml();
          }
        },
      });
      try {
        popup.popupContent.innerHTML = content.getHtml();
        popup.myCredits.innerText = await getCredits();

      } catch (error) {
        popup.popupContent.innerHTML = `<span style='color:red'>Error: ${error.message}</span>`;
      }
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
  },
});

// 향상  
registerFormatType('candy-ai-writer/candy-ai-enhance', {
  title: 'Candy AI Enhance',
  tagName: 'span',
  className: 'candy-ai-enhance',
  edit: ({ isActive, value, onChange }) => {
    // start와 end가 같거나 전체 텍스트가 선택된 경우
    const isFullBlockSelected = value.start === value.end || 
                              value.text === value.text.substring(value.start, value.end);
    
    // 전체 블록이면 전체 텍스트 사용
    const content = new BodyContent(isFullBlockSelected ? value.text : value.text.substring(value.start, value.end));
    const undoTemp = new UndoTemp(content.getHtml());

    let isRunning = false;

    const onToggle = async () => {
      const popup = createPopup({
        titleText: 'Candy AI Enhance Tool',
        onClose: () => popup.closePopup(),
        onComplete: async () => {
          const newContent = popup.popupContent.innerText;
          
          // 전체 블록 처리
          if (isFullBlockSelected) {
            const updatedValue = {
              ...value,
              text: newContent,
              formats: new Array(newContent.length),
              replacements: new Array(newContent.length),
              start: 0,
              end: newContent.length
            };
            onChange(updatedValue);
          } else {
            // 부분 선택 처리
            const newTextLength = value.text.length - (value.end - value.start) + newContent.length;
            const updatedValue = {
              ...value,
              text: value.text.substring(0, value.start) + newContent + value.text.substring(value.end),
              formats: new Array(newTextLength),
              replacements: new Array(newTextLength),
              end: value.start + newContent.length
            };
            onChange(updatedValue);
          }
          
          popup.closePopup();
        },
        onContinue: async () => {
          try {
            isRunning = true;
            popup.loadingIcon.classList.add('candy-loading-icon');
            popup.popupContent.innerHTML = await getEnhancedData(content.get());
          } catch (error) {
            popup.popupContent.innerHTML = `<span style='color:red'>Error: ${error.message}</span>`;
          } finally {
            popup.loadingIcon.classList.remove('candy-loading-icon');
            undoTemp.push(popup.popupContent.innerHTML);
            isRunning = false;
            popup.myCredits.innerText = await getCredits();
          }
        },
        onUndo: () => {
          if (isRunning) return;
          undoTemp.pop();
          
          if (undoTemp.get()) {
            popup.popupContent.innerHTML = undoTemp.get();
          }
          else {
            popup.popupContent.innerHTML = content.getHtml();
          }
        },
      });
      
      try {
        popup.popupContent.innerHTML = content.getHtml();
        popup.myCredits.innerText = await getCredits();
      } catch (error) {
        popup.popupContent.innerHTML = `<span style='color:red'>Error: ${error.message}</span>`;
      }
    };

    return el(BlockControls, null,
      el(Toolbar, {
        isCollapsed: false
      },
        el(ToolbarGroup, null,
          el(ToolbarButton, {
            icon: enhance_icon,
            title: 'Candy AI Enhance',
            onClick: onToggle,
            isActive: isActive,
          })
        ),
      )
    );
  },
});