// TODO: 拆

import React, { useEffect, useRef } from "react";
import { scrollToBottom, getUrlParam } from "@/utils";
import ReactDOM from "react-dom/client";
import { Spin as AntdSpin } from "antd";

const CardComponent = (props = {}) => {
  const { id, version, data, jsUrl, cssUrl, libraries, onRenderComplete, MPAASXuiRef } = props;

  const containerRef = useRef();

  const renderDom = async () => {
    if (containerRef.current) {
      let nowNumber = 0;
      const timer = setInterval(async () => {
        try {
          const dom = document.createElement("div");
          const root = ReactDOM.createRoot(dom);
          root.render(<AntdSpin />);
          const container = await MPAASXuiRef.current.createContainer(containerRef.current, {
            // loading: "loading...",
            loading: dom,
            direction: "vertical",
          });

          // const cardDomain = window.location.origin + `/webapi/mappcenter/cubecard/resource/getH5ResourceByIdWithDependencies?appId=${appId}&workspaceId=${workspaceId}&tenantId=${tenantId}&templateId=${id}&templateVersion=${version}`;
          // 使用模板ID和版本号渲染卡片
          if (id && version) {
            const options = {
              container,
              cards: [
                {
                  cardInfo: {
                    templateId: id,
                    version: version,
                  },
                  cardData: data,
                },
              ],
              onComplete: () => {
                // 滚动到最底部
                scrollToBottom({ container: document.getElementById("chatContent") });
                // 通知卡片渲染完成
                setTimeout(() => {
                  onRenderComplete?.();
                }, 100);
              },
              onError: (error) => {
                console.error("卡片渲染错误", error);
              },
            };
            await MPAASXuiRef.current.render(options);
            if (timer) {
              clearInterval(timer);
            }
          } else {
            // 使用渲染卡片
            await MPAASXuiRef.current.render({
              container,
              resources: [
                {
                  js: "https://pre-mpaas.mpaascloud.com//ONEXPRE547F7A0261657-default/cubecard/upload/1761128677823/main.umd.cjs",
                  css: "https://pre-mpaas.mpaascloud.com//ONEXPRE547F7A0261657-default/cubecard/upload/1761128677816/main.css",
                  data: {
                    bankCardList: [
                      {
                        back_icon: "https://mdn.alipayobjects.com/huamei_hzlwqu/afts/img/q5j4QJBWj88AAAAAQCAAAAgADoNiAQFr/original",
                        bank_name: "中国银行",
                        card_type: "储蓄卡",
                        branch_name: "杭州高新支行",
                        bank_account: "1234 **** **** 8769",
                      },
                      {
                        back_icon: "https://mdn.alipayobjects.com/huamei_hzlwqu/afts/img/GbMQSJChHpQAAAAAQBAAAAgADoNiAQFr/original",
                        bank_name: "招商银行",
                        card_type: "储蓄卡",
                        branch_name: "杭州高新支行",
                        bank_account: "1234 **** **** 8769",
                      },
                      {
                        back_icon: "https://mdn.alipayobjects.com/huamei_hzlwqu/afts/img/q5j4QJBWj88AAAAAQCAAAAgADoNiAQFr/original",
                        bank_name: "中国银行",
                        card_type: "储蓄卡",
                        branch_name: "杭州高新支行",
                        bank_account: "1234 **** **** 8769",
                      },
                    ],
                  },
                  libraries,
                },
              ],
              onComplete: () => {
                // 滚动到最底部
                scrollToBottom({ container: document.getElementById("chatContent") });
                // 通知卡片渲染完成
                setTimeout(() => {
                  onRenderComplete?.();
                }, 100);
              },
            });
            nowNumber = nowNumber + 1;
            if (timer) {
              clearInterval(timer);
            }
          }
        } catch {
          clearInterval(timer);
        }
      }, 100);
    }
  };

  useEffect(() => {
    renderDom();
  }, [containerRef]);

  return <div className="sdk-test-container" ref={containerRef} />;
};

export default CardComponent;
