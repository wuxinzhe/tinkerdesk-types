/**
 * provider.ts — 能力提供者（Provider）扩展类型约束
 *
 * 第三方 provider 扩展实现对应接口（SearchProvider/ExtractProvider 等）接入 TinkerDesk。
 * 纯类型声明——零运行时——provider 实现自包含。
 */

/** 搜索结果条目 */
export interface SearchResultItem {
  title: string
  url: string
  description: string
  position: number
}

/** 搜索响应数据 */
export interface WebSearchResponseData {
  success: boolean
  error?: string
  data?: {
    web: SearchResultItem[]
  }
}

/** 网页搜索 Provider 接口 */
export interface SearchProvider {
  readonly id: string
  readonly name: string
  supportsSearch(): boolean
  isAvailable(): boolean
  /** 由 wrap 在 init 时调用——用户配置 > 运行时注入（env 兜底） */
  configure?(config: Record<string, unknown>): void
  search(query: string, limit: number): Promise<WebSearchResponseData>
}

/** 单条提取结果 */
export interface ExtractResultItem {
  url: string
  title: string
  content: string
  error?: string | null
}

/** 网页提取 Provider 接口 */
export interface ExtractProvider {
  readonly id: string
  readonly name: string
  supportsExtract(): boolean
  isAvailable(): boolean
  /** 由 wrap 在 init 时调用——用户配置 > 运行时注入（env 兜底） */
  configure?(config: Record<string, unknown>): void
  extract(urls: string[], format?: string): Promise<ExtractResultItem[]>
}
