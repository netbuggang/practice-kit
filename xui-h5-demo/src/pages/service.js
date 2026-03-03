import axios from 'axios';
import { getUrlParam } from '../utils';
import { fetchEventSource } from "@microsoft/fetch-event-source";


export async function getInitBotChat() {
    return axios.get(`https://agent.antdigital.com/server_resource/csrobotmng/lx/online/agentStart.json?agentId=${getUrlParam('agentId') || '26'}`,);
}

export async function getBotChat(data, options = {}) {
    const {
        onMessage = () => { },
        onClose = () => { },
        onError = () => { }
    } = options;

    const isLX = false;

    const queryData = {
        ...data,
    };

    if (isLX) {

        // const loacl = getLocale() === 'en' ? 'EN' : 'ZH'
        const loacl = 'ZH'
        if (!queryData.userQuery) {
            queryData.extraParams = {
                "agent.chat.mode": "welcome",
                "Language": loacl,
            };
            queryData.query = "1";
        } else {
            queryData.extraParams = {
                "Language": loacl,
            };
            queryData.query = queryData.userQuery;
        }
        if (!queryData.agentId) {
            queryData.agentId = Number(getUrlParam('agentId') || '26');
        }
        delete queryData.userQuery;
        delete queryData.botVersion;
    }
    try {
        const agentId = getUrlParam('agentId') || '26';
        queryData.query = queryData.userQuery
        queryData.agentId = agentId
        fetchEventSource(`https://agent.antdigital.com/lx/agentStreamChat.json?agentId=${agentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
            },
            body: JSON.stringify({ ...queryData }),
            onmessage(msg) {
                onMessage(msg);
            },
            onclose(msg) {
                onClose(msg);
            },
            onerror(err) {
                onError(err);
                throw err;
            },
        });
    } catch (error) {
        onError(error);
    }
}

// 卡片信息流
export const getCardChat = async (data) => {
    try {
        const appId = getUrlParam('appId') || 'PRIB069A75241950';
        const workspaceId = getUrlParam('workspaceId') || 'default';
        const tenantId = getUrlParam('tenantId') || 'default';
        // return await fetch(`/stream_chat?appId=${appId}&workspaceId=${workspaceId}&tenantId=${tenantId}&agentId=${getUrlParam('agentId') || '26'}`, {
        return await fetch(`/webapi/mappcenter/massistant/stream_chat?appId=${appId}&workspaceId=${workspaceId}&tenantId=${tenantId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
            },
            body: JSON.stringify({
                agentId: getUrlParam('agentId') || '26',
                "userId": "2088702174679160",
                "sessionID": data.sessionId,
                "userQuery": data.userQuery,
                "appId": appId,
                "workspaceId": workspaceId,
                "tenantId": tenantId
            })
        });
    } catch (error) {
        return Promise.reject(error);
    }
}