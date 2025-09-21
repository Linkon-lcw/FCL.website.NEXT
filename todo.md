# FCL Website NEXT - 任务清单

## 项目概述
FCL (Furnace Craft Launcher) 下载站 - 为 Fold Craft Launcher (FCL) 和 Zalith Launcher (ZL) 社区搭建的现代化、高性能下载站。由玩家社区维护，提供 FCL 和 ZL 启动器及其相关资源（如渲染器、驱动、Java 等）的快速下载。

## 当前状态
- ✅ 项目结构已建立
- ✅ 基础文件已创建
- 🔄 开发进行中

## 待办事项

### 历史任务

2025/9/22 [x] 安装Playwright测试框架 ✅
- [x] 安装Playwright依赖
- [x] 配置Playwright环境
- [x] 验证安装是否成功

2025/9/22 [x] 2025/9/22 修复下载页折叠菜单max-height不会更新的问题 ✅
- [x] 查看ReusableCollapsiblePanel组件的实现
- [x] 查看下载页面的HTML结构
- [x] 修改download.js



### 低优先级任务
- [ ] 代码重构和优化
- [ ] 添加测试用例
- [ ] 文档完善
- [ ] 完善页面组件
- [ ] 添加新的功能模块
- [ ] 优化用户体验

### 下一步建议
- [ ] 考虑将下载页的折叠逻辑迁移到 ReusableCollapsiblePanel 组件
- [ ] 添加更多自动化测试用例
- [ ] 优化移动端折叠面板的用户体验
- [ ] 考虑添加面板状态的本地存储功能

## 最近完成的任务
- [x] 初始化todo.md文件

## 操作记录

### 2025年9月
- **初始化**: 创建todo.md文件，建立任务管理体系
- **项目调研**: 阅读README.md，了解项目核心功能和技术栈
  - 核心功能：多线路下载、智能线路选择、设备架构检测、响应式设计
  - 技术栈：HTML5、Tailwind CSS、JavaScript ES6 Modules、FontAwesome
  - 最新更新：2025年9月集成了ReusableCollapsiblePanel组件
- **功能分析**: 深入分析现有功能模块
  - **下载模块** (`downloads.js`): 支持多线路下载，可折叠面板展示版本和架构
  - **智能线路选择** (`autoLineSelection.js`): 自动检测延迟并选择最快线路
  - **设备建议** (`deviceSuggestions.js`): 设备架构检测和Minecraft相关建议
  - **性能监控** (`performanceMonitor.js`): 性能指标收集和分析
  - **可复用组件** (`ReusableCollapsiblePanel.js`): 通用折叠面板组件
- **问题修复**: 修复下载页折叠菜单max-height不会更新的问题
  - 问题原因: 使用硬编码的scrollHeight，内容动态变化时max-height未更新
  - 解决方案: 实现更robust的折叠机制，使用ResizeObserver监听内容变化
  - 改进点: 增加50px缓冲区，限制最大高度2000px，动画完成后重置为auto

---

## 开发规范
1. 每次修改前先阅读相关文档
2. 修改后及时更新todo.md
3. 分步骤执行，避免一次性大量修改
4. 注意Windows/Linux系统兼容性
5. 使用相对路径

## 项目状态总结
✅ **已完成**: 项目初始化、功能模块分析
🔄 **进行中**: 代码结构优化
📋 **待开始**: 功能优化、用户体验改进