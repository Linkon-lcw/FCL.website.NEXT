# Playwright 测试框架使用指南

## 概述
FCL Website NEXT 项目已集成 Playwright 测试框架，用于自动化测试网站功能。

## 安装状态
✅ Playwright 已安装并配置完成
✅ 测试用例已创建
✅ 运行环境已配置

## 可用命令

```bash
# 运行所有测试
npm test

# 运行核心测试（推荐）
npx playwright test tests/core.spec.js

# 运行UI模式（交互式调试）
npm run test:ui

# 调试模式运行
npm run test:debug

# 查看测试报告
npm run test:report
```

## 测试文件结构

```
tests/
├── core.spec.js          # 核心功能测试
└── homepage.spec.js      # 主页功能测试（包含更多详细测试）
```

## 测试覆盖范围

### 核心测试 (core.spec.js)
- ✅ 主页加载验证
- ✅ 主题切换功能
- ✅ 下载区域元素检测
- ✅ 移动端菜单切换（15/20 通过）

### 完整测试 (homepage.spec.js)
- ✅ 主页加载验证
- ⚠️ 导航菜单功能（部分失败）
- ✅ 主题切换功能
- ✅ 下载区域元素检测
- ⚠️ 页面导航功能（部分失败）
- ⚠️ 移动端响应式（部分失败）

## 测试配置

Playwright 配置在 `playwright.config.js` 中：
- 基础URL: http://localhost:5500
- 支持浏览器: Chromium, Firefox, WebKit
- 移动设备测试: Pixel 5, iPhone 12
- 并行测试: 启用
- 重试机制: CI环境2次重试

## 已知问题

1. **移动端菜单测试**: 需要进一步优化选择器逻辑
2. **页面导航测试**: 某些链接在移动端可能不可见
3. **响应式测试**: 需要更精确的设备模拟

## 使用建议

1. **开发阶段**: 使用 `npm run test:ui` 进行交互式调试
2. **CI/CD**: 使用 `npm test` 运行完整测试套件
3. **快速验证**: 使用 `npx playwright test tests/core.spec.js` 运行核心测试

## 添加新测试

在 `tests/` 目录下创建新的 `.spec.js` 文件，例如：

```javascript
import { test, expect } from '@playwright/test';

test.describe('新功能测试', () => {
  test('测试描述', async ({ page }) => {
    await page.goto('/');
    // 测试逻辑
  });
});
```

## 调试技巧

1. 使用 `--debug` 标志运行测试
2. 在测试代码中添加 `await page.pause()` 进行断点调试
3. 使用 `npm run test:ui` 打开交互式测试界面
4. 查看测试报告了解失败详情

## 最佳实践

1. 保持测试用例简洁明了
2. 使用语义化的选择器
3. 添加适当的等待时间
4. 测试关键用户路径
5. 定期更新测试用例