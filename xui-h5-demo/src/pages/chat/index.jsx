import { useState, useRef, useEffect } from "react";
import LeftChat from "../../components/leftChat";
import RightChat from "../../components/rightChat";
import { getUrlParam, getNowDate, scrollToBottom } from "../../utils";
import { Input, Button, Image } from "antd";
import { processStream } from "./chatStreamHandlerNew";
import mpaasManager from "../../utils/multi-mpaas-sdk";
import { initXuiSDK } from "../../utils/initSDK.js";
import style from "./index.less";

const Chat = () => {
  const [userValue, setUserValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [chatList2, setChatList2] = useState([]);
  const [nowChatList, setNowChatList] = useState([]);
  const [nowChatList2, setNowChatList2] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [sessionId2, setSessionId2] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef();
  const chatRef = useRef();
  const chatRef2 = useRef();
  const MPAASXui1Ref = useRef();
  const MPAASXui2Ref = useRef();

  const queryListener = (eventType, data) => {
    console.log("🚀 ~ queryListener ~ data:", eventType, data);
    switch (eventType) {
      case "beforeQuery":
        setChatList((value) => {
          return [...value, ...nowChatList];
        });
        const userChat = [];
        if (data.query) {
          userChat.push({
            type: "USER",
            data: data.query,
            dateTime: getNowDate(),
            prompt: null,
          });
          setNowChatList([
            ...userChat,
            {
              type: "BOT",
              templateType: "loading",
            },
          ]);
        }
        scrollToBottom({ container: document.getElementById("chatContent") });
        break;
      case "streamData":
        processStream(data.result, setNowChatList, setSessionId);
        break;

      case "afterQuery":
        // processStream(data.result, setNowChatList, setSessionId);
        setIsLoading(false);
        break;

      case "queryError":
        setIsLoading(false);
        setNowChatList((values) => {
          const newValues = values.filter((item) => item.templateType !== "loading");
          // 请求失败了，添加一个内容为空的消息
          newValues.push({
            type: "BOT",
            templateType: "TEXT",
            templateData: {
              data: '<span style="color: red;">请求失败，请稍后再试</span>',
            },
          });
          return newValues;
        });
        scrollToBottom({ container: document.getElementById("chatContent") });
        break;
      case "queryAborted":
        setIsLoading(false);
        setNowChatList((values) => {
          const newValues = values.filter((item) => item.templateType !== "loading");
          const includesText = newValues.map((item) => Array.isArray(item) && item.length > 0).includes(true);
          includesText && newValues.pop();
          newValues.push({
            type: "BOT",
            templateType: "TEXT",
            templateData: {
              data: '<span style="color: red;">请求已被取消</span>',
            },
          });
          return newValues;
        });
        scrollToBottom({ container: document.getElementById("chatContent") });
        break;
    }
  };

  const queryListener2 = (eventType, data) => {
    console.log("🚀 ~ queryListener2 ~ data:", eventType, data);
    switch (eventType) {
      case "beforeQuery":
        setChatList2((value) => {
          return [...value, ...nowChatList2];
        });
        const userChat = [];
        if (data.query) {
          userChat.push({
            type: "USER",
            data: data.query,
            dateTime: getNowDate(),
            prompt: null,
          });
          setNowChatList2([
            ...userChat,
            {
              type: "BOT",
              templateType: "loading",
            },
          ]);
        }
        scrollToBottom({ container: document.getElementById("chatContent2") });
        break;
      case "streamData":
        processStream(data.result, setNowChatList2, setSessionId2);
        break;

      case "afterQuery":
        // processStream(data.result, setNowChatList, setSessionId);
        setIsLoading(false);
        break;

      case "queryError":
        setIsLoading(false);
        setNowChatList2((values) => {
          const newValues = values.filter((item) => item.templateType !== "loading");
          // 请求失败了，添加一个内容为空的消息
          newValues.push({
            type: "BOT",
            templateType: "TEXT",
            templateData: {
              data: '<span style="color: red;">请求失败，请稍后再试</span>',
            },
          });
          return newValues;
        });
        scrollToBottom({ container: document.getElementById("chatContent2") });
        break;
      case "queryAborted":
        setIsLoading(false);
        setNowChatList2((values) => {
          const newValues = values.filter((item) => item.templateType !== "loading");
          const includesText = newValues.map((item) => Array.isArray(item) && item.length > 0).includes(true);
          includesText && newValues.pop();
          newValues.push({
            type: "BOT",
            templateType: "TEXT",
            templateData: {
              data: '<span style="color: red;">请求已被取消</span>',
            },
          });
          return newValues;
        });
        scrollToBottom({ container: document.getElementById("chatContent2") });
        break;
    }
  };

  const sendOnClick = async () => {
    setIsLoading(true);
    setUserValue("");

    MPAASXui1Ref.current.query({
      options: {
        // 请求参数
        body: {
          agentId: "bank_agent_1",
          userId: localStorage.getItem("userId") || "mpaas",
          sessionID: sessionId,
          query: userValue,
        },
      },
    });
    MPAASXui2Ref.current.query({
      options: {
        // 请求参数
        body: {
          // agentId: "sop_script_guide_agent_serv",
          agentId: "corporate_chat_agent_service",
          userId: localStorage.getItem("userId") || "mpaas",
          sessionID: sessionId2,
          query: userValue,
        },
      },
    });
  };

  useEffect(() => {
    // 初始化XUI SDK,必须在使用XUI SDK 相关功能（如query、render）之前调用
    initXuiSDK().then(() => {
      MPAASXui1Ref.current = mpaasManager.getInstance("primary");
      MPAASXui2Ref.current = mpaasManager.getInstance("secondary");

      MPAASXui1Ref.current.setQueryCallback(queryListener);
      MPAASXui2Ref.current.setQueryCallback(queryListener2);

      inputRef.current.focus();
    });
  }, []);

  return (
    <div className={style.chatWrapper}>
      <div className={style.chatHeader}>
        <img src="https://mdn.alipayobjects.com/huamei_uvqm8p/afts/img/A*SOQEQLXrOWsAAAAAAAAAAAAADmSBAQ/original.png" />
      </div>
      <div className={style.chatBody}>
        <div id="chatContent" ref={chatRef}>
          {/* 历史对话 */}
          {chatList.map((item, index) => {
            let isText = false;
            if (Array.isArray(item)) {
              isText = item.map((item) => item.templateType === "TEXT" || item.templateType === "CARD").includes(true);
            }
            if (item.type === "BOT" || isText) {
              return <LeftChat MPAASXuiRef={MPAASXui1Ref} useTypewriter={false} key={JSON.stringify(item) + index} data={item} index={index} />;
            } else {
              return <RightChat key={JSON.stringify(item) + index} index={index} data={{ ...item }} />;
            }
          })}
          {/* 当前对话 */}
          {nowChatList.map((item, index) => {
            const id = Math.floor(chatList.length + index);
            let includesText = false;
            if (Array.isArray(item)) {
              includesText = item
                .map(
                  (item) =>
                    item.templateType === "TEXT" || item.templateType === "CARD" || item.templateType === "THINKING" || item.templateType === "HORSE_RIDE",
                )
                .includes(true);
            }
            if (item.type === "BOT" || includesText) {
              return <LeftChat MPAASXuiRef={MPAASXui1Ref} useTypewriter={false} key={id} data={item} index={id} />;
            } else {
              return <RightChat key={id} index={id} data={{ ...item }} />;
            }
          })}
        </div>
        <div id="chatContent2" ref={chatRef2}>
          {/* 历史对话 */}
          {chatList2.map((item, index) => {
            let isText = false;
            if (Array.isArray(item)) {
              isText = item.map((item) => item.templateType === "TEXT" || item.templateType === "CARD").includes(true);
            }
            if (item.type === "BOT" || isText) {
              return <LeftChat MPAASXuiRef={MPAASXui2Ref} useTypewriter={false} key={JSON.stringify(item) + index} data={item} index={index} />;
            } else {
              return <RightChat key={JSON.stringify(item) + index} index={index} data={{ ...item }} />;
            }
          })}
          {/* 当前对话 */}
          {nowChatList2.map((item, index) => {
            const id = Math.floor(chatList.length + index);
            let includesText = false;
            if (Array.isArray(item)) {
              includesText = item
                .map(
                  (item) =>
                    item.templateType === "TEXT" || item.templateType === "CARD" || item.templateType === "THINKING" || item.templateType === "HORSE_RIDE",
                )
                .includes(true);
            }
            if (item.type === "BOT" || includesText) {
              return <LeftChat MPAASXuiRef={MPAASXui2Ref} useTypewriter={false} key={id} data={item} index={id} />;
            } else {
              return <RightChat key={id} index={id} data={{ ...item }} />;
            }
          })}
        </div>
      </div>
      <div
        className={style.chatFooter}
        style={{
          paddingBottom: `${getUrlParam("bottomHeight") || 0}vh`,
          alignItems: "center",
          backdropFilter: "none",
        }}
      >
        <Input
          ref={inputRef}
          value={userValue}
          onChange={(e) => setUserValue(e.target.value)}
          className={style.InputCom}
          placeholder={"输入对话语句后点击发送"}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onPressEnter={(e) => {
            if (!isLoading && e.target.value && e.target.value.trim() && !isComposing) {
              sendOnClick();
            }
          }}
          suffix={
            <Button
              onClick={() => {
                if (!isLoading && userValue && userValue.trim() && !isComposing) {
                  sendOnClick();
                } else {
                  // console.log("🚀 ~ onClick ~ MPAASXui: 触发取消query请求");
                  // MPAASXui.queryAbort();
                }
              }}
              size="small"
              type="primary"
              disabled={isLoading}
            >
              {!isLoading && !!userValue ? (
                <Image preview={false} src="https://mdn.alipayobjects.com/huamei_uvqm8p/afts/img/A*fpyAS4cHCf0AAAAAAAAAAAAADmSBAQ/original.png" />
              ) : (
                <Image preview={false} src="https://mdn.alipayobjects.com/huamei_uvqm8p/afts/img/A*N0bfSa2aRCkAAAAAAAAAAAAADmSBAQ/original.png" />
              )}
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default Chat;
