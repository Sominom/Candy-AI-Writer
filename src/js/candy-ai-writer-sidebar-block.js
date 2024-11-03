const { useState, useEffect, useRef } = wp.element;
const { useDispatch, useSelect } = wp.data;
const { PluginSidebar } = wp.editPost;
const { TabPanel } = wp.components;
const { registerPlugin } = wp.plugins;
const el = wp.element.createElement;

import { icon } from './utils/icon.js';
import { setReferenceToPostMeta, getReferenceFromPostMeta } from './utils/api.js';

registerPlugin('candy-ai-tab', {
  title: 'Candy AI Tab',
  category: 'common',
  icon: icon,
  render: () => {
    const [reference, setReference] = useState('');

    const { editPost } = useDispatch('core/editor');
    const postId = useSelect(select => select('core/editor').getCurrentPostId());

    const isSavingPost = useSelect(select => select('core/editor').isSavingPost());
    const wasSavingPost = useRef(isSavingPost);

    useEffect(() => {
      // 글이 처음 로드될 때 메타에서 레퍼런스 데이터를 가져옴
      const fetchReference = async () => {
        const metaReference = await getReferenceFromPostMeta(postId);
        setReference(metaReference);
      };
      fetchReference();
    }, [postId]);

    useEffect(() => {
      if (wasSavingPost.current && !isSavingPost) {
        // 포스트가 방금 저장되었을 때 실행
        setReferenceToPostMeta(postId, reference);
      }
      wasSavingPost.current = isSavingPost;
    }, [isSavingPost]);

    const handleReferenceChange = (value) => {
      setReference(value);
      editPost({ meta: { reference: value } }); // 글을 수정 상태로 만듦
    };

    return el(
      PluginSidebar,
      {
        name: 'candy-ai-writer-sidebar',
        title: 'Candy AI Writer',
      },
      el(TabPanel, {
        className: "candy-tab-panel",
        activeClass: "active-tab",
        tabs: [
          {
            name: "thumbnail-creator",
            title: "Thumbnail Creator",
            className: "candy-tab",
          },
          {
            name: "ai-reference",
            title: "AI Reference",
            className: "candy-tab",
          },
        ],
        children: (tab) => {
          switch (tab.name) {
            case "thumbnail-creator":
              return el(
                "div",
                { className: "candy-tab-content" },
                el(
                  "div",
                  { className: "candy-thumbnail-creator" },
                  el("p", null, "준비 중입니다.")
                )
              );
            case "ai-reference":
              return el(
                "div",
                { className: "candy-tab-content" },
                el(
                  'textarea',
                  {
                    className: "candy-ai-reference",
                    value: reference,
                    onChange: (e) => handleReferenceChange(e.target.value)
                  }
                )
              );
            default:
              return null;
          }
        }
      })
    );
  },
});

