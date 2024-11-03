/*
  * 블록 편집기 블록 등록
  */

import { icon, create_icon, undo_icon, confirm_icon, loading_icon } from './utils/icon.js';
import { getCreatedData } from './utils/api.js';
import { UndoTemp } from './utils/class.js';
const { Toolbar, ToolbarButton, ToolbarGroup } = wp.components;
const { registerBlockType } = wp.blocks;
const { useState, useRef } = wp.element;
const { RichText, BlockControls } = wp.blockEditor;
const el = wp.element.createElement;


registerBlockType('candy-ai-writer/candy-ai-creater', {
  title: 'Candy AI Create',
  tagName: 'span',
  className: 'candy-ai-create',
  icon: icon,
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
    const undoTempRef = useRef(new UndoTemp(attributes.content));
    const undoTemp = undoTempRef.current;


    const [isLoading, setIsLoading] = useState(false);

    const createBlock = async () => {

      if (isLoading) return;

      setIsLoading(true);
      let prompt = attributes.content || "";

      try {
        if (!prompt) {
          throw new Error("생성할 내용을 입력하세요.");
        }
        const createdData = await getCreatedData(prompt);
        undoTemp.push(createdData);
        setAttributes({ content: createdData });
      } catch (error) {
        console.error('Creation failed:', error);
        setAttributes({
          content: `Error: ${error.message || 'Failed to generate content'}`
        });
      } finally {
        setIsLoading(false);
      }
    };

    const undoBlock = () => {
      undoTemp.pop();
      console.log(undoTemp);
      setAttributes({
        content: undoTemp.get()
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
      undoTemp.push(content);
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
          placeholder: '생성할 내용을 입력하세요.',
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