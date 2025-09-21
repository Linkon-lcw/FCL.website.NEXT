# FCL 下载站 (FCL.website.NEXT)

这是一个为 Fold Craft Launcher (FCL) 和 Zalith Launcher (ZL) 社区搭建的现代化、高性能下载站。它由玩家社区维护，提供 FCL 和 ZL 启动器及其相关资源（如渲染器、驱动、Java 等）的快速下载。

## 项目背景

本项目是对原有 FCL 下载站 (`/old` 目录) 的全面重构。原项目使用 MDUI 框架构建，存在代码老旧、性能优化不足等问题。重构目标是创建一个现代化、高性能、响应式且易于维护的网站，严格遵循《网页设计指南》的核心原则：用户中心设计、视觉清晰一致性、卓越性能（Core Web Vitals）、响应式设计和无障碍访问（WCAG 2.1 AA）。

## 核心功能

*   **多线路下载**: 提供多个下载源，确保下载的稳定性和速度。
*   **智能线路选择**: 自动检测各下载线路的延迟，并选择最快的一条作为默认下载源。
*   **设备架构检测**: 自动识别用户设备的 CPU 架构，方便用户下载对应的版本。
*   **响应式设计**: 适配桌面端和移动端，提供良好的用户体验。
*   **现代化 UI**: 使用 Tailwind CSS 和 FontAwesome 构建，界面简洁美观。
*   **可折叠面板**: 使用 ReusableCollapsiblePanel 组件实现，支持动画效果和多种配置选项。

## 技术栈

*   **HTML5**: 语义化标签构建页面结构。
*   **Tailwind CSS**: 用于快速构建自定义设计的实用优先 CSS 框架。
*   **JavaScript (ES6 Modules)**: 实现模块化、可维护的前端逻辑。
*   **FontAwesome**: 图标库，提供丰富的矢量图标。

## 架构特点

### 模块化设计
- **组件化架构**: 使用 `src/components/` 存放可复用的UI组件（如 ReusableCollapsiblePanel）
- **功能模块化**: 使用 `src/modules/` 分离不同功能模块（下载、线路检测、设备检测等）
- **页面分离**: 使用 `src/pages/` 管理不同页面的特定逻辑
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
*   `@playwright/test`: ^1.55.0 (测试框架)

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
*   **运行测试**: 使用 `npm test` 运行 Playwright 自动化测试。
*   **部署**: 这是一个纯静态网站。构建完成后，将根目录下的所有文件（`index.html`, `dist/`, `src/`, `file/` 等）部署到任何支持静态文件托管的服务上即可（例如 GitHub Pages, Netlify, Vercel, 或者传统的 FTP 服务器）。

## 目录结构

```
FCL.website.NEXT/
├── dist/                 # 构建后的静态资源目录
│   └── output.css        # Tailwind CSS 构建产物
├── file/                 # 静态资源文件（图片、数据文件等）
├── old/                  # 旧版网站代码（供参考）
├── src/                  # 源代码目录
│   ├── components/       # 可复用的 UI 组件
│   │   └── ReusableCollapsiblePanel.js  # 可折叠面板组件
│   ├── modules/          # 功能模块（下载、线路检测等）
│   ├── pages/            # 页面特定的脚本
│   ├── utils/            # 工具函数
│   ├── input.css         # Tailwind CSS 指令入口
│   └── main.js           # JavaScript 入口文件
├── index.html            # 主页
├── package.json          # 项目配置和依赖
├── postcss.config.js     # PostCSS 配置
├── playwright.config.js    # Playwright 测试配置
├── tests/                  # 测试文件目录
│   ├── core.spec.js       # 核心功能测试
│   └── homepage.spec.js   # 主页功能测试
├── PLAYWRIGHT_GUIDE.md   # Playwright 使用指南
├── 网页设计指南.md        # 设计规范文档
├── todo.md               # 项目任务列表
├── QWEN.md              # Qwen Agent 上下文文件
└── README.md            # 项目说明文件 (本文件)
```

## 最近更新

### 2025年9月 - 下载页折叠菜单动态高度修复

**问题描述：**
下载页面 (`downloads.js`) 中的折叠菜单存在 max-height 不会动态更新的问题，当面板内容发生变化时，展开动画无法正确显示全部内容。

**根本原因：**
1. 使用硬编码的 `scrollHeight` 值设置 `maxHeight`
2. 内容动态变化时未重新计算 `max-height`
3. 未使用统一的折叠组件实现

**解决方案：**
1. **实现 ResizeObserver**: 监听面板内容变化，动态调整 `max-height`
2. **增加缓冲区**: 在计算高度时增加 50px 缓冲区，确保内容完全显示
3. **限制最大高度**: 设置 2000px 的最大高度限制，防止异常内容导致布局问题
4. **动画完成后重置**: 动画完成后将 `max-height` 重置为 `none`，确保后续内容变化能正确显示

**技术改进：**
- 使用 `ResizeObserver` 替代固定高度计算
- 实现更平滑的展开/折叠动画效果
- 添加错误处理和边界条件检查
- 优化性能，避免不必要的重排和重绘

**测试验证：**
- 创建 `test-collapse-fix.html` 测试页面验证修复效果
- 测试包含动态内容变化的面板展开/折叠行为
- 验证不同内容长度下的动画效果
- 确认移动端和桌面端的兼容性

### 2025年9月 - ReusableCollapsiblePanel 组件集成

**修改内容：**
1. **新增组件**: 创建 `src/components/ReusableCollapsiblePanel.js` 可复用折叠面板组件
2. **页面更新**: 将 `src/pages/about.html` 和 `src/pages/check.html` 中的面板转换为 ReusableCollapsiblePanel 结构
3. **功能集成**: 在 `src/main.js` 中导入并初始化折叠面板组件

**技术细节：**
- 组件支持动画效果（max-height 和 opacity 过渡）
- 支持多种配置选项（如 allowMultiple 允许多个面板同时展开）
- 响应式设计，适配移动端和桌面端
- 支持嵌套面板结构

**测试验证：**
- 测试页面 `test-collapsible.html` 已验证组件功能正常
- about.html 页面中的贡献者列表面板工作正常
- check.html 页面中的文件校验信息面板工作正常

### 2025年9月 - Playwright 自动化测试框架集成

**新增功能：**
1. **测试框架**: 集成 Playwright 端到端测试框架
2. **测试配置**: 创建 `playwright.config.js` 配置文件，支持多浏览器测试
3. **测试用例**: 
   - `tests/core.spec.js`: 核心功能测试（15/20 通过）
   - `tests/homepage.spec.js`: 主页功能测试（部分通过）
4. **npm 脚本**: 添加测试相关命令（`npm test`, `npm run test:ui` 等）
5. **使用指南**: 创建 `PLAYWRIGHT_GUIDE.md` 详细文档

**测试覆盖：**
- ✅ 主页加载和基本元素检查
- ✅ 主题切换功能测试
- ✅ 下载区元素存在性验证
- ⚠️ 移动端菜单交互（部分通过）
- ⚠️ 导航链接功能（需要优化）

**已知问题：**
- 移动端菜单切换测试存在稳定性问题
- 部分导航链接测试需要进一步优化选择器

**使用说明：**
```bash
# 运行所有测试
npm test

# 打开测试 UI 界面
npm run test:ui

# 查看测试报告
npm run test:report

# 调试模式运行测试
npm run test:debug
```

**问题描述：**
下载页面 (`downloads.js`) 中的折叠菜单存在 max-height 不会动态更新的问题，当面板内容发生变化时，展开动画无法正确显示全部内容。

**根本原因：**
1. 使用硬编码的 `scrollHeight` 值设置 `maxHeight`
2. 内容动态变化时未重新计算 `max-height`
3. 未使用统一的折叠组件实现

**解决方案：**
1. **实现 ResizeObserver**: 监听面板内容变化，动态调整 `max-height`
2. **增加缓冲区**: 在计算高度时增加 50px 缓冲区，确保内容完全显示
3. **限制最大高度**: 设置 2000px 的最大高度限制，防止异常内容导致布局问题
4. **动画完成后重置**: 动画完成后将 `max-height` 重置为 `none`，确保后续内容变化能正确显示

**技术改进：**
- 使用 `ResizeObserver` 替代固定高度计算
- 实现更平滑的展开/折叠动画效果
- 添加错误处理和边界条件检查
- 优化性能，避免不必要的重排和重绘

**测试验证：**
- 创建 `test-collapse-fix.html` 测试页面验证修复效果
- 测试包含动态内容变化的面板展开/折叠行为
- 验证不同内容长度下的动画效果
- 确认移动端和桌面端的兼容性