# tinkerdesk-types

TinkerDesk 开发者类型定义包——**工具 / 能力提供者 / 工坊应用**三个可扩展领域的开发者类型约束。

纯类型声明（零运行时）——第三方扩展开发时 `npm i tinkerdesk-types` 后实现/继承对应接口。

## 内容

| 模块 | 领域 | 类型 |
|------|------|------|
| `tool` | 工具（tinkerdesk-tool-*） | `IAgentTool` / `ToolSchema` / `ToolResult` / `ToolContext` / `ToolCheckResult` / `ToolPackageManifest` |
| `provider` | 能力提供者 | `SearchProvider` / `ExtractProvider` / `SearchResultItem` / `WebSearchResponseData` / `ExtractResultItem` |
| `app` | 工坊应用（tinkerdesk-app-*） | `AppManifest` / `AppSeat` / `AppToolsJson` |

## 使用

```bash
npm i tinkerdesk-types
```

```typescript
import type { IAgentTool, ToolSchema, ToolContext, ToolResult } from 'tinkerdesk-types'

export class AppNoteCreateTool implements IAgentTool {
  getSchema(): ToolSchema {
    return {
      name: 'app_note_create',
      description: '创建一篇笔记',
      parameters: {
        type: 'object',
        properties: { title: { type: 'string', description: '标题' } },
        required: ['title'],
      },
      toFunctionCallingFormat() {
        return {
          type: 'function',
          function: { name: this.name, description: this.description, parameters: this.parameters },
        }
      },
    }
  }

  async execute(ctx: ToolContext): Promise<ToolResult> {
    // 自包含实现——Node 标准库（fetch/child_process/fs）——不依赖 TinkerDesk 内部类
    const res = await fetch('http://localhost:8787/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ctx.toolCall?.arguments ?? {}),
    })
    return { async: false, result: await res.text() }
  }
}
```

## 开发

```bash
npm install
npm run build   # 产出 dist/index.d.ts（纯类型）
```

## 发布

```bash
npm publish --access public
```

> 后续如需追加扩展领域（skill/prompt 等）——在 `src/` 新增模块并在 `index.ts` 导出即可。
