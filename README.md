# tinkerdesk-types

TinkerDesk 开发者类型定义包 —— **所有对外扩展面的类型约束唯一定义处**（纯类型声明，零运行时）。

| 扩展面 | 包名前缀 | 入口类型 |
|---|---|---|
| 工具 | `tinkerdesk-tool-*` / 应用包内 `tools/<name>/` | `IAgentTool` |
| 能力提供者 | `tinkerdesk-provider-*` | `TinkerProvider` |
| 应用 | `tinkerdesk-app-*` | `AppManifest` |
| 应用 SDK（运行时能力） | 应用内的工具与前端页面 | `AppSdk`（工具侧 `ctx.app`）/ `TinkerAppSdk`（`window.tinkerApp`） |

## 安装

```bash
npm i -D tinkerdesk-types
```

TypeScript 项目直接 `import type { … } from 'tinkerdesk-types'`。
纯 JS 应用把类型写到 JSDoc 里，并在文件头加一行引用即可吃到补全：

```js
// @ts-check
/// <reference types="tinkerdesk-types" />
```

## 工具

工具实现侧自包含（只用 Node 标准库即可）。入口模块导出默认实例，或导出 `tool` 字段。

```ts
import type { IAgentTool, ToolSchema, ToolResult, ToolContext } from 'tinkerdesk-types';

class MyTool implements IAgentTool {
  getSchema(): ToolSchema {
    return {
      name: 'my_tool',
      description: '一句话说明这个工具做什么',
      parameters: { type: 'object', properties: { node: { type: 'string' } } },
      toFunctionCallingFormat() {
        return { type: 'function', function: { name: 'my_tool', description: '…', parameters: {} } };
      },
    };
  }

  async execute(ctx: ToolContext): Promise<ToolResult> {
    const { node } = ctx.toolCall.arguments;   // LLM 传入的参数
    return { async: false, result: `done: ${String(node)}` };
  }
}

export default new MyTool();
```

包内 `manifest.json`（`kind: "tool"`）：

```json
{
  "id": "my-tool",
  "entry": "dist/index.js",
  "apiVersion": 1,
  "kind": "tool",
  "tool": { "name": "my_tool", "displayName": "我的工具", "description": "…", "categories": ["utility"] }
}
```

## 能力提供者

一个类 = 一个扩展的完整生命体：静态声明走包内 `manifest.json`，运行时走 `init / check / start / stop / dispose`。

```ts
import type { TinkerProvider, ProviderContext, ProviderCheckResult } from 'tinkerdesk-types';

export default class MyProvider implements TinkerProvider {
  async init(ctx: ProviderContext): Promise<void> {
    ctx.registerIpc('run', (payload) => ({ ok: true, payload }));
  }
  async check(): Promise<ProviderCheckResult> {
    return { ok: true, checks: [{ name: '依赖可用', ok: true }] };
  }
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  async dispose(): Promise<void> {}
}
```

## 应用

`manifest.json` 是平台对该应用的唯一静态声明（`kind: "app"`）。

```json
{
  "id": "my-app",
  "name": "我的工作台",
  "version": "0.1.0",
  "apiVersion": 1,
  "kind": "app",
  "ui": { "entry": "ui/index.html" },
  "backend": { "baseUrl": "http://127.0.0.1:4399" },
  "configSchema": {
    "required": ["baseUrl"],
    "properties": {
      "baseUrl": { "type": "string", "title": "后端基址" },
      "token": { "type": "secret", "title": "访问令牌" },
      "greeting": { "type": "string", "title": "默认问候语", "default": "你好" }
    }
  },
  "vocation": { "displayName": "问候", "prompt": "prompts/vocation.hbs" },
  "skills": [{ "name": "style", "path": "skills/style.md" }],
  "prompts": [{ "name": "tone", "path": "prompts/tone.hbs" }]
}
```

## 应用 SDK（运行时能力）

应用**不直连自己的后端**：能力由平台在主进程执行（拼基址 + 注入 `X-TinkerDesk-App` / `X-TinkerDesk-Token`）；
应用只允许打自己的基址，令牌永远拿不到——配置里的 secret 对应用一律掩码为 `'***'`。

两条腿同一形状：**能力名 = 属性名，方法 = 命名方法**。

工具侧（`ctx.app`，仅 `app_<appId>_*` 工具带）：

```ts
import type { ToolContext, HttpResponse } from 'tinkerdesk-types';

export async function execute(ctx: ToolContext) {
  const res: HttpResponse = await ctx.app!.http.request({
    path: `/nodes/${String(ctx.toolCall.arguments.node)}`,
    method: 'PATCH',
    body: { text: '改短的正文' },
  });
  return { async: false, result: res.body };
}
```

webview 侧（`window.tinkerApp`，类型由包里的 `declare global` 自动带上）：

```js
const res = await window.tinkerApp.http.request({ path: '/hello' });
```

失败时抛出的错误对象带 `code`（`CapabilityErrorCode`）：`UNKNOWN_CAPABILITY` / `SURFACE_DENIED` /
`MISSING_CONFIG` / `BAD_REQUEST` / `UPSTREAM_ERROR`。`MISSING_CONFIG` 表示所需配置项还没在应用设置里填。

## 版本

| 版本 | 变更 |
|---|---|
| 0.2.0 | 应用 manifest 对齐现模型（`kind` / `ui.entry` / `backend.baseUrl` / `vocation` 单数 / `configSchema`）；新增 `sdk`（`AppSdk` / `TinkerAppSdk` / `HttpRequest` / `HttpResponse` / `CapabilityErrorCode`）；provider 补 `dispose()`、`ProviderCheckResult.checks`；tool 的 `check` 允许 boolean、`ToolContext` 补 `app` |
| 0.1.1 | provider 只保留根契约（去掉业务封装类型） |
| 0.1.0 | 首版（tool / provider / app） |
