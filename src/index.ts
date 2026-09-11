/**
 * tinkerdesk-types — TinkerDesk 开发者类型定义包
 *
 * 四个对外扩展面的类型约束（**唯一定义处**）：
 *   - 工具（tool）：IAgentTool / ToolSchema / ToolResult / ToolContext …
 *   - 能力提供者（provider）：TinkerProvider / ProviderContext / ProviderManifest …
 *   - 应用（app）：AppManifest / AppConfigSchema …
 *   - 应用 SDK（sdk）：ctx.app（工具侧）/ window.tinkerApp（webview 侧）
 *
 * 纯类型声明（零运行时）——第三方 npm i -D 后 extends / implements 开发。
 */
export * from './tool';
export * from './provider';
export * from './app';
export * from './sdk';
