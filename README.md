# AI智能桌宠 - 桌面情感陪伴产品

[![Product Vision](https://img.shields.io/badge/Product-Vision-%23667eea)](docs/prd.md)
[![Tech Design](https://img.shields.io/badge/Tech-Design-%23764ba2)](docs/tech-design.md)
[![Market Analysis](https://img.shields.io/badge/Market-Analysis-%23f093fb)](docs/market-analysis.md)
[![Roadmap](https://img.shields.io/badge/Roadmap-2026-%234facfe)](docs/roadmap.md)

---

## 🌟 项目简介

AI智能桌宠是一款基于 **Electron + Vue3** 开发的桌面情感陪伴应用，致力于为用户提供一个可爱、智能的虚拟宠物伙伴。通过整合**大语言模型(LLM)**、**多模态AI**和**情感计算**技术，打造兼具娱乐性与实用性的新一代桌面AI助手。

**产品愿景**：成为用户桌面上最贴心的AI情感陪伴伙伴，通过自然对话、情感理解和智能服务，为用户创造温暖、有趣、高效的数字生活体验。

---

## ✨ 核心功能特性

### 🐱 情感陪伴系统
- 可爱的2D桌面宠物形象，支持多种情绪状态（开心、难过、困倦、思考）
- 丰富的动画效果（弹跳、挥手、思考气泡）
- 智能情感感知，根据用户情绪做出相应回应
- 主动问候机制，根据时间和使用习惯发起互动

### 💬 多模型AI对话
- **云端模型**：支持 OpenAI GPT-4、Anthropic Claude
- **本地模型**：支持 Ollama（Llama 3、Qwen 等）
- 智能降级策略，离线环境自动切换本地模式
- 上下文记忆，支持多轮对话

### 🎨 多模态交互
- **语音识别**：基于 Whisper API 实现语音转文字
- **语音合成**：支持 ElevenLabs 自然语音
- **图片生成**：DALL-E 3 API 文本生成图片
- 支持文字、语音、图像多模态交互

### 📅 效率工具集成
- 待办任务管理（优先级标记、完成追踪）
- 日程安排与智能提醒
- 学习助手（资料查询、学习建议）
- 用户记忆系统（个性化服务）

---

## 🛠 技术架构

### 技术栈

| 层次 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 桌面框架 | Electron | 28.x | 跨平台桌面应用 |
| UI框架 | Vue | 3.x | 响应式前端框架 |
| 构建工具 | Vite | 6.x | 快速构建 |
| AI服务 | OpenAI API | - | GPT-4、DALL-E 3 |
| 本地LLM | Ollama | 0.4.x | 隐私保护、离线可用 |
| 语音识别 | Whisper | 2.x | 开源语音转文字 |
| 数据存储 | SQLite | - | 本地数据持久化 |

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    用户层                               │
│  [桌面宠物] [聊天面板] [任务面板] [日程面板] [设置]     │
├─────────────────────────────────────────────────────────┤
│                    UI层 (Vue3)                          │
│  [主界面] [宠物组件] [聊天组件] [功能面板]              │
├─────────────────────────────────────────────────────────┤
│                    业务逻辑层                           │
│  [对话管理器] [情感分析器] [日程管理器] [用户记忆]      │
├─────────────────────────────────────────────────────────┤
│                    AI服务层                            │
│  [LLM客户端] [语音服务] [图片生成] [情感分析]          │
│      ↓                  ↓                  ↓          │
│  [云端API]         [本地Ollama]        [Whisper]      │
├─────────────────────────────────────────────────────────┤
│                    数据层                               │
│  [SQLite存储] [用户配置] [会话历史] [加密模块]          │
└─────────────────────────────────────────────────────────┘
```

### AI技术选型策略

| 技术 | 选型 | 优势 | 适用场景 |
|------|------|------|----------|
| 大语言模型 | GPT-4 + Ollama | 云端能力强 + 本地隐私保护 | 日常对话、知识问答 |
| 多模态生成 | DALL-E 3 | 生成质量高 | 图片创作、创意激发 |
| 语音交互 | Whisper + ElevenLabs | 准确率高、语音自然 | 语音对话、学习练习 |
| 情感分析 | LLM内置 + 规则引擎 | 精准理解用户情绪 | 情感陪伴、个性化回应 |

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- npm >= 9.x
- Ollama（可选，用于本地LLM）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 配置AI模型

1. 复制 `config.example.json` 为 `config.json`
2. 配置API密钥或选择本地Ollama模式

```json
{
  "aiModel": "openai",
  "openaiApiKey": "your-api-key",
  "anthropicApiKey": "",
  "ollamaModel": "llama3"
}
```

---

## 📁 项目结构

```
AI-Pet-Companion/
├── build/                    # 构建资源
│   └── icons/               # 应用图标
├── docs/                     # 产品文档
│   ├── prd.md              # 产品需求文档
│   ├── tech-design.md      # 技术架构文档
│   ├── market-analysis.md  # 市场分析报告
│   ├── roadmap.md          # 产品路线图
│   ├── ux-journey.md       # 用户体验设计
│   └── data-analysis.md    # 数据分析方案
├── src/                      # 源代码
│   ├── components/          # Vue组件
│   │   ├── PetCharacter.vue   # 宠物角色组件
│   │   ├── ChatPanel.vue      # 聊天面板
│   │   ├── TaskPanel.vue      # 待办面板
│   │   └── SchedulePanel.vue  # 日程面板
│   ├── services/            # 服务层
│   │   ├── aiService.js       # AI服务（LLM集成）
│   │   ├── memoryService.js   # 用户记忆服务
│   │   └── scheduleService.js # 日程服务
│   └── App.vue              # 主应用组件
├── main.js                   # Electron主进程
├── index.html               # 入口HTML
├── renderer.js              # 渲染进程入口
└── package.json             # 项目配置
```

---

## 📊 核心功能说明

### 1. AI对话系统
- 支持多模型切换（OpenAI/Anthropic/Ollama）
- 智能降级机制，网络不可用时自动切换本地响应
- 上下文感知，支持多轮对话
- 情感分析与个性化回应

### 2. 用户记忆系统
- 本地SQLite数据库存储
- 会话历史持久化
- 用户偏好学习
- 数据加密保护

### 3. 桌面宠物引擎
- CSS动画实现流畅交互
- 多种情绪状态切换
- 点击、拖拽等交互反馈

### 4. 多模态能力
- 语音输入（Whisper API）
- 语音输出（ElevenLabs）
- 图片生成（DALL-E 3）

---

## 📝 产品文档

| 文档 | 描述 | 链接 |
|------|------|------|
| PRD | 产品需求文档 | [docs/prd.md](docs/prd.md) |
| 技术设计 | 技术架构说明 | [docs/tech-design.md](docs/tech-design.md) |
| 市场分析 | 竞品调研与市场策略 | [docs/market-analysis.md](docs/market-analysis.md) |
| 路线图 | 产品迭代规划 | [docs/roadmap.md](docs/roadmap.md) |
| UX设计 | 用户体验设计 | [docs/ux-journey.md](docs/ux-journey.md) |
| 数据分析 | 指标体系与分析方法 | [docs/data-analysis.md](docs/data-analysis.md) |

---

## 🎯 产品目标

### 用户增长
- **DAU目标**：≥10万
- **MAU目标**：≥50万
- **D7留存**：≥40%
- **NPS**：≥50

### 功能指标
- 对话使用率：≥90%
- 任务完成率：≥60%
- AI响应时间：≤2秒
- 错误率：≤0.1%

---

## 🔒 安全与隐私

- **数据加密**：AES-256加密本地存储
- **隐私保护**：默认本地存储，不上传云端
- **数据可控**：支持一键清除所有数据
- **匿名化**：不收集用户身份信息

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

*AI智能桌宠 - 陪伴你的每一天* 🐱💖
