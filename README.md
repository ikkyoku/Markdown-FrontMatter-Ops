# Markdown FrontMatter Ops

VS Code 插件 - 增强 Markdown 双链与 FrontMatter 自动化管理

---

## 📋 项目概述

这是一个 VS Code 插件，为 Markdown 文档提供类似 Obsidian 的双链（Wiki Link）功能，并结合 FrontMatter YAML 配置实现智能链接自动更新。

### 核心概念

**双链（Wiki Link）**：在文档 A 中使用 `[[文档B]]` 或 `[[文档B|显示文本]]` 格式引用其他文档，点击即可跳转。

**自动链接更新**：在文档 B 中添加特殊注释标记，当满足 YAML FrontMatter 条件时，自动在文档 B 中补全反向链接。

---

## 🎯 功能需求

### 阶段一：基础双链功能（MVP）

#### 1.1 Wiki Link 识别与高亮
- 识别 `[[文档名]]` 和 `[[文档名|显示文本]]` 格式
- 语法高亮显示
- 悬停预览目标文档内容

#### 1.2 点击跳转
- 点击 `[[文档名]]` 跳转到对应文件
- 如果文件不存在，提示创建新文件
- 支持相对路径和绝对路径

#### 1.3 自动补全
- 输入 `[[` 时触发文件补全建议
- 显示匹配的文件列表
- 支持模糊搜索

### 阶段二：智能链接更新（核心功能）

#### 2.1 特殊注释标记
在目标文档中添加注释标记，表示允许自动更新链接：

```markdown
<!-- auto-link: start -->
<!-- 这里会自动插入反向链接 -->
<!-- auto-link: end -->
```

#### 2.2 YAML 条件匹配
根据 FrontMatter 条件决定是否插入链接：

```yaml
---
title: 文档B
tags: [技术, 笔记]
autoLink:
  enabled: true
  matchTags: [笔记]  # 只接收来自含 "笔记" tag 的文档链接
  exclude: [草稿]    # 排除含 "草稿" 的文档
---
```

#### 2.3 自动更新机制
当文档 A 添加 `[[文档B]]` 链接时：
1. 检查文档 B 是否存在 `<!-- auto-link -->` 标记
2. 检查文档 A 的 YAML 是否满足文档 B 的匹配条件
3. 在文档 B 的标记区域内自动添加反向链接：

```markdown
<!-- auto-link: start -->
- 被 [[文档A|文档A的标题]] 引用
<!-- auto-link: end -->
```

### 阶段三：高级功能

#### 3.1 链接面板
- 侧边栏显示当前文档的入链和出链
- 可视化链接关系图

#### 3.2 批量操作
- 批量更新所有文档的链接
- 清理失效链接
- 重构文件路径时自动更新链接

#### 3.3 模板支持
- 自定义反向链接格式模板
- 支持变量如 `{{sourceTitle}}`、`{{sourceDate}}` 等

---

## 🏗️ 技术架构

### 技术栈
- **TypeScript**：主要开发语言
- **VS Code Extension API**：插件框架
- **YAML Parser**：FrontMatter 解析
- **Markdown-it**（可选）：Markdown 解析

### 项目结构
```
markdown-frontmatter-ops/
├── .vscode/              # VS Code 调试配置
├── src/
│   ├── extension.ts      # 插件入口
│   ├── features/
│   │   ├── wikiLink.ts   # Wiki Link 核心功能
│   │   ├── autoLink.ts   # 自动链接更新
│   │   └── linkPanel.ts  # 链接面板
│   ├── utils/
│   │   ├── yamlParser.ts # YAML 解析工具
│   │   ├── fileScanner.ts# 文件扫描
│   │   └── linkDetector.ts# 链接检测
│   └── types/
│       └── index.ts      # 类型定义
├── tests/                # 测试文件
├── package.json          # 插件配置
├── tsconfig.json         # TypeScript 配置
└── README.md             # 本文件
```

### 核心模块设计

#### WikiLinkProvider
- 注册 `DocumentLinkProvider`
- 解析 `[[...]]` 语法
- 提供跳转目标

#### AutoLinkManager
- 监听文档保存事件
- 扫描文档中的 Wiki Link
- 更新目标文档的反向链接

#### YamlConfigManager
- 解析 FrontMatter
- 验证匹配条件
- 提供配置接口

---

## 📅 开发计划

### Phase 1：基础双链（预计 2-3 天）
- [ ] 项目初始化（TypeScript + VS Code Extension）
- [ ] Wiki Link 语法识别与高亮
- [ ] 点击跳转功能
- [ ] 文件补全建议

### Phase 2：自动链接更新（预计 3-5 天）
- [ ] YAML FrontMatter 解析
- [ ] 特殊注释标记识别
- [ ] 条件匹配逻辑
- [ ] 反向链接自动插入

### Phase 3：优化与测试（预计 2-3 天）
- [ ] 链接面板
- [ ] 批量操作
- [ ] 单元测试
- [ ] 性能优化

### Phase 4：发布（预计 1 天）
- [ ] 打包与发布到 VS Code Marketplace
- [ ] 编写使用文档

---

## 🎨 使用示例

### 示例 1：基础双链

**文档 A：笔记.md**
```markdown
---
title: 学习笔记
date: 2026-02-24
---

今天学习了 [[JavaScript基础]] 和 [[CSS布局]]。
```

点击 `[[JavaScript基础]]` 跳转到对应文件。

### 示例 2：自动反向链接

**文档 B：JavaScript基础.md**
```markdown
---
title: JavaScript基础
tags: [技术, 前端]
autoLink:
  enabled: true
  matchTags: [笔记]
---

# JavaScript 基础

JavaScript 是一门动态语言...

<!-- auto-link: start -->
<!-- 这里会自动插入引用本文档的其他文档链接 -->
<!-- auto-link: end -->
```

当 "笔记.md" 引用 "JavaScript基础.md" 后，自动更新为：

```markdown
<!-- auto-link: start -->
- 被 [[笔记|学习笔记]] 引用
<!-- auto-link: end -->
```

### 示例 3：YAML 条件过滤

**文档 C：草稿.md**
```markdown
---
title: 未完成的草稿
tags: [草稿]
---

参考了 [[JavaScript基础]]。
```

由于 "JavaScript基础.md" 配置了 `exclude: [草稿]`，不会生成反向链接。

---

## ⚙️ 配置选项

### 插件设置

```json
{
  "markdownFrontMatterOps.wikiLink.enabled": true,
  "markdownFrontMatterOps.wikiLink.autoComplete": true,
  "markdownFrontMatterOps.autoLink.enabled": true,
  "markdownFrontMatterOps.autoLink.marker": "<!-- auto-link: {action} -->",
  "markdownFrontMatterOps.autoLink.template": "- 被 [[{sourceFile}|{sourceTitle}]] 引用",
  "markdownFrontMatterOps.scan.exclude": ["node_modules", ".git", "dist"]
}
```

### FrontMatter 配置

```yaml
---
# 基础配置
title: 文档标题
tags: [标签1, 标签2]

# 自动链接配置
autoLink:
  enabled: true              # 是否启用自动链接
  matchTags: []              # 只接收这些标签的文档链接（空数组表示全部）
  exclude: []                # 排除这些标签的文档
  template: ""               # 自定义模板（可选）
---
```

---

## 🔧 开发环境

### 前置要求
- Node.js >= 18
- VS Code >= 1.80
- TypeScript >= 5.0

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/ikkyoku/Markdown-FrontMatter-Ops.git

# 安装依赖
npm install

# 编译
npm run compile

# 调试（在 VS Code 中按 F5）
```

### 测试

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration
```

---

## 📦 发布计划

### 版本规划

| 版本 | 功能 | 预计时间 |
|-----|------|---------|
| v0.1.0 | 基础双链功能 | 2026-03-01 |
| v0.2.0 | 自动链接更新 | 2026-03-08 |
| v0.3.0 | 链接面板 + 批量操作 | 2026-03-15 |
| v1.0.0 | 稳定版发布 | 2026-03-22 |

---

## 🤝 贡献者

- [兔兔](https://github.com/ikkyoku) - 项目发起者
- [睦月小姐](https://github.com/mutsuki) - 共同维护者
- Kimi Claw - AI 开发助手

---

## 📄 License

MIT License

---

## 💡 后续想法

- [ ] 支持图谱可视化（类似 Obsidian Graph View）
- [ ] 支持块级引用（Block Reference）
- [ ] 与 Git 集成，显示链接变更历史
- [ ] 支持其他编辑器（如 Neovim 插件）
