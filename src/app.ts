/**
 * app.ts — 工坊应用（App）扩展类型约束
 *
 * Workshop App = 工具 + skill + prompt 的聚合体（经 vocation 聚集）——
 * 第三方在自身应用基础上封装 Agent 调用工具，接入 TinkerDesk 工作台。
 * 纯类型声明——零运行时。
 */

/** 应用 manifest（tinkerdesk-app-* 包内 manifest.json——app-development.md 规范） */
export interface AppManifest {
  id: string
  name: string
  version?: string
  apiVersion?: number
  type?: string
  entry?: { static?: boolean; entry?: string }
  backend?: { command?: string; stopCommand?: string }
  seats?: Array<{ seatId: string; vocationId: string; role?: string }>
  vocations?: Array<{
    id: string
    name: string
    displayName?: string
    description?: string
    prompt?: string
    skills?: string[]
    promptList?: string[]
  }>
  skills?: Array<{ name: string; path: string; displayName?: string; description?: string }>
  prompts?: Array<{ name: string; path: string }>
  tools?: { path?: string }
  capabilities?: Array<{ name: string; required?: boolean }>
  description?: string
  author?: string
}

/** 应用席位（每席位 = 一个 vocation 角色——接入 agent profile） */
export interface AppSeat {
  seatId: string
  vocationId: string
  role: string
  profile: string
}

/** 应用声明式工具集（tools.json——每工具可标注传输方式） */
export interface AppToolsJson {
  scopes: Array<{
    id?: string
    tools: Array<{
      name: string
      description: string
      parameters?: Record<string, unknown>
    }>
  }>
}
