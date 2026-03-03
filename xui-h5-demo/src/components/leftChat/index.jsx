import React, { useEffect, useState, useRef, useMemo } from "react";
import style from "./index.less";
import CardComponent from "../card";
import { getUrlParam } from "../../utils";
import ShowMessage from "../ShowMessage";
import Loading from "../card/loading";

const cardTypeList = ["recommended", "oneRecommend", "shijianshaixuan", "liebiaozhanshi", "base_datetime_one_selecter"];
//无背景
const notStyleTypeList = ["leftBubble1"];

const OnlyDom = ({ data, onRenderComplete, MPAASXuiRef }) => {
  const [id, setId] = useState(null);
  const [version, setVersion] = useState(null);
  const [innerData, setInnerData] = useState(null);
  const [url, setUrl] = useState(null);
  const [cssUrl, setCssUrl] = useState(null);
  const [libraries, setLibraries] = useState(null);
  const [cardData, setCardData] = useState(null);

  const getCardData = async () => {
    if (data?.templateId && data?.templateVersion) {
      try {
        setId(data?.templateId);
        setVersion(data?.templateVersion);
        const cardData = JSON.parse(data?.templateData?.data || "{}");
        setInnerData(cardData);
      } catch (error) {
        setInnerData({});
      }
    } else {
      setUrl(data?.data?.url);
      setCssUrl(data?.data?.cssUrl);
      setLibraries(data?.data?.libraries);
      setCardData(data?.data?.data);
    }
  };

  useEffect(() => {
    getCardData();
  }, [data]);

  return (
    <>
      {id && version && <CardComponent MPAASXuiRef={MPAASXuiRef} id={id} version={version} data={innerData} onRenderComplete={onRenderComplete} />}
      {url && (
        <CardComponent MPAASXuiRef={MPAASXuiRef} jsUrl={url} cssUrl={cssUrl} data={cardData || {}} libraries={libraries} onRenderComplete={onRenderComplete} />
      )}
    </>
  );
};

const LeftChat = ({ data, index, isNow, useTypewriter, MPAASXuiRef }) => {
  // 使用 useMemo 缓存数据处理结果
  const { dataItem, domData } = useMemo(() => {
    let dataItem = null;
    let domData = null;
    let dataType = null;

    if (Array.isArray(data)) {
      dataItem = data[0];
      domData = data;
    } else {
      dataItem = data;
      domData = [data];
    }

    return { dataItem, domData, dataType };
  }, [JSON.stringify(data)]);

  // 流式渲染状态
  const [visibleElements, setVisibleElements] = useState([]);
  const isStreamingRef = useRef(false);
  const renderedElementsRef = useRef(new Set());
  const currentElementIndexRef = useRef(0);

  // 开始流式渲染
  useEffect(() => {
    // 只有当 useTypewriter 为 true 时才使用流式渲染
    if (useTypewriter && domData && domData.length > 0 && !isStreamingRef.current) {
      isStreamingRef.current = true;
      setVisibleElements([]);
      renderedElementsRef.current = new Set();
      currentElementIndexRef.current = 0;

      const streamElements = async () => {
        for (let i = 0; i < domData.length; i++) {
          const item = domData[i];

          // 添加当前元素到可见列表
          setVisibleElements((prev) => [...prev, { item, index: i }]);
          currentElementIndexRef.current = i;

          // 等待当前元素渲染完成
          await new Promise((resolve) => {
            const checkRenderComplete = () => {
              if (renderedElementsRef.current.has(i)) {
                resolve();
              } else {
                setTimeout(checkRenderComplete, 50);
              }
            };

            // 开始检查渲染完成
            setTimeout(checkRenderComplete, 100);
          });
        }

        isStreamingRef.current = false;
      };

      streamElements();
    } else if (!useTypewriter && domData && domData.length > 0) {
      // 如果不使用流式渲染，直接显示所有元素
      setVisibleElements(domData.map((item, index) => ({ item, index })));
    }
  }, [domData, useTypewriter]);

  // 处理单个元素渲染完成
  const handleElementRenderComplete = (elementIndex) => {
    renderedElementsRef.current.add(elementIndex);
  };

  //逐字输出文本
  const getTextDom = (item, elementIndex) => {
    return (
      <div>
        {/* 渲染正文内容 */}
        <div className={style.leftChatItemText}>
          <ShowMessage
            MPAASXuiRef={MPAASXuiRef}
            useTypewriter={useTypewriter}
            message={item?.templateData?.data}
            onRenderComplete={
              useTypewriter
                ? () => {
                    handleElementRenderComplete(elementIndex);
                  }
                : undefined
            }
          />
        </div>
      </div>
    );
  };
  const styles = {};
  if (dataItem?.tmplType === "leftBubble") {
    styles.backgroundColor = "rgba(0,0,0,0)";
    styles.border = "none";
  }

  return (
    <>
      {dataItem?.tmplType === "recommended" && (
        <div className={style.chatTextLeft} id={`chat_${index}`}>
          <div className={style.leftBody}>
            <div className={style.topTime}>
              <img src="https://mdn.alipayobjects.com/huamei_uvqm8p/afts/img/A*SOQEQLXrOWsAAAAAAAAAAAAADmSBAQ/original.png" />
              {getUrlParam("agentId") == "542" ? "Service Maestro" : "Xiao Xi"}
            </div>
            <div className={style.leftContent}>
              <div
                className={style.leftChatItemText}
                dangerouslySetInnerHTML={{
                  __html: "已帮您推荐相关服务:",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
      <div className={style.chatTextLeft} id={`chat_${index}`}>
        <div className={style.leftBody}>
          <div className={style.topTime}>
            <img src="https://mdn.alipayobjects.com/huamei_uvqm8p/afts/img/A*SOQEQLXrOWsAAAAAAAAAAAAADmSBAQ/original.png" />
            {getUrlParam("agentId") == "542" ? "Service Maestro" : "Xiao Xi"}
          </div>
          <div
            className={`${style.leftContent} 
              ${cardTypeList.indexOf(dataItem?.tmplType) > -1 ? style.card : notStyleTypeList.indexOf(dataItem?.tmplType) > -1 ? style.notStyle : ""}`}
            style={styles}
          >
            {visibleElements.map(({ item, index: elementIndex }) => {
              if (item.templateType === "HORSE_RIDE") {
                // 跑马灯类型，渲染跑马灯内容
                if (useTypewriter) {
                  setTimeout(() => {
                    handleElementRenderComplete(elementIndex);
                  }, 200);
                }
                if (item.horseRideContent?.data === "") {
                  return null;
                }

                // 判断是否还在处理中（通过检查是否有思考内容或正文内容来判断）
                const isStillProcessing = !item.isCompleted;

                return (
                  <div key={elementIndex} style={{ marginBottom: "10px" }}>
                    <div
                      className={style.leftChatItemText}
                      style={{
                        fontSize: "14px",
                        color: "#999",
                        fontStyle: "italic",
                        backgroundColor: "#f0f8ff",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #b3d9ff",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#1890ff",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            border: "2px solid #1890ff",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            marginRight: "6px",
                            animation: isStillProcessing ? "spin 1s linear infinite" : "none",
                          }}
                        />
                        {item.horseRideContent?.data || "处理中..."}
                      </div>
                      {item.horseRideContent?.plans && item.horseRideContent.plans.length > 0 && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "11px",
                            color: "#999",
                          }}
                        >
                          {item.horseRideContent.plans.map((plan, planIndex) => (
                            <div key={planIndex} style={{ marginBottom: "4px" }}>
                              • {plan}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              if (item.templateType === "TEXT") {
                return (
                  <div key={elementIndex} style={{ marginBottom: "10px" }}>
                    {getTextDom(item, elementIndex)}
                  </div>
                );
              }
              if (item.templateType === "THINKING") {
                // 思考类型，渲染思考内容
                if (useTypewriter) {
                  setTimeout(() => {
                    handleElementRenderComplete(elementIndex);
                  }, 200);
                }
                if (item.thinkingContent?.data === "") {
                  return null;
                }
                return (
                  <div key={elementIndex} style={{ marginBottom: "10px" }}>
                    <div
                      className={style.leftChatItemText}
                      style={{
                        fontSize: "14px",
                        color: "#999",
                        fontStyle: "italic",
                        backgroundColor: "#f8f9fa",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6c757d",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        💭 {item.thinkingContent?.thinkingType === "COT" ? "思考内容" : "分析中..."}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          lineHeight: "1.5",
                        }}
                      >
                        {item.thinkingContent?.data || ""}
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.templateType === "loading") {
                // loading 类型立即完成渲染
                if (useTypewriter) {
                  setTimeout(() => {
                    handleElementRenderComplete(elementIndex);
                  }, 200);
                }
                return <Loading key={elementIndex} text="加载中..." />;
              }
              if (item.templateType === "CARD") {
                return (
                  <OnlyDom
                    key={elementIndex}
                    data={item}
                    onRenderComplete={
                      useTypewriter
                        ? () => {
                            handleElementRenderComplete(elementIndex);
                          }
                        : undefined
                    }
                    MPAASXuiRef={MPAASXuiRef}
                  />
                );
              }
              // 处理其他类型的元素
              if (item.templateType && item.templateType !== "loading") {
                // 其他类型元素立即完成渲染
                if (useTypewriter) {
                  handleElementRenderComplete(elementIndex);
                }
                return null;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftChat;
