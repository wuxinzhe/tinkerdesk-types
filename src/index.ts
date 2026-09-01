/**
 * tinkerdesk-types — TinkerDesk 开发者类型定义包
 *
 * 三个可扩展领域（工具 / 能力提供者 / 工坊应用）的开发者类型约束：
 *   - 工具（Tool）：IAgentTool / ToolSchema / ToolResult / ToolContext ...
 *   - 提供者（Provider）：SearchProvider / ExtractProvider ...
 *   - 应用（App）：AppManifest / AppSeat / AppToolsJson ...
 *
 * 纯类型声明（零运行时）——第三方 npm i 后 extends/implements 开发。
 */

export * from './tool'
export * from './provider'
export * from './app'
