/**
 * React Hook for 多MPAAS实例管理
 */

import { useState, useEffect, useCallback } from 'react';
import mpaasManager, { MPAASConfig } from '../utils/multi-mpaas-sdk';

interface UseMultiMPAASOptions {
  autoInit?: boolean;
  instances?: Array<{
    name: string;
    config: MPAASConfig;
  }>;
}

export const useMultiMPAAS = (options: UseMultiMPAASOptions = {}) => {
  const { autoInit = false, instances = [] } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // 初始化所有实例
  const initializeInstances = useCallback(async () => {
    if (instances.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const promises = instances.map(({ name, config }) =>
        mpaasManager.createInstance(name, config)
      );

      await Promise.all(promises);
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化失败');
    } finally {
      setLoading(false);
    }
  }, [instances]);

  // 自动初始化
  useEffect(() => {
    if (autoInit && instances.length > 0) {
      initializeInstances();
    }
  }, [autoInit, instances, initializeInstances]);

  // 获取实例
  const getInstance = useCallback((name: string) => {
    return mpaasManager.getInstance(name);
  }, []);

  // 查询方法
  const query = useCallback(async (instanceName: string, params: any) => {
    const instance = mpaasManager.getInstance(instanceName);
    if (!instance) {
      throw new Error(`MPAAS实例 ${instanceName} 不存在`);
    }

    try {
      return await instance.query(params);
    } catch (error) {
      throw new Error(`查询失败: ${error}`);
    }
  }, []);

  // 清理所有实例
  const cleanup = useCallback(() => {
    mpaasManager.cleanup();
    setInitialized(false);
  }, []);

  return {
    // 状态
    loading,
    error,
    initialized,

    // 方法
    initializeInstances,
    getInstance,
    query,
    cleanup,

    // 便捷方法
    createInstance: mpaasManager.createInstance.bind(mpaasManager),
    removeInstance: mpaasManager.removeInstance.bind(mpaasManager),
    getStats: mpaasManager.getStats.bind(mpaasManager),
  };
};

// 预设配置模板
export const MPAAS_CONFIG_TEMPLATES = {
  production: {
    baseURL: 'https://mpaas.example.com',
    appId: 'prod-app-id',
    workspaceId: 'prod-workspace-id',
  },
  staging: {
    baseURL: 'https://staging-mpaas.example.com',
    appId: 'staging-app-id',
    workspaceId: 'staging-workspace-id',
  },
  development: {
    baseURL: 'https://dev-mpaas.example.com',
    appId: 'dev-app-id',
    workspaceId: 'dev-workspace-id',
  },
};

// 使用示例
/*
// 在组件中使用
const MyComponent = () => {
  const {
    loading,
    error,
    initialized,
    query,
    getInstance
  } = useMultiMPAAS({
    autoInit: true,
    instances: [
      {
        name: 'primary',
        config: MPAAS_CONFIG_TEMPLATES.production
      },
      {
        name: 'secondary',
        config: MPAAS_CONFIG_TEMPLATES.staging
      }
    ]
  });

  const handleQuery = async () => {
    try {
      const result = await query('primary', {
        options: {
          body: { agentId: '123' }
        }
      });
      console.log('查询结果:', result);
    } catch (err) {
      console.error('查询失败:', err);
    }
  };

  return (
    <div>
      {loading && <div>初始化中...</div>}
      {error && <div>错误: {error}</div>}
      {initialized && <button onClick={handleQuery}>查询</button>}
    </div>
  );
};
*/
