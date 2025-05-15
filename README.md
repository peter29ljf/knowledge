# StudyQuest 学习平台

StudyQuest是一个基于Next.js开发的日常学习伴侣应用。用户可以访问学习材料、参与测验并获取积分。管理员可以管理学习内容、测验和公告。该应用程序还具有GenAI功能，用于内容生成（尽管在当前用户界面版本中尚未完全实现）。

## 版本

**当前版本：v0.0.5**

## 主要功能

- **用户认证：** 基于角色的登录（用户/管理员），支持密码验证
- **仪表盘：** 个性化欢迎界面、日期显示、用户积分和管理员公告
- **学习材料：** 按日期访问的每日内容
- **测验：** 每日测验，提供即时反馈和积分
- **管理员面板：**
  - 管理学习材料（添加/编辑/删除）
  - 管理测验（添加/编辑/删除）
  - 管理公告（添加/删除）
  - 查看用户消息
- **响应式设计：** 适应不同屏幕尺寸
- **样式：** 使用ShadCN UI组件和Tailwind CSS
- **GenAI集成：** 使用Genkit提供AI驱动功能（如内容生成）

## 版本更新内容

### v0.0.5
- 添加密码登录功能，提高安全性
- 用户默认凭据：用户"yoyo"（密码"100905"）、"lucas"（密码"123123"）
- 管理员默认密码："0987"
- 重构数据服务架构，改用API路由方式处理数据
- 修复服务端渲染问题，解决fs模块在客户端使用的错误
- 界面文本翻译为中文，提升用户体验
- 修复管理员面板Quick Actions按钮404错误
- 解决无限循环更新问题
- 修复水合错误和parseISO未定义错误

## 文件结构

项目遵循标准的Next.js App Router结构：

```
.
├── data/                  # 数据存储目录
│   ├── public/            # 公共数据（学习材料、测验、公告）
│   ├── system/            # 系统数据（配置、用户注册表）
│   └── users/             # 用户数据（个人资料、测验记录、消息）
├── public/                # 静态资源
├── src/
│   ├── ai/                # GenKit AI流程和配置
│   │   ├── flows/         # GenKit流程定义
│   │   ├── dev.ts         # GenKit开发服务器入口
│   │   └── genkit.ts      # GenKit全局AI对象初始化
│   ├── app/               # Next.js App Router
│   │   ├── (app)/         # 已认证用户路由（仪表盘、学习、测验）
│   │   │   ├── dashboard/
│   │   │   ├── learning/
│   │   │   └── quiz/
│   │   ├── (auth)/        # 认证路由（登录）
│   │   │   └── login/
│   │   ├── admin/         # 管理员面板路由
│   │   │   ├── announcements/
│   │   │   ├── materials/
│   │   │   ├── messages/
│   │   │   └── quizzes/
│   │   ├── api/           # API路由
│   │   │   ├── data/      # 数据API（学习材料、测验、公告等）
│   │   │   ├── init/      # 初始化API
│   │   │   └── webhook/   # Webhook API
│   │   ├── globals.css    # 全局样式和ShadCN主题
│   │   ├── layout.tsx     # 根布局
│   │   └── page.tsx       # 根页面（处理初始重定向）
│   ├── components/        # React组件
│   │   ├── admin/         # 管理员相关组件
│   │   ├── auth/          # 认证相关组件
│   │   ├── dashboard/     # 仪表盘特定组件
│   │   ├── learning/      # 学习相关组件
│   │   ├── quiz/          # 测验相关组件
│   │   └── ui/            # ShadCN UI组件
│   ├── contexts/          # React上下文提供程序（Auth, AppData）
│   ├── hooks/             # 自定义React钩子
│   └── lib/               # 工具函数和类型定义
│       ├── dataService.ts # 数据服务（通过API路由）
│       ├── initData.ts    # 数据初始化
│       ├── types.ts       # TypeScript类型定义
│       └── utils.ts       # ShadCN工具函数
├── components.json        # ShadCN UI配置
├── next.config.ts         # Next.js配置
├── package.json           # 项目依赖和脚本
├── tailwind.config.ts     # Tailwind CSS配置
└── tsconfig.json          # TypeScript配置
```

## 关键依赖

- **框架：** Next.js (@latest)
- **UI组件：** ShadCN UI, Radix UI primitives, Lucide React (图标)
- **样式：** Tailwind CSS
- **状态管理：** React Context API, `react-hook-form`
- **GenAI：** Genkit, @genkit-ai/googleai
- **工具：** date-fns, Zod (用于模式验证，主要在Genkit中)
- **数据持久化：** 本地存储 (`useLocalStorage` 钩子), API路由操作文件系统

## 开始使用

### 前置条件

- Node.js (v18或更高版本)
- npm或yarn
- Git

### 安装

1.  **克隆仓库：**
    ```bash
    git clone https://github.com/yourusername/studyquest.git
    cd studyquest
    ```

2.  **安装依赖：**
    ```bash
    npm install
    # 或
    yarn install
    ```

### 环境变量（可选）

如果计划使用带有Genkit的Google AI并有特定的API密钥，可能需要设置它们。Genkit通常寻找`GOOGLE_API_KEY`或使用应用程序默认凭据。对于此项目的当前模拟设置，除非扩展GenAI功能，否则基本操作不需要特定的GenAI环境变量。

如有需要，在项目根目录创建一个`.env.local`文件：
```env
GOOGLE_API_KEY=your_google_api_key_here
```
（注意：当前的`src/ai/genkit.ts`初始化GoogleAI插件时没有明确的API密钥，依赖于ADC或已设置的环境变量。）

## 使用方法

### 运行开发服务器

要启动Next.js开发服务器：

```bash
npm run dev
# 或
yarn dev
```
这通常会在`http://localhost:9003`上启动应用程序。

### 运行Genkit开发服务器（可选）

如果你正在使用Genkit流程并希望单独检查或测试它们（尽管在当前版本中没有面向用户的流程）：

```bash
npm run genkit:dev
# 或监视更改
npm run genkit:watch
```
这将启动Genkit开发UI，通常在`http://localhost:4000`上。

### 构建生产版本

要创建生产构建：

```bash
npm run build
# 或
yarn build
```

### 启动生产服务器

构建后，启动生产服务器：

```bash
npm run start
# 或
yarn start
```

## 项目架构详情

### 应用架构

- **前端UI**：使用Next.js App Router实现，路由分组包括(app)、(auth)和admin
- **数据服务**：通过API路由操作服务器端文件系统
- **状态管理**：使用React Context API管理全局状态
- **认证**：简单的角色和密码验证机制

### 数据处理

- **客户端数据（用户配置文件、分数）：** 使用`useLocalStorage`钩子持久化在LocalStorage中
- **应用内容（学习材料、测验、公告）：** 通过API路由在服务器端读写JSON文件
- **文件存储结构：** 数据存储在`data`目录下，分为`public`（公共数据）、`system`（系统数据）和`users`（用户数据）

### API路由

项目使用Next.js API路由处理数据操作：

- **/api/data/init**: 初始化数据存储
- **/api/data/learning-materials**: 管理学习材料
- **/api/data/quizzes**: 管理测验
- **/api/data/announcements**: 管理公告
- **/api/data/user-registry**: 管理用户注册
- **/api/data/config**: 管理系统配置
- **/api/data/clear**: 清除所有数据

### 样式

- 项目使用**Tailwind CSS**进行实用程序优先的样式设计
- **ShadCN UI**用于预构建的可访问组件
- 基础主题（颜色、圆角等）在`src/app/globals.css`中使用CSS变量配置，遵循ShadCN的主题方法

### GenAI集成

- 应用程序设置为使用**Genkit**和**Google AI (Gemini)**插件
- Genkit实例在`src/ai/genkit.ts`中配置
- AI"流程"（可能涉及LLM调用的操作序列）通常位于`src/ai/flows/`中
- 当前代码库为Genkit奠定了基础，但没有包含具体的面向用户的GenAI功能
