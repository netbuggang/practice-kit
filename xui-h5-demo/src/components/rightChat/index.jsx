import React from 'react';
import style from './index.less';
import { getFooterData } from '../../utils/chat';
import { UserOutlined } from '@ant-design/icons';

const RightChat = (props) => {
  const { data, id, index } = props;
  return (
    <div className={style.chatTextRight} id={id || `chat_${index}`}>
      <div className={style.rightBody}>
        {data.dateTime && <div className={style.topTime}>{data.dateTime}</div>}
        <div className={style.rightContent}>
          {data.data}
        </div>
        {/* {
          !!data.prompt && (<UserOutlined className={style.footerText} />)
        } */}
      </div>
    </div>
  );
};

export default RightChat;

/* <a className={style.footerText}>{getFooterData(data.prompt)}</a> */