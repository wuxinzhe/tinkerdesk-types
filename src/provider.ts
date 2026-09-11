/**
 * provider.ts — 能力提供者（Provider）扩展类型约束
 *
 * 第三方扩展包（tinkerdesk-provider-*）导出一个实现 TinkerProvider 的类接入 TinkerDesk：
 * 一个类 = 一个扩展的完整生命体——静态声明走包内 manifest.json，
 * 运行时走 init / check / start / stop / dispose。
 * 业务封装（web.search、tool.tts 等具体接口）不属于本包——扩展实现的是根契约。
 * 纯类型声明——零运行时。
 */

/** 配置字段类型（'secret' = 掩码输入，值不出主进程） */
export type ConfigFieldType = 'string' | 'secret' | 'number' | 'boolean' | 'select' | 'textarea' | 'file';

/** 配置字段声明（平台据此渲染配置表单） */
export interface ConfigField {
  type: ConfigFieldType;
  title: string;
  description?: string;
  default?: unknown;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  /** type='file' 时的文件过滤 */
  filters?: { name: string; extensions: string[] }[];
}

/** 扩展配置声明（manifest.configSchema） */
export interface ConfigSchema {
  type: 'object';
  properties: Record<string, ConfigField>;
}

/** 资源依赖（manifest.assetDeps——装扩展时下载到扩展目录） */
export interface AssetDep {
  name: string;
  dest: string;
  sizeMB: number;
  url: string;
  optional?: boolean;
}

/** 自检项（check 返回；ok=false 时 hint 展示给用户，action 给一键处理） */
export interface ProviderCheckItem {
  name: string;
  ok: boolean;
  hint?: string;
  action?: 'download-models' | 'open-config';
}

/** 自检结果（启用前必须通过——ok=false 不入注册表） */
export interface ProviderCheckResult {
  ok: boolean;
  checks: ProviderCheckItem[];
}

/** 扩展 manifest（provider 包内 manifest.json——插件协议 v1） */
export interface ProviderManifest {
  id: string;
  name: string;
  keywords?: string[];
  version: string;
  apiVersion: number;
  /** 入口文件（相对包根） */
  entry: string;
  /** 包类型——provider 固定 'provider' */
  type?: string;
  /** 是否需要在主进程加载 */
  requiresMain?: boolean;
  /** 能力标签（如 ["stt", "tts"]——展示与筛选用） */
  capabilities?: string[];
  /** 实现的系统接口（按 id 注册通道——id 必须精确匹配平台开放接口） */
  systemInterfaces?: { id: string; version: number }[];
  /** 平台内置（内置扩展在 UI 上不可卸载） */
  builtin?: boolean;
  permissions?: string[];
  description?: string;
  author?: string;
  homepage?: string;
  publisher?: string;
  assetDeps?: AssetDep[];
  configSchema?: ConfigSchema;
}

/** 扩展上下文（平台注入——init(ctx) 入参） */
export interface ProviderContext {
  providerId: string;
  /** 扩展目录（读模型 / 资源） */
  configDir: string;
  /** 扩展 manifest（assetDeps 等） */
  getManifest(): ProviderManifest;
  /** 扩展 → 应用事件（转发 renderer，如 stt:on-text） */
  emit(event: string, data?: unknown): void;
  /** 注册 IPC 能力（renderer 侧调用 provider:<id>:<channel>） */
  registerIpc(channel: string, handler: (payload: unknown) => unknown): void;
  /** 读取应用托管的扩展配置 */
  getConfig<T = Record<string, unknown>>(): T;
  /** 更新扩展配置（按字段 patch） */
  setConfig(patch: Record<string, unknown>): void;
}

/** Provider 统一契约（一个类 = 一个扩展的完整生命体——内置/外置同构） */
export interface TinkerProvider {
  /** 声明式配置 schema（渲染配置表单） */
  readonly configSchema?: ConfigSchema;
  /** 构造性初始化：注册 IPC 能力频道、读取初始配置（每个实例仅调用一次） */
  init(ctx: ProviderContext): void | Promise<void>;
  /** 自检（启用前必须通过） */
  check(): ProviderCheckResult | Promise<ProviderCheckResult>;
  /** 启动（check 通过后调用） */
  start(): void | Promise<void>;
  /** 停止（保持已加载状态） */
  stop(): void | Promise<void>;
  /** 彻底释放（卸载 / 热重载前） */
  dispose(): void | Promise<void>;
}
