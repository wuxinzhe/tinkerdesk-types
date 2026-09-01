/**
 * tool.ts — 工具（Tool）扩展类型约束
 *
 * 第三方工具包（tinkerdesk-tool-*）实现 IAgentTool 接入 TinkerDesk。
 * 纯类型声明——零运行时——工具实现侧自包含（Node 标准库）。
 */

/** 工具 Schema（LLM 工具描述——与 OpenAI function calling 兼容形态） */
export interface ToolSchema {
  name: string
  description: string
  parameters: Record<string, unknown> | null
  /** 序列化为 OpenAI function calling 格式 */
  toFunctionCallingFormat(): Record<string, unknown>
}

/** 工具执行结果（驱动引擎控制循环——isAsync 表示已派发等待回调） */
export interface ToolResult {
  async: boolean
  result: string
}

/** 工具执行上下文（execute 入参——含本次调用的参数） */
export interface ToolContext {
  sessionId: string
  profile: string
  toolCall?: {
    name?: string
    arguments?: Record<string, unknown>
  }
  [key: string]: unknown
}

/** 工具可用性检测结果（check 可返回——reason 给管理页展示） */
export interface ToolCheckResult {
  ok: boolean
  reason?: string
}

/** Agent 工具 SPI 接口（所有工具需实现——内置/外置/声明式统一契约） */
export interface IAgentTool {
  /** 获取工具的 Schema 定义（用于向 LLM 描述工具） */
  getSchema(): ToolSchema
  /** 执行工具调用，返回字符串结果（将直接发送给 LLM） */
  execute(ctx: ToolContext): Promise<ToolResult>
  /** 可用性检测（注册时调用；不可用工具不入池） */
  check?(): ToolCheckResult | boolean
}

/** 工具包 manifest（tinkerdesk-tool-* 包内 manifest.json 结构） */
export interface ToolPackageManifest {
  id: string
  entry: string
  apiVersion?: number
  kind?: string
  tool?: {
    name?: string
    displayName?: string
    description?: string
    categories?: string[]
  }
  assetDeps?: Array<{ name: string; dest: string; optional?: boolean; sizeMB?: number }>
}
