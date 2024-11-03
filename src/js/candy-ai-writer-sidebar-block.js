/*
  * 블록편집기 사이드바 탭 등록
  */

const { PluginSidebar } = wp.editPost;
const { TabPanel } = wp.components;
const { registerPlugin } = wp.plugins;
const el = wp.element.createElement;

import { icon } from './utils/icon.js';

registerPlugin('candy-ai-tab', {
  title: 'Candy AI Tab',
  category: 'common',
  icon: icon,
  attributes: {
    content: {
      type: 'string',
      default: ''
    }
  },
  render: ({ attributes, setAttributes, isSelected }) => {
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
                  {
                    className: "thumbnail-preview",
                    id: "capture",
                  },
                  el(
                    "ul",
                    { className: "components", id: "comp_opt1" },
                    el("li", {
                      className: "render title",
                    })
                  )
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