/**
 * tool.ts — 工具（Tool）扩展类型约束
 *
 * 第三方工具包（tinkerdesk-tool-* 或应用包内的 tools/<name>/）导出一个实现 IAgentTool 的工具：
 *   入口模块导出默认实例，或导出 `tool` 字段（平台按 mod.tool ?? mod.default 取）。
 * 工具实现侧自包含（只用 Node 标准库即可接入）。
 * 纯类型声明——零运行时。
 */
import type { AppSdk } from './sdk';

/** 工具 Schema（LLM 工具描述——OpenAI function calling 兼容形态） */
export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, unknown> | null;
  /** 序列化为 OpenAI function calling 格式 */
  toFunctionCallingFormat(): Record<string, unknown>;
}

/** 工具执行结果（async=true 表示已派发、等回调再续跑） */
export interface ToolResult {
  async: boolean;
  /** 结果字符串（直接作为工具结果发给 LLM） */
  result: string;
}

/**
 * 工具执行上下文（execute 入参——平台内部字段更多，此处只声明**开发者可用面**）
 *
 * 只声明允许工具依赖的字段：平台内部还有大量运行期字段，但那是平台的事，
 * 第三方工具不应依赖（所以这里没有开放索引签名）。
 */
export interface ToolContext {
  sessionId: string;
  profile: string;
  conversationId: string;
  /** 本次待执行的工具调用 */
  toolCall: {
    name: string;
    id: string;
    /** 工具入参（LLM 依据 Schema 生成） */
    arguments: Record<string, unknown>;
  };
  /** 应用上下文（仅 app_<appId>_* 工具带——平台按应用配置解析后注入） */
  app?: AppSdk;
}

/** 工具可用性检测结果（ok=false 时不入池，reason 展示给用户） */
export interface ToolCheckResult {
  ok: boolean;
  reason?: string;
}

/** Agent 工具 SPI 接口（所有工具需实现——内置/外置同一契约） */
export interface IAgentTool {
  /** 获取工具 Schema（向 LLM 描述这个工具） */
  getSchema(): ToolSchema;
  /** 执行工具调用 */
  execute(ctx: ToolContext): Promise<ToolResult> | ToolResult;
  /**
   * 可用性检测（注册时调用；不可用工具不入池）
   *
   * 可返回 boolean 简写：true = 可用，false = 不可用（原因记为「check 失败」）。
   */
  check?(): ToolCheckResult | boolean;
}

/** 工具包 manifest（tinkerdesk-tool-* 包内 manifest.json） */
export interface ToolPackageManifest {
  id: string;
  /** 入口文件（相对包根，如 dist/index.js） */
  entry?: string;
  apiVersion?: number;
  /** 包类型——工具固定 'tool' */
  type?: string;
  tool?: {
    name?: string;
    displayName?: string;
    description?: string;
    categories?: string[];
  };
  assetDeps?: ToolAssetDep[];
}

/** 工具资源依赖（安装时下载） */
export interface ToolAssetDep {
  name: string;
  dest: string;
  optional?: boolean;
  sizeMB?: number;
}
