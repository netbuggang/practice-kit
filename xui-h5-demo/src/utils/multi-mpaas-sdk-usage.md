# 多MPAASXui实例使用指南

## 概述

由于你的SDK会将变量导出赋值到`window.MPAASXui`，当需要在业务代码中使用两个不同的`window.MPAASXui`实例时，我们提供了`MultiMPAASXuiManager`来管理多个实例。

## 快速开始

### 1. 引入管理器

```typescript
import mpaasManager from '@/utils/multi-mpaas-sdk';
```

### 2. 创建实例

```typescript
// 创建主实例
await mpaasManager.createInstance('primary', {
  baseURL: 'https://primary-mpaas.example.com',
  appId: 'primary-app-id',
  workspaceId: 'primary-workspace-id',
});

// 创建备用实例
await mpaasManager.createInstance('secondary', {
  baseURL: 'https://secondary-mpaas.example.com',
  appId: 'secondary-app-id',
  workspaceId: 'secondary-workspace-id',
});
```

### 3. 使用实例

```typescript
// 获取指定实例
const primaryInstance = mpaasManager.getInstance('primary');
const secondaryInstance = mpaasManager.getInstance('secondary');

// 使用实例进行查询
const primaryResult = await primaryInstance.query({
  options: {
    body: {
      agentId: 'your-agent-id',
      userId: 'your-user-id',
      query: 'your-query',
    }
  }
});

const secondaryResult = await secondaryInstance.query({
  options: {
    body: {
      agentId: 'your-agent-id',
      userId: 'your-user-id',
      query: 'your-query',
    }
  }
});
```

## React Hook 使用

### 使用 useMultiMPAAS Hook

```typescript
import { useMultiMPAAS } from '@/hooks/useMultiMPAAS';

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
        name: 'production',
        config: {
          baseURL: 'https://prod-mpaas.example.com',
          appId: 'prod-app-id',
        }
      },
      {
        name: 'staging',
        config: {
          baseURL: 'https://staging-mpaas.example.com',
          appId: 'staging-app-id',
        }
      }
    ]
  });

  const handleQuery = async (instanceName: string) => {
    try {
      const result = await query(instanceName, {
        options: {
          body: { agentId: '123', query: 'test' }
        }
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={() => handleQuery('production')}>使用生产环境</button>
      <button onClick={() => handleQuery('staging')}>使用测试环境</button>
    </div>
  );
};
```

## 向后兼容

### 适配原有代码

如果你的原有代码直接使用`window.MPAASXui.query`，可以这样适配：

```typescript
import { createCompatibleQuery } from '@/qw-pc-wechat-sdk/Tools/components/service-guide/multi-mpaas-example';

// 创建兼容的查询函数
const query = createCompatibleQuery('your-instance-name');

// 使用方式与原来相同
const result = await query({
  options: {
    body: {
      agentId: 'your-agent-id',
      userId: 'your-user-id',
      sessionId: 'your-session-id',
      query: 'your-query',
    }
  }
});
```

## 实例管理

### 检查实例状态

```typescript
const stats = mpaasManager.getStats();
console.log('实例统计:', stats);
// 输出: { totalInstances: 2, instanceNames: ['primary', 'secondary'], hasOriginalInstance: true }
```

### 动态添加/删除实例

```typescript
// 动态添加实例
await mpaasManager.createInstance('new-instance', {
  baseURL: 'https://new-mpaas.example.com',
  appId: 'new-app-id',
});

// 删除实例
mpaasManager.removeInstance('old-instance');

// 清理所有实例
mpaasManager.cleanup();
```

### 切换默认实例

```typescript
// 设置默认实例（会替换window.MPAASXui）
mpaasManager.setDefaultInstance('primary');

// 恢复原始实例
mpaasManager.restoreDefaultInstance();
```

## 环境变量配置

建议在`.env`文件中配置不同环境的参数：

```bash
# .env.production
REACT_APP_MPAAS_PRIMARY_BASE_URL=https://prod-mpaas.example.com
REACT_APP_MPAAS_PRIMARY_APP_ID=prod-app-id
REACT_APP_MPAAS_PRIMARY_WORKSPACE_ID=prod-workspace-id

REACT_APP_MPAAS_SECONDARY_BASE_URL=https://secondary-prod-mpaas.example.com
REACT_APP_MPAAS_SECONDARY_APP_ID=secondary-prod-app-id
REACT_APP_MPAAS_SECONDARY_WORKSPACE_ID=secondary-prod-workspace-id

# .env.development
REACT_APP_MPAAS_PRIMARY_BASE_URL=https://dev-mpaas.example.com
REACT_APP_MPAAS_PRIMARY_APP_ID=dev-app-id
REACT_APP_MPAAS_PRIMARY_WORKSPACE_ID=dev-workspace-id
```

## 使用示例

### 场景1：不同环境切换

```typescript
const configs = {
  production: {
    baseURL: process.env.REACT_APP_MPAAS_PROD_URL,
    appId: process.env.REACT_APP_MPAAS_PROD_APP_ID,
  },
  staging: {
    baseURL: process.env.REACT_APP_MPAAS_STAGING_URL,
    appId: process.env.REACT_APP_MPAAS_STAGING_APP_ID,
  },
};

// 根据环境创建实例
await mpaasManager.createInstance('prod', configs.production);
await mpaasManager.createInstance('staging', configs.staging);
```

### 场景2：不同业务模块

```typescript
// 客服模块
await mpaasManager.createInstance('customer-service', {
  baseURL: 'https://cs-mpaas.example.com',
  appId: 'cs-app-id',
});

// 销售模块
await mpaasManager.createInstance('sales', {
  baseURL: 'https://sales-mpaas.example.com',
  appId: 'sales-app-id',
});
```

## 注意事项

1. **实例隔离**：每个实例都在独立的iframe中运行，完全隔离
2. **性能考虑**：创建多个实例会占用更多内存，建议按需创建
3. **错误处理**：始终使用try-catch处理实例创建和查询操作
4. **清理资源**：在组件卸载时调用`cleanup()`清理实例
5. **兼容性**：原有代码无需修改，可以通过兼容层继续使用

## 故障排除

### 常见问题

1. **实例创建失败**：检查网络连接和SDK文件路径
2. **查询失败**：确认实例配置参数正确
3. **内存泄漏**：确保在不需要时调用`cleanup()`

### 调试信息

```typescript
// 获取调试信息
const debugInfo = {
  instances: mpaasManager.getInstanceNames(),
  stats: mpaasManager.getStats(),
  currentDefault: window.MPAASXui === mpaasManager.getInstance('your-instance'),
};
console.log('调试信息:', debugInfo);
```
