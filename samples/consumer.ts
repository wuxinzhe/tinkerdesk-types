/**
 * consumer.ts — 契约自检样例（不发布——package.json 的 files 只含 dist）
 *
 * 照 README 把四个面各用一遍：这份文件能通过编译，说明发布出去的类型契约是可用的。
 * 「平台的实现是否符合本包声明」由平台仓的契约测试断言（双向赋值），不在本包范围内。
 */
import type {
  IAgentTool,
  ToolSchema,
  ToolResult,
  ToolContext,
  TinkerProvider,
  ProviderContext,
  ProviderCheckResult,
  ProviderManifest,
  AppManifest,
  TinkerAppSdk,
  HttpResponse,
} from '../src/index';

// ── 工具：实现 IAgentTool（含 ctx.app 能力调用、boolean 简写 check） ──

const myTool: IAgentTool = {
  getSchema(): ToolSchema {
    return {
      name: 'my_tool',
      description: '示例工具',
      parameters: { type: 'object', properties: { node: { type: 'string' } } },
      toFunctionCallingFormat: () => ({ type: 'function', function: {} }),
    };
  },
  async execute(ctx: ToolContext): Promise<ToolResult> {
    const node = String(ctx.toolCall.arguments.node ?? '');
    const res: HttpResponse = await ctx.app!.http.request({
      path: `/nodes/${node}`,
      method: 'PATCH',
      body: { text: 'x' },
    });
    return { async: false, result: res.body };
  },
  check: () => true,
};

// ── 提供者：实现 TinkerProvider（含 dispose） ──

class MyProvider implements TinkerProvider {
  async init(ctx: ProviderContext): Promise<void> {
    ctx.registerIpc('run', (p) => p);
    const m: ProviderManifest = ctx.getManifest();
    void m.version;
  }
  async check(): Promise<ProviderCheckResult> {
    return { ok: true, checks: [{ name: '依赖可用', ok: true }] };
  }
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  async dispose(): Promise<void> {}
}

// ── 应用：manifest 字面量（多一个字段 / 少一个必填都会编译报错） ──

const manifest: AppManifest = {
  id: 'my-app',
  name: '我的工作台',
  version: '0.1.0',
  apiVersion: 1,
  type: 'app',
  ui: { entry: 'ui/index.html' },
  backend: { baseUrl: 'http://127.0.0.1:4399' },
  configSchema: {
    required: ['baseUrl'],
    properties: {
      baseUrl: { type: 'string', title: '后端基址' },
      token: { type: 'secret', title: '访问令牌' },
    },
  },
  vocation: { displayName: '问候', prompt: 'prompts/vocation.hbs' },
  skills: [{ name: 'style', path: 'skills/style.md' }],
  prompts: [{ name: 'tone', path: 'prompts/tone.hbs' }],
};

// ── webview 侧：window.tinkerApp ──

async function ui(): Promise<void> {
  const sdk: TinkerAppSdk = window.tinkerApp;
  sdk.ready();
  const caps = await sdk.listCapabilities();
  const res = await sdk.http.request({ path: '/hello', method: 'GET' });
  console.log(caps, res.status, manifest.id);
}

void myTool;
void MyProvider;
void ui;
