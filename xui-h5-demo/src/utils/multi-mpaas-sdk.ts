/**
 * 多MPAASXui实例管理器
 * 用于在同一个页面中管理多个MPAASXui SDK实例
 */

export interface MPAASConfig {
  baseURL?: string;
  appId?: string;
  workspaceId?: string;
  secretKey?: string;
  [key: string]: any;
}

export interface MPAASInstance {
  query: (params: any) => Promise<any>;
  config?: (config: MPAASConfig) => void;
  [key: string]: any;
}

class MultiMPAASXuiManager {
  private instances: Map<string, MPAASInstance> = new Map();
  private originalMPAASXui: MPAASInstance | null = null;
  private iframeContainer: HTMLDivElement | null = null;

  constructor() {
    // 保存原始的window.MPAASXui
    this.originalMPAASXui = (window as any).MPAASXui;
    this.initIframeContainer();
  }

  private initIframeContainer() {
    // 创建隐藏的iframe容器
    this.iframeContainer = document.createElement("div");
    this.iframeContainer.style.display = "none";
    this.iframeContainer.id = "mpaas-iframe-container";
    document.body.appendChild(this.iframeContainer);
  }

  /**
   * 创建新的MPAASXui实例
   * @param name 实例名称
   * @param config 配置对象
   */
  async createInstance(name: string, config: MPAASConfig = {}): Promise<MPAASInstance> {
    if (this.instances.has(name)) {
      console.warn(`MPAAS实例 ${name} 已存在，将返回现有实例`);
      return this.instances.get(name)!;
    }

    return new Promise((resolve, reject) => {
      // 创建iframe来隔离实例
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = "about:blank";

      iframe.onload = () => {
        try {
          const iframeWindow = iframe.contentWindow as any;

          // 在iframe中创建script标签加载SDK
          const script = iframeWindow.document.createElement("script");
          script.src = "/public/mpaas-xui-h5-sdk.js";

          script.onload = () => {
            try {
              const instance = iframeWindow.MPAASXui as MPAASInstance;

              // 配置实例
              instance.init(config);

              // 存储实例引用
              this.instances.set(name, instance);

              // 设置iframe属性（不再重复添加到DOM）
              iframe.setAttribute("data-instance-name", name);

              resolve(instance);
            } catch (error) {
              reject(new Error(`创建MPAAS实例 ${name} 失败: ${error}`));
            }
          };

          script.onerror = () => {
            reject(new Error(`加载SDK失败: ${script.src}`));
          };

          iframeWindow.document.head.appendChild(script);
        } catch (error) {
          reject(new Error(`创建iframe实例失败: ${error}`));
        }
      };

      iframe.onerror = (error) => {
        reject(new Error(`创建iframe失败: ${error}`));
      };

      // 添加到容器而不是直接添加到body
      this.iframeContainer?.appendChild(iframe);
    });
  }

  /**
   * 获取指定实例
   * @param name 实例名称
   * @returns MPAAS实例
   */
  getInstance(name: string): MPAASInstance {
    if (!this.instances.has(name)) {
      console.warn(`MPAAS实例 ${name} 不存在，返回默认实例`);
      return this.originalMPAASXui!;
    }
    return this.instances.get(name)!;
  }

  /**
   * 检查实例是否存在
   * @param name 实例名称
   */
  hasInstance(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * 获取所有实例名称
   */
  getInstanceNames(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * 删除指定实例
   * @param name 实例名称
   */
  removeInstance(name: string): boolean {
    if (this.instances.has(name)) {
      this.instances.delete(name);

      // 移除对应的iframe
      const iframe = this.iframeContainer?.querySelector(`[data-instance-name="${name}"]`);
      if (iframe) {
        iframe.remove();
      }

      return true;
    }
    return false;
  }

  /**
   * 设置默认实例（替换window.MPAASXui）
   * @param name 实例名称
   */
  setDefaultInstance(name: string): boolean {
    const instance = this.getInstance(name);
    if (instance && instance !== this.originalMPAASXui) {
      (window as any).MPAASXui = instance;
      return true;
    }
    return false;
  }

  /**
   * 恢复原始实例
   */
  restoreDefaultInstance(): void {
    (window as any).MPAASXui = this.originalMPAASXui;
  }

  /**
   * 清理所有实例
   */
  cleanup(): void {
    this.instances.clear();

    if (this.iframeContainer) {
      this.iframeContainer.innerHTML = "";
      this.iframeContainer.remove();
      this.iframeContainer = null;
    }

    this.restoreDefaultInstance();
  }

  /**
   * 获取实例统计信息
   */
  getStats() {
    return {
      totalInstances: this.instances.size,
      instanceNames: this.getInstanceNames(),
      hasOriginalInstance: !!this.originalMPAASXui,
    };
  }
}

// 创建全局单例
const mpaasManager = new MultiMPAASXuiManager();

// 便捷方法
export const createMPAASInstance = mpaasManager.createInstance.bind(mpaasManager);
export const getMPAASInstance = mpaasManager.getInstance.bind(mpaasManager);
export const removeMPAASInstance = mpaasManager.removeInstance.bind(mpaasManager);

// 默认导出
export default mpaasManager;
