/**
 * provider.ts — 能力提供者（Provider）扩展根契约
 *
 * TinkerProvider = Provider 统一契约（内置/外置同构——一个类 = 一个扩展的完整生命体）。
 * 业务封装（SearchProvider/ExtractProvider 等）不属于开发者类型包——扩展开发者实现的是根契约。
 * 纯类型声明——零运行时。
 */

/** 配置字段类型 */
export type ConfigFieldType = 'text' | 'password' | 'number' | 'boolean' | 'select' | 'textarea'

/** 配置字段定义 */
export interface ConfigField {
  key: string
  label: string
  type: ConfigFieldType
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  default?: unknown
}

/** 动态表单 schema（渲染配置表单——manifest.configSchema） */
export interface ConfigSchema {
  title?: string
  description?: string
  fields: ConfigField[]
}

/** Provider 自检结果 */
export interface ProviderCheckItem {
  name: string
  ok: boolean
  message?: string
}

export interface ProviderCheckResult {
  ok: boolean
  items?: ProviderCheckItem[]
  reason?: string
}

/** 扩展 manifest（provider 包内 manifest.json——插件协议 v1） */
export interface ProviderManifest {
  id: string
  name: string
  version: string
  apiVersion?: number
  entry?: string
  requiresMain?: boolean
  capabilities?: string[]
  systemInterfaces?: Array<{ id: string; version?: number }>
  assetDeps?: Array<{ name: string; dest: string; sizeMB?: number; url?: string }>
  installDoc?: { present?: boolean; title?: string; runtimeId?: string }
  permissions?: string[]
  description?: string
  author?: string
  homepage?: string
  publisher?: string
  configSchema?: ConfigSchema
}

/** 扩展上下文（应用注入——init(ctx) 入参） */
export interface ProviderContext {
  providerId: string
  /** 扩展目录（读模型/资源） */
  configDir: string
  /** 扩展 manifest（assetDeps 等） */
  getManifest(): ProviderManifest
  /** 扩展 → 应用事件（转发 renderer，如 stt:on-text） */
  emit(event: string, data?: unknown): void
  /** 注册 IPC 能力（renderer 侧调用 provider:<id>:<channel>） */
  registerIpc(channel: string, handler: (payload: unknown) => unknown): void
  /** 读取应用托管的扩展配置 */
  getConfig<T = Record<string, unknown>>(): T
  /** 更新扩展配置（按字段 patch） */
  setConfig(patch: Record<string, unknown>): void
}

/** Provider 统一契约（一个类 = 一个扩展的完整生命体） */
export interface TinkerProvider {
  /** 声明式配置 schema（渲染配置表单） */
  readonly configSchema?: ConfigSchema

  /** 构造性初始化：注册 IPC 能力频道、读取初始配置（每个实例仅调用一次） */
  init(ctx: ProviderContext): void | Promise<void>

  /** 自检（启用前必须通过） */
  check(): ProviderCheckResult | Promise<ProviderCheckResult>

  /** 启动（check 通过后调用） */
  start(): void | Promise<void>

  /** 停止（保持已加载状态） */
  stop(): void | Promise<void>
}
