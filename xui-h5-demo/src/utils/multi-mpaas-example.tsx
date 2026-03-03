/**
 * 多MPAAS实例使用示例
 * 展示如何在原有业务代码中使用多个MPAASXui实例
 */

import React, { useState } from "react";
import mpaasManager from "./multi-mpaas-sdk";
import { useMultiMPAAS } from "../hooks/useMultiMPAAS";

interface ServiceGuideMultiMPAASProps {
  agentId: string;
  userId: string;
  sessionId: string;
  message?: string;
}

export const ServiceGuideMultiMPAAS: React.FC<ServiceGuideMultiMPAASProps> = ({ agentId, userId, sessionId, message = "" }) => {
  const [currentInstance, setCurrentInstance] = useState<string>("primary");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 使用多实例Hook
  const {
    loading: initLoading,
    error: initError,
    query: queryFn,
    getInstance,
  } = useMultiMPAAS({
    autoInit: true,
    instances: [
      {
        name: "primary",
        config: {
          baseURL: "https://mpaas.example.com",
          appId: "your-primary-app-id",
          workspaceId: "your-primary-workspace-id",
        },
      },
      {
        name: "secondary",
        config: {
          baseURL: "https://secondary-mpaas.example.com",
          appId: "your-secondary-app-id",
          workspaceId: "your-secondary-workspace-id",
        },
      },
    ],
  });

  // 执行查询
  const handleQuery = async (instanceName: string) => {
    setLoading(true);
    setCurrentInstance(instanceName);

    try {
      const queryData = {
        contextInfo: {
          currentSopStepNo: 1,
          sopScriptStepsCard: true,
          wxExternalUserId: userId,
        },
        currentSopStepNo: 1,
      };

      const result = await queryFn(instanceName, {
        options: {
          body: {
            agentId,
            userId,
            sessionId,
            query: message || "",
            params: {
              ...queryData,
              source: "wecom",
              type: "service_guide",
            },
          },
        },
      });

      setResult(result);
    } catch (error) {
      console.error("查询失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前实例信息
  const getCurrentInstanceInfo = () => {
    const instance = getInstance(currentInstance);
    const stats = mpaasManager.getStats();

    return {
      instance: instance ? "Instance loaded" : "No instance",
      stats,
      currentInstanceName: currentInstance,
    };
  };

  if (initLoading) {
    return <div>正在初始化MPAAS实例...</div>;
  }

  if (initError) {
    return <div>初始化失败: {initError}</div>;
  }

  return (
    <div className="service-guide-multi-mpaas">
      <div className="instance-selector">
        <h3>选择MPAAS实例:</h3>
        <div className="button-group">
          <button onClick={() => handleQuery("primary")} disabled={loading} className={currentInstance === "primary" ? "active" : ""}>
            主实例
          </button>
          <button onClick={() => handleQuery("secondary")} disabled={loading} className={currentInstance === "secondary" ? "active" : ""}>
            备用实例
          </button>
        </div>
      </div>

      {loading && <div>查询中...</div>}

      {result && (
        <div className="result">
          <h4>查询结果:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="debug-info">
        <h4>调试信息:</h4>
        <pre>{JSON.stringify(getCurrentInstanceInfo(), null, 2)}</pre>
      </div>
    </div>
  );
};

// 向后兼容的包装函数
export const createCompatibleQuery = (instanceName: string = "default") => {
  const instance = mpaasManager.getInstance(instanceName);

  return async (params: any) => {
    if (!instance) {
      throw new Error(`MPAAS实例 ${instanceName} 不存在`);
    }
    return instance.query(params);
  };
};

// 原始代码的适配版本
export const adaptOriginalCode = async () => {
  // 初始化实例
  await mpaasManager.createInstance("service-guide", {
    baseURL: process.env.REACT_APP_MPAAS_BASE_URL || "https://mpaas.example.com",
    appId: process.env.REACT_APP_MPAAS_APP_ID || "default-app-id",
    workspaceId: process.env.REACT_APP_MPAAS_WORKSPACE_ID || "default-workspace-id",
  });

  // 获取实例
  const serviceGuideInstance = mpaasManager.getInstance("service-guide");

  // 使用示例
  return {
    query: (params: any) => serviceGuideInstance.query(params),
    instance: serviceGuideInstance,
  };
};
