
import { getUrlParam } from '@/utils';
import mpaasManager from "./multi-mpaas-sdk";

export const isIntraDomain = false;
export const isUseGW = true;
export const initXuiSDK = async () => {
  const queryBaseURL = window.location.origin + (isIntraDomain ? "/webapi/mappcenter/massistant" : "");
  const resourceBaseURL = window.location.origin + (isIntraDomain ? "/webapi/mappcenter/cubecard" : "");

  const instances = [
    {
      name: "primary",
      config: {
        libraries: {
        },
        appId: getUrlParam('appId') || 'PRIB069A75241950',
        workspaceId: getUrlParam('workspaceId') || 'default',
        tenantId: getUrlParam('tenantId') || 'ANTCLOUD',
        resourceConfig: {
          useFetch: true,
          useMGW: isUseGW,
          // H5网关配置，如果useMGW为true，则使用H5网关配置
          mgsConfig: {
            baseURL: 'http://11.158.124.11/mgw.htm',
            operationType: 'alipay.client.getCubekitResource.h5',
            signType: 'md5',
            mgsRequestType: 'rpc',
            noRequestBody: true,
            secretKey: '79d865389293eeb290d126f320ff652a',
            extraHttpConfig: {
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          },
          // 普通请求配置，如果useMGW为false，则使用普通请求配置
          fetchConfig: {
            url: resourceBaseURL + `/resource/getH5ResourceByIdWithDependencies`, // /webapi/mappcenter/cubecard
            requestOptions: {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          }
        },
        queryConfig: {
          useWebSocket: isUseGW,
          wsConfig: {
            wsParams: { // 默认值
              // autoReconnect: true,
              // reconnectInterval: 3000,
              // maxReconnectAttempts: 5,
              // heartbeatInterval: 1000,
              // heartbeatMessage: 'ping',
              // protocols: []
              headers: {
                'Content-Type': 'application/json',
              }
            },
            mgsParams: {
              baseURL: `ws://100.88.151.23:7187/stream`,
              operationType: 'alipay.assistant.llm.stream.chat',
              signType: "hmacsha256",
              secretKey: '12ffb3ca7f275c852bac07d778148d2c',
            }
          },
          fetchConfig: {
            url: queryBaseURL + `/stream_chat`,
            requestOptions: {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          }
        },
        historyConfig: {
          useMGW: isUseGW,
          fetchConfig: {
            url: queryBaseURL + `/history`,
            requestOptions: {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              }
            },
          },
          mgsConfig: {
            baseURL: 'http://11.158.124.11/mgw.htm',
            operationType: 'alipay.assistant.history.chat',
            signType: 'md5',
            mgsRequestType: 'rpc',
            noRequestBody: true,
            secretKey: '79d865389293eeb290d126f320ff652a',
            extraHttpConfig: {
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          }
        }
      },
    },
    {
      name: "secondary",
      config: {
        libraries: {
        },
        appId: getUrlParam('appId') || 'PRIB069A75241950',
        workspaceId: getUrlParam('workspaceId') || 'default',
        tenantId: getUrlParam('tenantId') || 'ANTCLOUD',
        resourceConfig: {
          useFetch: true,
          useMGW: isUseGW,
          // H5网关配置，如果useMGW为true，则使用H5网关配置
          mgsConfig: {
            baseURL: 'http://11.158.124.11/mgw.htm',
            operationType: 'alipay.client.getCubekitResource.h5',
            signType: 'md5',
            mgsRequestType: 'rpc',
            noRequestBody: true,
            secretKey: '79d865389293eeb290d126f320ff652a',
            extraHttpConfig: {
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          },
          // 普通请求配置，如果useMGW为false，则使用普通请求配置
          fetchConfig: {
            url: resourceBaseURL + `/resource/getH5ResourceByIdWithDependencies`, // /webapi/mappcenter/cubecard
            requestOptions: {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          }
        },
        queryConfig: {
          useWebSocket: isUseGW,
          wsConfig: {
            wsParams: { // 默认值
              // autoReconnect: true,
              // reconnectInterval: 3000,
              // maxReconnectAttempts: 5,
              // heartbeatInterval: 1000,
              // heartbeatMessage: 'ping',
              // protocols: []
              headers: {
                'Content-Type': 'application/json',
              }
            },
            mgsParams: {
              baseURL: `ws://100.88.151.23:7187/stream`,
              operationType: 'alipay.assistant.llm.stream.chat',
              signType: "hmacsha256",
              secretKey: '12ffb3ca7f275c852bac07d778148d2c',
            }
          },
          fetchConfig: {
            url: queryBaseURL + `/stream_chat`,
            requestOptions: {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          }
        },
        historyConfig: {
          useMGW: isUseGW,
          fetchConfig: {
            url: queryBaseURL + `/history`,
            requestOptions: {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              }
            },
          },
          mgsConfig: {
            baseURL: 'http://11.158.124.11/mgw.htm',
            operationType: 'alipay.assistant.history.chat',
            signType: 'md5',
            mgsRequestType: 'rpc',
            noRequestBody: true,
            secretKey: '79d865389293eeb290d126f320ff652a',
            extraHttpConfig: {
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            },
          }
        }
      },
    },
  ];

  const promises = instances.map(({ name, config }) =>
    mpaasManager.createInstance(name, config)
  );

  await Promise.all(promises);
}
