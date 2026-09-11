/**
 * app.ts — 应用（App）扩展类型约束
 *
 * 一个应用 = 一份前端包（manifest.json + ui/ + tools/ + skills/ + prompts/）+ 一个后端服务。
 * manifest 是平台的唯一静态声明：平台据此托管前端、装工具/技能/提示词、渲染应用设置表单。
 * 包内工具（tools/<name>/manifest.json）走工具包同一契约——见 ./tool 的 ToolPackageManifest。
 * 纯类型声明——零运行时。
 */

/** 应用配置项声明（manifest configSchema.properties 的一项；type='secret' = 令牌掩码输入） */
export interface AppConfigField {
  type?: string;
  title?: string;
  description?: string;
  default?: unknown;
  placeholder?: string;
  options?: { label: string; value: unknown }[];
}

/** 应用配置声明（manifest configSchema——required 为必填键名） */
export interface AppConfigSchema {
  required?: string[];
  properties?: Record<string, AppConfigField>;
}

/** 应用技能引用（引用包内 md——安装时拷入技能表） */
export interface AppSkillRef {
  name: string;
  path: string;
  displayName?: string;
  description?: string;
}

/** 应用提示词模块引用（引用包内 hbs——安装时拷入 prompt_modules 表） */
export interface AppPromptRef {
  name: string;
  path: string;
  displayName?: string;
  description?: string;
}

/** 应用包 manifest（tinkerdesk-app-* 包内 manifest.json） */
export interface AppManifest {
  id: string;
  name?: string;
  version?: string;
  apiVersion?: number;
  /** 包类型——应用固定 "app"（安装器据此分流到 apps 目录） */
  kind?: string;
  description?: string;
  author?: string;
  /** 前端入口（平台以 tdapp://<appId>/ 静态托管该目录） */
  ui?: { entry?: string };
  /** 后端服务基址（应用真相源——安装时预填进配置的 baseUrl 项） */
  backend?: { baseUrl?: string };
  /** 配置声明（平台据此渲染「应用设置」表单；工具经 ctx.app.config 取用） */
  configSchema?: AppConfigSchema;
  /** 职业声明（一个应用一个职业——职业 id = 应用 id） */
  vocation?: {
    displayName?: string;
    description?: string;
    /** 职业提示词模板路径（包内 hbs） */
    prompt?: string;
  };
  /** 技能声明（引用包内 md） */
  skills?: AppSkillRef[];
  /** 提示词模块声明（引用包内 hbs） */
  prompts?: AppPromptRef[];
}
