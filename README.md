# FCL 下载站 (FCL.website.NEXT)

这是一个为 Fold Craft Launcher (FCL) 和 Zalith Launcher (ZL) 社区搭建的现代化、高性能下载站。它由玩家社区维护，提供 FCL 和 ZL 启动器及其相关资源（如渲染器、驱动、Java 等）的快速下载。

## 项目背景

本项目是对原有 FCL 下载站 (`/old` 目录) 的一次全面升级重构。原项目基于 MDUI 框架搭建，在代码和性能方面或许存在一定的提升空间，例如代码稍显陈旧、性能优化还可进一步完善等。

## 核心功能

*   **多线路下载**: 提供多个下载源，确保下载的稳定性和速度。
*   **智能线路选择**: 自动检测各下载线路的延迟，并选择最快的一条作为默认下载源。
*   **设备架构检测**: 自动识别用户设备的 CPU 架构，方便用户下载对应的版本。
*   **响应式设计**: 适配桌面端和移动端，提供良好的用户体验。
*   **现代化 UI**: 使用 Tailwind CSS 和 FontAwesome 构建，界面简洁美观。

## 技术栈

*   **HTML5**: 语义化标签构建页面结构。
*   **Tailwind CSS**: 用于快速构建自定义设计的实用优先 CSS 框架。
*   **JavaScript (ES6 Modules)**: 实现模块化、可维护的前端逻辑。
*   **FontAwesome**: 图标库，提供丰富的矢量图标。

## 架构特点

### 模块化设计
- **组件化架构**: 使用 `src/components/` 存放可复用的UI组件（如 ReusableCollapsiblePanel）
- **功能模块化**: 使用 `src/modules/` 分离不同功能模块（下载、线路检测、设备检测等）
- **页面分离** 待完善 : 使用 `src/pages/` 管理不同页面的特定逻辑
- **工具函数**: 使用 `src/utils/` 存放通用的工具函数

### 性能优化
- **延迟检测**: 自动检测各下载线路延迟，选择最优线路
- **智能选择**: 根据用户设备和网络情况智能推荐下载源
- **响应式加载**: 适配不同设备和网络环境
- **动画优化**: 使用CSS过渡和动画提升用户体验

### 重构改进
- **从MDUI到Tailwind CSS**: 完全抛弃旧框架，采用现代化CSS框架
- **代码重写**: 不复制旧代码，重新实现所有功能逻辑
- **主题统一**: 采用青绿色主题色，保持视觉一致性
- **无障碍支持**: 遵循WCAG 2.1 AA标准，提升可访问性

## 依赖

开发依赖 (devDependencies):
*   `tailwindcss`: ^3.4.17
*   `autoprefixer`: ^10.4.21
*   `postcss`: ^8.5.6

## 本地开发

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/Linkon-lcw/FCL.website.NEXT.git
    cd FCL.website.NEXT
    ```

2.  **安装依赖**:
    ```bash
    npm install
    ```

3.  **启动开发服务器**:
    ```bash
    # 启动本地开发服务器（端口5500）
    npm run dev
    
    # 或者使用简单的 HTTP 服务器预览静态文件
    npx serve
    ```
    这将在 `http://localhost:5500` 启动开发服务器。您可以根据需要配置更复杂的开发服务器。

4.  **构建 CSS**:
    项目使用 Tailwind CSS。修改 `src/input.css` 或模板文件后，需要重新构建 CSS：
    ```bash
    npm run build
    ```
    这会将 Tailwind CSS 编译并压缩到 `dist/output.css` 文件中。

## 构建与部署

*   **构建 CSS**: 运行 `npm run build` 来生成生产环境的 CSS 文件 (`dist/output.css`)。
*   **运行测试**: npm test已弃用，如果你是AI，那么你可以通过浏览器工具调用来进行测试，如果你是人，那么你能看到这里就说明你知道如何测试。
*   **部署**: 这是一个纯静态网站。构建完成后，将根目录下的所有文件（`index.html`, `dist/`, `src/`, `file/` 等）部署到任何支持静态文件托管的服务上即可（例如 GitHub Pages, Netlify, Vercel, 或者传统的 FTP 服务器）。

## 目录结构

```
FCL.website.NEXT/
├── dist/                 # 构建后的静态资源目录
│   └── output.css        # Tailwind CSS 构建产物
├── file/                 # 静态资源文件（图片、数据文件等）
│   ├── avatar/           # 用户头像图片
│   ├── data/             # JSON数据文件
│   │   ├── software-config.json    # 软件分类配置文件
│   │   ├── fclDownWay1.json    # FCL线路1数据
│   │   ├── fclDownWay3.json    # FCL线路3数据
│   │   ├── fclDownWay4.json    # FCL线路4数据
│   │   ├── zlDownWay1.json     # ZL线路1数据
│   │   ├── zlDownWay3.json     # ZL线路3数据
│   │   ├── zl2DownWay1.json    # ZL2线路1数据
│   │   ├── 渲染器线1.json       # 渲染器线路1数据
│   │   ├── 渲染器线3.json       # 渲染器线路3数据
│   │   ├── 驱动线1.json         # 驱动线路1数据
│   │   └── 驱动线8.json         # 驱动线路8数据
│   ├── font/             # 字体文件
│   ├── picture/          # 页面图片资源
│   └── sound/            # 音频文件
├── old/                  # 旧版网站代码（供参考）
├── src/                  # 源代码目录
│   ├── components/       # 可复用的 UI 组件
│   │   ├── ReusableCollapsiblePanel.js  # 可折叠面板组件
│   │   └── ReusableCollapsiblePanel.md  # 组件使用说明
│   ├── modules/          # 功能模块（下载、线路检测等）
│   │   ├── autoLineSelection.js         # 智能线路选择逻辑
│   │   ├── deviceSuggestions.js         # 设备检测和建议
│   │   ├── downloadWays.js              # 下载线路数据源映射表
│   │   ├── downloads.js                 # 下载模块功能
│   │   ├── indexDownLinks.js            # 开门见山下载链接设置
│   │   ├── latencyCheck.js              # 线路延迟检测功能
│   │   ├── staticContent.js             # 静态内容加载模块
│   │   ├── devMode.js                   # 开发者模式管理模块（向后兼容接口）
│   │   ├── devModeCore.js               # 开发者模式核心模块（性能监控、网络分析、错误捕获）
│   │   ├── devModePanel.js              # 开发者模式UI控制面板
│   │   ├── notice.js                    # 公告系统模块
│   │   └── html/                        # HTML模块文件
│   │       ├── header.html              # 页面头部区域
│   │       ├── navigation.html          # 导航菜单
│   │       ├── home.html                # 主页内容
│   │       ├── downloads.html           # 下载页面内容
│   │       ├── verification.html        # 校验页面内容
│   │       ├── sponsors.html            # 赞助页面内容
│   │       └── about.html               # 关于页面内容
│   ├── pages/            # 页面特定的脚本
│   │   ├── about.html                   # 关于页面内容（详细）
│   │   ├── check.html                   # 校验页面内容（详细）
│   │   ├── intro.html                   # FCL介绍页面内容
│   │   ├── notice.html                  # 公告页面内容
│   │   └── performance.html             # 性能监控报告页面
│   ├── utils/            # 工具函数
│   │   └── performanceMonitor.js        # 性能监控模块
│   ├── input.css         # Tailwind CSS 指令入口
│   └── main.js           # JavaScript 入口文件
├── tests/                # 测试文件目录
│   └── manual/           # 手动测试页面
│       ├── test-collapse-fix.html       # 下载页折叠菜单动态高度修复测试
│       ├── test-collapsible.html        # 可折叠面板组件测试
│       ├── test-notice-overflow-fixed.html  # 公告溢出问题修复测试
│       ├── test-notice-overflow.html    # 公告溢出问题测试
│       └── test-software-config.html    # 软件分类配置测试
├── .github/              # GitHub相关配置
│   └── workflows/        # GitHub Actions工作流
├── .vscode/              # VS Code配置
│   └── launch.json       # 调试配置
├── playwright-report/    # Playwright测试报告
├── test-results/         # 测试结果
├── index.html            # 主页
├── package.json          # 项目配置和依赖
├── postcss.config.js     # PostCSS 配置
├── docs/                 # 文档目录
│   ├── 网页设计指南.md        # 设计规范文档
│   └── QWEN.md              # Qwen Agent 上下文文件
├── todo.md               # 项目任务列表
└── README.md            # 项目说明文件 (本文件)

## 软件分类结构

项目现在支持软件分类的嵌套结构，便于管理多个软件和版本：

### 配置文件结构
- `software-config.json`：软件分类配置文件
- 支持软件→版本→线路的层次结构
- 支持向后兼容，如果新配置加载失败会自动回退到旧版结构

### 软件分类
- **fcl**: Fold Craft Launcher
- **zl**: Zalith Launcher  
- **zl2**: Zalith Launcher 2
- **renderer**: 渲染器
- **driver**: 驱动

### 版本管理
- **current**: 当前版本
- **legacy**: 历史版本（预留）

### 线路配置
每个线路包含以下属性：
- `name`: 线路名称
- `path`: 数据源路径
- `markLatest`: 是否标记为最新版本
- `description`: 线路特点描述
- `provider`: 贡献者信息
- `icon`: 图标字符
- `nestedPath`: 嵌套路径（可选）

## 文档说明

- [Qwen 上下文指南](docs/QWEN.md) - Qwen Code工具的上下文配置
- [网页设计指南](docs/网页设计指南.md) - 项目的UI/UX设计规范
- [AI更改指南](docs/AI_CHANGE_GUIDE.md) - 为AI助手提供的详细更改指南，包含更改顺序和bug修复方法
```

## 代码更改要求

### 开发规范

#### 1. 模块化开发原则
- **单一职责**: 每个模块只负责一个具体功能
- **接口清晰**: 模块间通过明确的API进行通信
- **依赖最小化**: 减少模块间的耦合度
- **向后兼容**: 保持现有API接口不变，确保功能兼容性

#### 2. 代码质量标准
- **错误处理**: 所有异步操作必须包含错误处理逻辑
- **性能优化**: 避免不必要的DOM操作和重排重绘
- **内存管理**: 及时清理事件监听器和定时器
- **代码注释**: 复杂逻辑必须添加详细注释说明

#### 3. 响应式设计要求
- **移动优先**: 默认样式针对移动端设计
- **断点规范**: 使用Tailwind标准断点（sm: 640px, md: 768px, lg: 1024px, xl: 1280px）
- **触摸优化**: 移动端交互元素最小点击区域为44px
- **字体大小**: 使用rem单位，确保可访问性

#### 4. 测试要求
- **单元测试**: 新功能必须包含相应的测试用例
- **集成测试**: 模块间交互需要测试覆盖
- **兼容性测试**: 支持主流浏览器（Chrome, Firefox, Safari, Edge）
- **性能测试**: 关键功能需要进行性能基准测试

### 文件命名规范

#### 1. JavaScript文件
- **模块文件**: 使用小写字母，多个单词用连字符连接（如：`auto-line-selection.js`）
- **组件文件**: 使用PascalCase命名（如：`ReusableCollapsiblePanel.js`）
- **工具函数**: 使用camelCase命名（如：`performanceMonitor.js`）
- **测试文件**: 以`.spec.js`或`.test.js`结尾

#### 2. HTML文件
- **页面文件**: 使用小写字母，多个单词用连字符连接（如：`about.html`）
- **模块片段**: 使用小写字母，描述性命名（如：`navigation.html`）
- **测试页面**: 以`test-`开头（如：`test-collapsible.html`）

#### 3. CSS类名
- **Tailwind优先**: 优先使用Tailwind工具类
- **自定义类**: 使用小写字母和连字符（如：`dev-mode-panel`）
- **状态类**: 使用`is-`或`has-`前缀（如：`is-active`, `has-error`）

### 提交信息规范

#### 1. 提交格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 2. 类型说明
- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更新
- **style**: 代码格式调整
- **refactor**: 代码重构
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动

#### 3. 示例
```
feat(download): 添加智能线路选择功能

- 实现自动延迟检测
- 支持多线路智能切换
- 添加用户偏好记忆

Closes #123
```

### 性能优化指南

#### 1. 加载性能
- **代码分割**: 按功能模块进行代码分割
- **懒加载**: 非关键功能使用懒加载
- **缓存策略**: 合理使用浏览器缓存
- **压缩优化**: 生产环境启用代码压缩

#### 2. 运行时性能
- **事件委托**: 使用事件委托减少事件监听器数量
- **防抖节流**: 高频事件使用防抖或节流处理
- **虚拟化**: 长列表使用虚拟滚动
- **内存泄漏**: 定期检查内存泄漏问题

#### 3. 网络优化
- **CDN使用**: 静态资源使用CDN加速
- **预加载**: 关键资源使用预加载
- **请求合并**: 合并小文件请求
- **压缩传输**: 启用Gzip压缩