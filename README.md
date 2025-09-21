# FCL 下载站 (FCL.website.NEXT)

这是一个为 Fold Craft Launcher (FCL) 和 Zalith Launcher (ZL) 社区搭建的现代化、高性能下载站。它由玩家社区维护，提供 FCL 和 ZL 启动器及其相关资源（如渲染器、驱动、Java 等）的快速下载。

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
    # 目前 README 中没有定义开发服务器脚本
    # 可以使用简单的 HTTP 服务器预览静态文件
    npx serve
    ```
    这将在 `http://localhost:3000` 启动一个简单的静态文件服务器。您可以根据需要配置更复杂的开发服务器。

4.  **构建 CSS**:
    项目使用 Tailwind CSS。修改 `src/input.css` 或模板文件后，需要重新构建 CSS：
    ```bash
    npm run build
    ```
    这会将 Tailwind CSS 编译并压缩到 `dist/output.css` 文件中。

## 构建与部署

*   **构建 CSS**: 运行 `npm run build` 来生成生产环境的 CSS 文件 (`dist/output.css`)。
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
├── tailwind.config.js    # Tailwind CSS 配置
├── 网页设计指南.md        # 设计规范文档
├── todo.md               # 项目任务列表
├── QWEN.md              # Qwen Agent 上下文文件
└── README.md            # 项目说明文件 (本文件)
```

## 最近更新

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