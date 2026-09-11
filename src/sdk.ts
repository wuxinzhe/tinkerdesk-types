/**
 * sdk.ts — 应用 SDK 类型（应用运行时能力 —— 两条腿同一形状）
 *
 * 应用不直连自己的后端：能力由平台在主进程执行（注入身份、限基址、收口超时与响应体积）。
 * 能力名 = 对象属性，方法 = 命名方法：
 *   ① 工具侧：ctx.app.http.request(…)          —— 工具执行前由平台注入
 *   ② webview 侧：window.tinkerApp.http.request(…)
 * 配置里的 secret 对应用一律掩码为 '***'（只能判断填没填，拿不到值——真值只在主进程）。
 *
 * 纯类型声明——零运行时。
 */

/** 能力调用失败码（错误对象上的 code——调用方可据此分流） */
export type CapabilityErrorCode =
  /** 平台没有这个能力（id 写错 / 未注册） */
  | 'UNKNOWN_CAPABILITY'
  /** 该注入面不允许调用这个能力 */
  | 'SURFACE_DENIED'
  /** 能力所需的配置项没填（先去应用设置里补齐） */
  | 'MISSING_CONFIG'
  /** 入参不合法（含越界——如 http 只允许打应用自己的基址） */
  | 'BAD_REQUEST'
  /** 目标服务返回错误 / 网络失败 */
  | 'UPSTREAM_ERROR';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** 代发请求入参 */
export interface HttpRequest {
  /** 相对应用基址的路径（绝对地址与 //host 会被宿主拒绝） */
  path: string;
  /** 默认 GET */
  method?: HttpMethod;
  /** 对象 → JSON、字符串原样 */
  body?: unknown;
  /** 追加请求头（平台保留头会被忽略——不可冒名） */
  headers?: Record<string, string>;
  /** 超时毫秒（1000–60000，默认 15000） */
  timeoutMs?: number;
}

/** 代发请求响应 */
export interface HttpResponse {
  status: number;
  ok: boolean;
  contentType: string;
  /** 响应体文本（超 200000 字符已截断） */
  body: string;
}

/**
 * 平台能力清单（能力名 = 属性名）
 *
 * 新增能力 = 这里多一个属性——应用既有的调用一行都不用改。
 */
export interface AppCapabilities {
  /** 代发 HTTP 请求（限应用自己的基址；平台注入 X-TinkerDesk-App / X-TinkerDesk-Token） */
  http: {
    request(input: HttpRequest): Promise<HttpResponse>;
  };
}

/** 应用可见配置（键由应用 manifest 的 configSchema 声明；secret 已掩码为 '***'） */
export type AppConfig = Record<string, unknown>;

/** 某个已注册能力的信息 */
export interface CapabilityInfo {
  id: string;
  title: string;
}

/** 工具侧应用上下文（ctx.app——仅 app_<appId>_* 工具带） */
export interface AppSdk extends AppCapabilities {
  appId: string;
  config: AppConfig;
}

/** webview 侧 SDK（window.tinkerApp——平台 guest preload 注入，应用无法绕过） */
export interface TinkerAppSdk extends AppSdk {
  /** 通知平台页面已就绪 */
  ready(): void;
  /** 平台对本应用开放的能力清单 */
  listCapabilities(): Promise<CapabilityInfo[]>;
}

declare global {
  interface Window {
    /** 代发请求等平台能力（应用不感知平台内部实现） */
    tinkerApp: TinkerAppSdk;
  }
}
